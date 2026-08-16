export default function SizeGuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center" dir="rtl">
      <h1 className="text-3xl font-serif font-semibold mb-6 text-foreground">دليل المقاسات</h1>
      <p className="text-muted-foreground mb-8">
        الرجاء مراجعة الجدول التالي لتحديد المقاس الأنسب لكِ. القياسات مأخوذة بالسنتيمتر (cm).
      </p>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm text-muted-foreground">
          <thead className="bg-secondary text-foreground font-semibold">
            <tr>
              <th className="py-3 px-4">المقاس</th>
              <th className="py-3 px-4">المحيط (الصدر)</th>
              <th className="py-3 px-4">الخصر</th>
              <th className="py-3 px-4">الورك</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-secondary/25">
              <td className="py-3 px-4 font-bold text-foreground">S</td>
              <td className="py-3 px-4">84-88</td>
              <td className="py-3 px-4">66-70</td>
              <td className="py-3 px-4">90-94</td>
            </tr>
            <tr className="hover:bg-secondary/25">
              <td className="py-3 px-4 font-bold text-foreground">M</td>
              <td className="py-3 px-4">88-92</td>
              <td className="py-3 px-4">70-74</td>
              <td className="py-3 px-4">94-98</td>
            </tr>
            <tr className="hover:bg-secondary/25">
              <td className="py-3 px-4 font-bold text-foreground">L</td>
              <td className="py-3 px-4">92-96</td>
              <td className="py-3 px-4">74-78</td>
              <td className="py-3 px-4">98-102</td>
            </tr>
            <tr className="hover:bg-secondary/25">
              <td className="py-3 px-4 font-bold text-foreground">XL</td>
              <td className="py-3 px-4">96-100</td>
              <td className="py-3 px-4">78-82</td>
              <td className="py-3 px-4">102-106</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}