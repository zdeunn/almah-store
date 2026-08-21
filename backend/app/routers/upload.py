import io
import re
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from PIL import Image
from supabase import create_client, Client

router = APIRouter(prefix="/api/v1/images", tags=["Image Upload"])

# جلب المتغيرات من بيئة العمل (.env)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_STORAGE_BUCKET", "PRODUCT-IMAGES")

# التحقق من وجود المتغيرات
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("قم بضبط متغيرات البيئة SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف .env")

# إنشاء عميل Supabase باستخدام Service Role Key لتجاوز سياسات RLS أثناء الرفع
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def slugify(text: str) -> str:
    """تنظيف النص وتحويله لاسم متوافق مع معايير الـ SEO"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text


def convert_image_to_webp(file_bytes: bytes, quality: int = 80) -> bytes:
    """تحويل محتوى الصورة إلى WebP وضغطها"""
    try:
        image = Image.open(io.BytesIO(file_bytes))
        
        # التعامل مع ألوان الشفافية RGBA أو ألوان المطبوعات CMYK
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")
            
        output_stream = io.BytesIO()
        # حفظ الملف بصيغة WEBP
        image.save(output_stream, format="WEBP", quality=quality, optimize=True)
        return output_stream.getvalue()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"الملف المرفوع ليس صورة صالحة: {str(e)}"
        )


@router.post("/upload-product-image")
async def upload_product_image(
    product_slug: str = Form(..., description="اسم المنتج أو المعرف بأسلوب slug مثل: traditional-dress"),
    angle: str = Form("front", description="زاوية الصورة مثل: front, back, side, detail"),
    file: UploadFile = File(...)
):
    """
    مستقبل الصور: يحول أي صورة إلى WebP ويرفعها لـ Supabase Storage بأسمى متوافق مع SEO.
    """
    # 1. التحقق من امتداد الملف المرفوع
    allowed_extensions = (".png", ".jpg", ".jpeg", ".webp")
    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="صيغة الملف غير مدعومة. يرجى رفع صورة بصيغة PNG أو JPG أو WEBP."
        )

    # 2. قراءة الملف وتحويله إلى WebP
    file_bytes = await file.read()
    webp_bytes = convert_image_to_webp(file_bytes, quality=80)

    # 3. صياغة اسم ملف محسن للـ SEO
    # مثال الناتج: traditional-dress-front.webp
    clean_product_name = slugify(product_slug)
    clean_angle = slugify(angle)
    filename = f"{clean_product_name}-{clean_angle}.webp"
    file_path = f"products/{filename}"

    try:
        # 4. رفع الملف إلى Supabase Storage (مع إمكانية الاستبدال upsert=True)
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file_path,
            file=webp_bytes,
            file_options={
                "content-type": "image/webp",
                "upsert": "true"
            }
        )

        # 5. استخراج الرابط العام المباشر للصورة (Public URL)
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)

        return {
            "status": "success",
            "message": "تم تحويل الصورة إلى WebP ورفعها بنجاح",
            "filename": filename,
            "public_url": public_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"حدث خطأ أثناء الرفع إلى Supabase: {str(e)}"
        )