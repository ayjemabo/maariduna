import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { Shell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { SummaryCard } from "@/components/summary-card";
import { UploadPanel } from "@/components/upload-panel";
import { getStudentSession } from "@/lib/auth";
import { getStatusLabel } from "@/lib/dashboard";
import { getStudentDashboard } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StudentPage({
  searchParams
}: {
  searchParams?: Promise<{ user?: string }>;
}) {
  const session = await getStudentSession();
  if (!session || session.role !== "student") {
    return (
      <Shell
        title="صفحة الطالب"
        subtitle="سجّل دخول الطالب أولاً ثم ارجع إلى هذه الصفحة."
      >
        <section className="card">
          <div className="section-head">
            <div>
              <h2>تسجيل دخول مطلوب</h2>
              <p>ارجع إلى الرئيسية ثم أدخل باسم المستخدم وكلمة المرور الخاصة بالطالب.</p>
            </div>
          </div>
          <Link className="primary-button" href="/">
            العودة إلى الرئيسية
          </Link>
        </section>
      </Shell>
    );
  }

  const { student, profile, entries, rounds } = await getStudentDashboard(session.userId);
  if (!student || !profile) {
    return (
      <Shell
        title="صفحة الطالب"
        subtitle="لا يوجد طالب جاهز للعرض حالياً. ارجع للرئيسية أو أنشئ حساب طالب جديد."
      >
        <section className="card">
          <div className="section-head">
            <div>
              <h2>لا توجد بيانات طالب</h2>
              <p>هذه الصفحة تحتاج حساب طالب وملف طالب داخل قاعدة البيانات.</p>
            </div>
          </div>
          <Link className="primary-button" href="/">
            العودة إلى الرئيسية
          </Link>
        </section>
      </Shell>
    );
  }

  const activeRound = rounds.find((round) => round.isOpen) ?? rounds[0];
  const latestEntry = entries.find((entry) => entry.round.id === activeRound.id) ?? entries[0];

  return (
    <Shell
      title={`مرحباً ${student.displayName}`}
      subtitle="هنا يرفع الطالب ملفات المعرض فقط. اختر الملفات ثم اضغط رفع الملفات."
    >
      <section className="grid-3">
        <SummaryCard label="الطالب" value={student.displayName || student.username || "طالب"} hint="حسابك جاهز للرفع" icon="🧑‍🎓" />
        <SummaryCard label="الجولة الحالية" value={activeRound?.title ?? "لا توجد جولة"} hint="هذه هي الجولة التي سترفع فيها الآن" icon="⏳" />
        <SummaryCard
          label="الحالة"
          value={latestEntry ? getStatusLabel(latestEntry.submission.status) : "لا يوجد رفع بعد"}
          hint={latestEntry ? "هذه آخر حالة لملفاتك" : "ابدأ برفع ملفاتك"}
          icon="📌"
        />
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>الخطوات</h2>
            <p>إذا لم يكن هذا حسابك، سجّل الخروج ثم ادخل باسم المستخدم الصحيح.</p>
          </div>
          <LogoutButton />
        </div>
        <div className="simple-steps">
          <div className="step-card">
            <strong>1. اختر ملفات أو مجلد</strong>
            <p>إذا كانت أعمالك داخل مجلد واحد، يمكنك اختياره كاملاً. ويمكن أيضاً رفع ZIP و PDF والصور وكل الملفات الأخرى.</p>
          </div>
          <div className="step-card">
            <strong>2. تأكد من ظهور أسماء الملفات</strong>
            <p>إذا ظهرت الأسماء أو مسارات المجلد في القائمة فهذا يعني أن الملفات جاهزة.</p>
          </div>
          <div className="step-card">
            <strong>3. اضغط رفع الملفات</strong>
            <p>بعد الرفع ستظهر لك رسالة نجاح.</p>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 18 }}>
        {activeRound ? (
          <UploadPanel
            submissionId={latestEntry?.submission.id}
            roundId={activeRound.id}
          />
        ) : (
          <section className="card">
            <p className="empty-state">لا توجد جولة مفتوحة للرفع حالياً.</p>
          </section>
        )}
      </div>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>آخر ما تم رفعه</h2>
            <p>يمكنك من هنا رؤية ملفاتك وحالتها الحالية.</p>
          </div>
        </div>

        <div className="submission-grid">
          {entries.map((entry) => (
            <article className="submission-card" key={entry.submission.id}>
              <div className="section-head">
                <div>
                  <h3>{entry.round.title}</h3>
                  <p className="helper-copy">آخر تحديث: {formatDate(entry.submission.updatedAt)}</p>
                </div>
                <StatusBadge status={entry.submission.status} />
              </div>

              <div className="metric-row">
                <span>عدد الملفات</span>
                <strong>{entry.files.length}</strong>
              </div>
              <div className="metric-row">
                <span>الدرجة الحالية</span>
                <strong>{entry.submission.grade ?? "بانتظار التقييم"}</strong>
              </div>
              <div className="metric-row">
                <span>آخر تعليق</span>
                <strong>{entry.comments[0]?.content ?? "لا توجد تعليقات حتى الآن"}</strong>
              </div>

              <div className="inline-actions" style={{ marginTop: 16 }}>
                <Link className="ghost-link" href={`/submissions/${entry.submission.id}`}>
                  عرض التفاصيل
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}
