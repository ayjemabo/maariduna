import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase";

const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "student-submissions";

type EnsureSubmissionInput = {
  studentProfileId: string;
  roundId: string;
};

type RegisterFileInput = {
  submissionId: string;
  name: string;
  kind: "zip" | "pdf" | "image" | "document";
  sizeBytes: number;
  storagePath: string;
};

type ReviewUpdateInput = {
  submissionId: string;
  teacherId: string;
  status: "submitted" | "under_review" | "needs_revision" | "approved";
  grade: number | null;
  comment?: string;
};

function detectFileKind(name: string): RegisterFileInput["kind"] {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "zip") {
    return "zip";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    return "image";
  }

  return "document";
}

function getSafeStoragePath(submissionId: string, name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : "";
  return `${submissionId}/${Date.now()}-${crypto.randomUUID()}${extension}`;
}

export async function ensureSubmission(input: EnsureSubmissionInput) {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase server environment is not configured.");
  }

  const existing = await supabase
    .from("submissions")
    .select("id")
    .eq("student_profile_id", input.studentProfileId)
    .eq("round_id", input.roundId)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data?.id) {
    return existing.data.id;
  }

  const created = await supabase
    .from("submissions")
    .insert({
      student_profile_id: input.studentProfileId,
      round_id: input.roundId,
      status: "draft",
      submitted_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (created.error || !created.data?.id) {
    throw new Error(created.error?.message ?? "Failed to create submission.");
  }

  return created.data.id;
}

export async function registerUploadedFile(input: Omit<RegisterFileInput, "kind"> & { kind?: RegisterFileInput["kind"] }) {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase server environment is not configured.");
  }

  const payload = {
    submission_id: input.submissionId,
    name: input.name,
    kind: input.kind ?? detectFileKind(input.name),
    size_bytes: input.sizeBytes,
    storage_path: input.storagePath
  };

  const result = await supabase.from("submission_files").insert(payload);
  if (result.error) {
    throw new Error(result.error.message);
  }

  await supabase
    .from("submissions")
    .update({
      updated_at: new Date().toISOString()
    })
    .eq("id", input.submissionId);

  revalidatePath("/student");
  revalidatePath(`/submissions/${input.submissionId}`);
}

export async function uploadSubmissionFile(input: {
  submissionId: string;
  file: File;
}) {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase server environment is not configured.");
  }

  const storagePath = getSafeStoragePath(input.submissionId, input.file.name);
  const uploadResult = await supabase.storage.from(storageBucket).upload(storagePath, input.file, {
    upsert: true
  });

  if (uploadResult.error) {
    throw new Error(uploadResult.error.message);
  }

  await registerUploadedFile({
    submissionId: input.submissionId,
    name: input.file.webkitRelativePath || input.file.name,
    sizeBytes: input.file.size,
    storagePath
  });

  return storagePath;
}

export async function applyReviewUpdate(input: ReviewUpdateInput) {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase server environment is not configured.");
  }

  const updateResult = await supabase
    .from("submissions")
    .update({
      status: input.status,
      grade: input.grade,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.submissionId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  if (input.comment && input.comment.trim().length > 0) {
    const commentResult = await supabase.from("review_comments").insert({
      submission_id: input.submissionId,
      teacher_id: input.teacherId,
      content: input.comment.trim()
    });

    if (commentResult.error) {
      throw new Error(commentResult.error.message);
    }
  }

  revalidatePath("/teacher");
  revalidatePath(`/submissions/${input.submissionId}`);
}
