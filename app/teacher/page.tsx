import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { Shell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { SummaryCard } from "@/components/summary-card";
import { getAppSession } from "@/lib/auth";
import { getTeacherDashboard } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";

export default async function TeacherPage({
  searchParams
}: {
  searchParams?: Promise<{ user?: string }>;
}) {
  const session = await getAppSession();
  if (!session || session.role !== "teacher") {
    return (
      <Shell
        title="صفحة المعلم"
        subtitle="تحتاج إلى تسجيل دخول المعلم أولاً."
      >
        <section className="card">
          <div className="section-head">
            <div>
              <h2>تسجيل دخول مطلوب</h2>
              <p>ارجع إلى الرئيسية وسجّل دخول المعلم باسم المستخدم وكلمة المرور.</p>
            </div>
          </div>
          <Link className="primary-button" href="/">
            العودة إلى الرئيسية
          </Link>
        </section>
      </Shell>
    );
  }

  const { teacher, cards, source } = await getTeacherDashboard(session.userId);

  if (!teacher) {
    return (
      <Shell
        title="صفحة المعلم"
        subtitle="هذا الحساب غير مرتبط ببيانات معلم صالحة بعد."
      >
        <section className="card">
          <div className="section-head">
            <div>
              <h2>لا توجد بيانات معلم</h2>
              <p>تحقق من وجود حساب المعلم وتعييناته داخل قاعدة البيانات.</p>
            </div>
          </div>
          <Link className="primary-button" href="/">
            العودة إلى الرئيسية
          </Link>
        </section>
      </Shell>
    );
  }

  return (
    <Shell
      title={`لوحة المعلم: ${teacher.displayName}`}
      subtitle="مراجعة مباشرة لكل أعمال الطلاب من شاشة واحدة، بدون تعقيد الشعب أو التوزيع."
    >
      <section className="grid-3">
        <SummaryCard label="المعلم" value={teacher.displayName} hint={teacher.username ?? "حساب المعلم"} icon="🧑‍🏫" />
        <SummaryCard label="التسليمات الظاهرة" value={cards.length} hint="كل ما رفعه الطلاب يظهر هنا مباشرة" icon="📂" />
        <SummaryCard
          label="بحاجة لتدخل"
          value={cards.filter((card) => card.submission.status !== "approved").length}
          hint="مراجعة أو تعديل أو تقييم"
          icon="🔎"
        />
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>فلاتر الواجهة</h2>
            <p>واجهة مبسطة للمعلم: الحالة واسم الطالب فقط.</p>
          </div>
          <LogoutButton />
        </div>
        <div className="grid-auto">
          <label>
            <span className="helper-copy">الحالة</span>
            <select className="secondary-button" defaultValue="all">
              <option value="all">كل الحالات</option>
              <option value="submitted">مُرسل</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="needs_revision">يحتاج تعديل</option>
              <option value="approved">معتمد</option>
            </select>
          </label>
          <label>
            <span className="helper-copy">بحث بالاسم</span>
            <input className="secondary-button" placeholder="ابحث عن الطالب" />
          </label>
        </div>
      </section>

      <section className="table-card">
        <div className="section-head">
          <div>
            <h2>التسليمات الحالية</h2>
            <p>الجدول يوضح الطالب، الجولة، حالة التسليم، والدرجة الحالية. مصدر البيانات: {source === "supabase" ? "Supabase" : "mock"}.</p>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>الطالبة</th>
              <th>الجولة</th>
              <th>الحالة</th>
              <th>الدرجة</th>
              <th>آخر تحديث</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.submission.id}>
                <td>
                  <strong>{card.student.displayName}</strong>
                  <div className="helper-copy">{card.student.email}</div>
                </td>
                <td>{card.round.title}</td>
                <td>
                  <StatusBadge status={card.submission.status} />
                </td>
                <td>{card.submission.grade ?? "لم ترصد"}</td>
                <td>{formatDate(card.submission.updatedAt)}</td>
                <td>
                  <Link className="ghost-link" href={`/submissions/${card.submission.id}`}>
                    مراجعة التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Shell>
  );
}
