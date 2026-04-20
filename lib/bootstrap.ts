import { createPasswordHash } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase";

const defaultTeacher = {
  email: "art.teacher@balad-alameen.edu",
  display_name: "وليد",
  username: "waleed1",
  password_hash: createPasswordHash("12345"),
  role: "teacher" as const
};

function getRoundDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  return dueDate.toISOString().slice(0, 10);
}

export async function ensureMinimumLiveData() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return;
  }

  const [teacherResult, roundResult] = await Promise.all([
    supabase.from("profiles").select("id").eq("role", "teacher").limit(1),
    supabase.from("submission_rounds").select("id").limit(1)
  ]);

  if (!teacherResult.data?.length) {
    await supabase.from("profiles").upsert(defaultTeacher, {
      onConflict: "email"
    });
  }

  if (!roundResult.data?.length) {
    await supabase.from("submission_rounds").insert({
      title: "معرض الأسبوع الحالي",
      due_date: getRoundDueDate(),
      is_open: true
    });
  }
}
