export function SiteFooter() {
  return (
    <footer id="about" className="border-t border-border bg-secondary/50" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        
        <div className="flex flex-col items-center gap-10">
          
          {/* قسم الشعار والوصف */}
          <div className="flex flex-col items-center text-center">
            <p className="font-serif text-2xl font-semibold tracking-[0.35em] text-foreground">
              ALMAH
            </p>
            <p className="mt-4 max-w-sm text-pretty leading-relaxed text-muted-foreground">
              أزياء نسائية عصرية، صُممت بشغف وعناية في قلب الجزائر لترافقكِ أينما كنتِ. نضمن لكِ تجربة تسوق سلسة وتوصيلاً سريعاً حتى باب بيتك.
            </p>
          </div>

          {/* القوائم */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            
            {/* قسم تسوقي معنا - تم تعديل الروابط للموسم الصيفي ☀️ */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                تسوقي معنا
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="/#collection" className="hover:text-foreground">وصلنا حديثاً</a></li>
                <li><a href="/#collection" className="hover:text-foreground">فساتين أنيقة</a></li>
                <li><a href="/#collection" className="hover:text-foreground">تنزيلات الصيف ☀️</a></li>
              </ul>
            </div>

            {/* قسم مساعدة ودعم */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                مساعدة ودعم
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="/shipping-returns" className="hover:text-foreground">الشحن والاستبدال</a></li>
                <li><a href="/size-guide" className="hover:text-foreground">دليل المقاسات</a></li>
                <li><a href="/contact" className="hover:text-foreground">تواصلوا معنا</a></li>
              </ul>
            </div>

          </div>

          {/* منصات التواصل الإجتماعي */}
          <div className="flex flex-col items-center gap-4 border-t border-border/60 pt-6 w-full max-w-xs">
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              كوني جزءاً من عائلتنا
            </h3>
            <div className="flex items-center gap-5">
              
              <a 
                href="https://instagram.com/your_username" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a 
                href="https://tiktok.com/@your_username" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>

            </div>
          </div>

          {/* حقوق الملكية */}
          <div className="mt-4 border-t border-border pt-6 w-full text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ALMAH. جميع الحقوق محفوظة.</p>
          </div>
        </div>
        
      </div>
    </footer>
  )
}