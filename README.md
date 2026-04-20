# معارضنا

منصة عربية لإدارة المعارض الفنية في مدرسة `البلد الأمين`.

## ما الذي تم بناؤه؟

- واجهة `Next.js` عربية باتجاه `RTL`
- صفحات أساسية: `/`, `/student`, `/teacher`, `/admin`, `/submissions/[id]`
- طبقة بيانات متصلة بـ `Supabase` عند توفر المفاتيح مع fallback محلي
- مخطط قاعدة بيانات أولي داخل `supabase/schema.sql`
- بيانات تجريبية لتوضيح رحلة الطالب والمعلم والمشرف
- دخول طالب باسم مستخدم وكلمة مرور مع إمكانية إنشاء الحساب ذاتياً
- دخول معلم باسم مستخدم وكلمة مرور
- رفع ملفات إلى `Supabase Storage`

## التشغيل

```bash
npm install
npm run dev
```

## الربط الفعلي

1. انسخ `.env.example` إلى `.env`
2. أضف:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` أو `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
3. أنشئ الجداول باستخدام `supabase/schema.sql`
4. إذا كانت الجداول أُنشئت مسبقاً، نفذ أيضاً `supabase/student-self-signup.sql`
5. أنشئ bucket للملفات في Supabase Storage
6. أضف `SESSION_SECRET` محلياً
7. يمكن للطالب إنشاء حسابه بنفسه من الصفحة الرئيسية
8. إذا أردت بيانات تجريبية للمعلم، نفذ `supabase/demo-teacher-passwords.sql`

## الوضع الحالي

- إذا كانت مفاتيح الخادم موجودة: الصفحات تقرأ من Supabase
- إذا كانت مفاتيح المتصفح فقط موجودة: تسجيل الدخول والرفع يعملان، والبيانات تبقى تجريبية
- إذا لم توجد مفاتيح: التطبيق يبقى في وضع mock بالكامل

## بيانات تجريبية

- المعلم:
  - `waleed1 / 12345`
  - `hanaa1 / 12345`
- الطلاب في الوضع mock:
  - `sara101 / 12345678`
  - `reem202 / 12345678`
  - `lama303 / 12345678`
