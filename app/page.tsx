import Link from "next/link";
import { Shell } from "@/components/shell";
import { SummaryCard } from "@/components/summary-card";
import { StudentLoginForm } from "@/components/student-login-form";
import { TeacherLoginForm } from "@/components/teacher-login-form";
import { getDataset } from "@/lib/data";
import { getDemoStudentCredentials, getDemoTeacherCredentials } from "@/lib/student-auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dataset = await getDataset();
  const showDemoHelp = false;

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
              <p>المنصة بسيطة: الطالب يرفع ملفاته، والمعلم يراجعها من شاشة واحدة.</p>
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
              <p>اختر الصفحة المناسبة ثم ابدأ مباشرة.</p>
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
    </Shell>
  );
}
