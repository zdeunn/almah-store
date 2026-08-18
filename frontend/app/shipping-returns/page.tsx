export default function ShippingReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-right" dir="rtl">
      {/* عنوان الصفحة الرئيسي */}
      <h1 className="text-3xl font-serif font-semibold mb-4 text-center text-foreground">
        الشحن والاستبدال
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto leading-relaxed">
        في ALMAH، نسعى دائماً لتقديم تجربة تسوق مريحة وسلسة. إليكِ كل ما تحتاجين معرفته حول كيفية شحن طلبكِ وسياسة الاستبدال المرنة لدينا.
      </p>

      <div className="space-y-10">
        
        {/* قسم الشحن والتوصيل */}
        <section className="border-b border-border pb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            🚚 أولاً: الشحن والتوصيل
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              • <strong>تغطية التوصيل:</strong> نوفر خدمة التوصيل السريع إلى جميع الولايات الجزائرية (58 ولاية) مباشرة حتى باب بيتكِ أو إلى مكتب شركة الشحن القريب منكِ.
            </p>
            <p>
              • <strong>مدة التوصيل:</strong>  يستغرق الشحن من 2 إلى 5 أيام عمل كحد أقصى.
            </p>
            <p>
              • <strong>الدفع عند الاستلام:</strong> لتسوق آمن ومضمون، يمكنكِ الدفع نقداً للوكيل فور استلامكِ لطلبيتكِ ومعاينتها.
            </p>
          </div>
        </section>
        {/* قسم سياسة الاستبدال */}
        {/* قسم كيفية تقديم الطلب */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            ✨ كيف أطلب استبدال قطعة؟
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            كل ما عليكِ فعله هو التوجه إلى صفحة <a href="/contact" className="text-foreground underline font-medium hover:text-foreground/80">تواصلوا معنا</a> وإرسال رسالة برقم طلبكِ والمقاس الجديد المطلوب، أو التواصل معنا مباشرة عبر حساباتنا على مواقع التواصل الاجتماعي، وسيقوم فريق خدمة العملاء بترتيب عملية الاستبدال معكِ فوراً وبكل رحابة صدر.
          </p>
        </section>

      </div>
    </div>
  )
}