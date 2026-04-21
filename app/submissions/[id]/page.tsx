import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewPanel } from "@/components/review-panel";
import { Shell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { getAppSession } from "@/lib/auth";
import { getSubmissionView } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAppSession();
  const data = await getSubmissionView(id);

  if (!data) {
    notFound();
  }

  const canView =
    session?.role === "admin" ||
    session?.role === "teacher" ||
    (session?.role === "student" && session.userId === data.student.id);

  if (!canView) {
    return (
      <Shell
        title="تفاصيل التسليم"
        subtitle="يجب تسجيل الدخول بالحساب الصحيح لعرض هذه الصفحة."
      >
        <section className="card">
          <div className="section-head">
            <div>
              <h2>غير مصرح بالوصول</h2>
              <p>هذه الصفحة متاحة للطالبة نفسها أو للمعلم أو للمشرف.</p>
            </div>
          </div>
          <div className="inline-actions">
            <Link className="primary-button" href="/">
              العودة إلى الرئيسية
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell
      title={`تفاصيل تسليم ${data.student.displayName}`}
      subtitle="عرض موحد للملفات، حالة التسليم، ملاحظات المعلم، والدرجة الحالية مع بنية جاهزة للربط مع التخزين السحابي والمعاينة."
    >
      <section className="grid-3">
        <article className="summary-card">
          <div>
            <p className="summary-label">الطالبة</p>
            <strong className="summary-value">{data.student.displayName}</strong>
            <p className="summary-hint">{data.student.email}</p>
          </div>
        </article>
        <article className="summary-card">
          <div>
            <p className="summary-label">الجولة</p>
            <strong className="summary-value">{data.round.title}</strong>
            <p className="summary-hint">{data.classSection.gradeLabel}</p>
          </div>
        </article>
        <article className="summary-card">
          <div>
            <p className="summary-label">الحالة الحالية</p>
            <div style={{ marginTop: 8 }}>
              <StatusBadge status={data.submission.status} />
            </div>
            <p className="summary-hint">الدرجة: {data.submission.grade ?? "غير مرصودة"}</p>
          </div>
        </article>
      </section>

      <section className="grid-2" style={{ marginTop: 18 }}>
        <article className="card">
          <div className="section-head">
            <div>
              <h2>الملفات المرفقة</h2>
              <p>تدعم الصفحة معاينة PDF وربط التنزيل من التخزين السحابي لاحقاً.</p>
            </div>
          </div>
          <ul className="list-reset">
            {data.files.map((file) => (
              <li className="file-row" key={file.id}>
                <div>
                  <strong>{file.name}</strong>
                  <div className="helper-copy">
                    {file.kind.toUpperCase()} - {file.sizeLabel}
                  </div>
                </div>
                {file.downloadUrl ? (
                  <a className="secondary-button" href={file.downloadUrl} target="_blank" rel="noreferrer">
                    تنزيل / معاينة
                  </a>
                ) : (
                  <button className="secondary-button" type="button" disabled>
                    غير متاح
                  </button>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h2>تعليقات المعلم</h2>
              <p>كل تعليق مرتبط بزمن المراجعة ويظهر للطالب داخل الصفحة. مصدر البيانات: {data.source === "supabase" ? "Supabase" : "mock"}.</p>
            </div>
          </div>
          <div className="submission-grid">
            {data.comments.length === 0 ? (
              <p className="empty-state">لا توجد تعليقات حالياً.</p>
            ) : (
              data.comments.map((comment) => (
                <div className="comment-box" key={comment.id}>
                  <strong>{comment.teacherName}</strong>
                  <div className="helper-copy">{formatDate(comment.createdAt)}</div>
                  <p>{comment.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ marginTop: 18, padding: 18 }}>
            <div className="section-head">
              <div>
                <h3>إجراءات المراجعة</h3>
                <p>عناصر واجهة جاهزة للربط مع تحديثات الحالة والدرجة الفعلية.</p>
              </div>
            </div>
            {session?.role === "teacher" || session?.role === "admin" ? (
              <ReviewPanel
                submissionId={data.submission.id}
                defaultStatus={data.submission.status}
                defaultGrade={data.submission.grade}
              />
            ) : (
              <p className="helper-copy">تسجيل دخول المعلم مطلوب لتعديل الحالة أو الدرجة.</p>
            )}
          </div>
        </article>
      </section>

      <div className="inline-actions" style={{ marginTop: 18 }}>
        <Link className="ghost-link" href="/teacher">
          العودة إلى لوحة المعلم
        </Link>
        <Link className="ghost-link" href="/student">
          العودة إلى مساحة الطالب
        </Link>
      </div>
    </Shell>
  );
}
