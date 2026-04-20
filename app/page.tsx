import Link from "next/link";
import { Shell } from "@/components/shell";
import { SummaryCard } from "@/components/summary-card";
import { StudentLoginForm } from "@/components/student-login-form";
import { TeacherLoginForm } from "@/components/teacher-login-form";
import { getDataset } from "@/lib/data";
import { getSupabaseMode } from "@/lib/supabase";
import { getDemoStudentCredentials, getDemoTeacherCredentials } from "@/lib/student-auth";

export default async function HomePage() {
  const dataset = await getDataset();
  const mode = getSupabaseMode();
  const showDemoHelp = mode === "mock";

  return (
    <Shell
      title="منصة معارضنا"
      subtitle="مكان بسيط وواضح لرفع ملفات المعرض ومراجعتها داخل مدرسة البلد الأمين."
    >
      <section className="grid-3">
        <SummaryCard label="عدد الطلاب" value={dataset.users.filter((user) => user.role === "student").length} hint="طلاب مفعلون في النظام" icon="👩‍🎨" />
        <SummaryCard label="الجولات" value={dataset.submissionRounds.length} hint="جولة رفع ومراجعة مفتوحة" icon="🗂️" />
        <SummaryCard label="المعلمون" value={dataset.users.filter((user) => user.role === "teacher").length} hint="معلم واحد يكفي للمتابعة الآن" icon="🧑‍🏫" />
      </section>

      <section className="grid-2" style={{ marginTop: 18 }}>
        <article className="card">
          <div className="section-head">
            <div>
              <h2>كيف تستخدم المنصة؟</h2>
              <p>الطلاب والمعلمون يدخلون باسم المستخدم وكلمة المرور. المشرف ما زال عبر الاختيار السريع حالياً.</p>
            </div>
          </div>
          <div className="simple-steps">
            <div className="step-card">
              <strong>1. الطالب</strong>
              <p>يكتب اسم المستخدم وكلمة المرور ثم يرفع ملفاته.</p>
            </div>
            <div className="step-card">
              <strong>2. المعلم</strong>
              <p>يسجل دخوله ثم يرى كل الأعمال مباشرة ويكتب الدرجة والملاحظة.</p>
            </div>
            <div className="step-card">
              <strong>3. الانتهاء</strong>
              <p>بعد الرفع أو المراجعة تنتهي الخطوات دون صفحات إضافية معقدة.</p>
            </div>
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h2>اختر الصفحة</h2>
              <p>الوضع الحالي: {mode === "live" ? "بيانات حقيقية من Supabase" : mode === "auth-only" ? "رفع مباشر بدون قراءة كاملة" : "تجريبي ببيانات محلية"}.</p>
            </div>
          </div>
          <div className="simple-steps">
            <Link className="role-card role-student" href="/student">
              <strong>صفحة الطالب</strong>
              <span>رفع الملفات بخطوات بسيطة</span>
            </Link>
            <Link className="role-card role-teacher" href="/teacher">
              <strong>صفحة المعلم</strong>
              <span>مراجعة الأعمال وإضافة الدرجات</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="grid-3" style={{ marginTop: 18 }}>
        <div style={{ gridColumn: "span 2" }}>
          <StudentLoginForm showDemoHelp={showDemoHelp} demoCredentials={getDemoStudentCredentials()} />
        </div>
        <TeacherLoginForm showDemoHelp={showDemoHelp} demoCredentials={getDemoTeacherCredentials()} />
      </section>

      <section className="card" style={{ marginTop: 18 }}>
          <div className="section-head">
            <div>
              <h2>ملاحظة مهمة</h2>
              <p>حتى يعمل دخول الطالب والمعلم في Supabase يجب إضافة اسم المستخدم وكلمة المرور المشفرة داخل قاعدة البيانات.</p>
            </div>
          </div>
        <p className="helper-copy">
          إذا كانت قاعدة البيانات قد أُنشئت قبل هذا التحديث، نفذ ملفات التحديث ثم أعد تشغيل الموقع.
        </p>
      </section>

      <section className="table-card" style={{ marginTop: 18 }}>
        <div className="section-head">
          <div>
            <h2>لقطة سريعة من النشاط الحالي</h2>
            <p>يعرض هذا الجدول ملخصاً سريعاً لما داخل النظام حالياً.</p>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>المؤشر</th>
              <th>القيمة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>إجمالي التسليمات</td>
              <td>{dataset.submissions.length}</td>
            </tr>
            <tr>
              <td>ملفات تحتاج مراجعة</td>
              <td>{dataset.submissions.filter((submission) => submission.status !== "approved").length}</td>
            </tr>
            <tr>
              <td>هوية المشروع</td>
              <td>سيتم إضافة شعار المدرسة لاحقاً دون تغيير البنية.</td>
            </tr>
          </tbody>
        </table>
      </section>
    </Shell>
  );
}
