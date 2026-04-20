import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { getDataset } from "@/lib/data";
import { ensureSubmission, registerUploadedFile } from "@/lib/live-actions";

export async function POST(request: NextRequest) {
  try {
    const session = await getAppSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ ok: false, error: "غير مصرح لك برفع الملفات." }, { status: 403 });
    }

    const body = await request.json();
    const dataset = await getDataset();
    const ownProfile = dataset.studentProfiles.find((profile) => profile.userId === session.userId);

    if (!ownProfile) {
      return NextResponse.json({ ok: false, error: "لا يوجد ملف طالب مرتبط بهذا الحساب." }, { status: 400 });
    }

    if (body.submissionId) {
      const existingSubmission = dataset.submissions.find((submission) => submission.id === body.submissionId);
      if (!existingSubmission || existingSubmission.studentProfileId !== ownProfile.id) {
        return NextResponse.json({ ok: false, error: "هذا التسليم لا يخص هذا الطالب." }, { status: 403 });
      }
    }

    const submissionId =
      body.submissionId ||
      (await ensureSubmission({
        studentProfileId: ownProfile.id,
        roundId: body.roundId
      }));

    if (body.file) {
      await registerUploadedFile({
        submissionId,
        name: body.file.name,
        sizeBytes: body.file.sizeBytes,
        storagePath: body.file.storagePath,
        kind: body.file.kind
      });
    }

    return NextResponse.json({ ok: true, submissionId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
