import { createServerSupabaseClient } from "@/lib/supabase";
import { ensureMinimumLiveData } from "@/lib/bootstrap";
import { createPasswordHash, verifyPassword } from "@/lib/auth";
import { users } from "@/lib/mock-data";
import { randomUUID } from "crypto";

type StudentAuthRow = {
  id: string;
  username: string | null;
  password_hash: string | null;
  role: "student" | "teacher" | "admin";
};

async function authenticateByRole(username: string, password: string, role: StudentAuthRow["role"]) {
  const normalized = username.trim().toLowerCase();
  const supabase = createServerSupabaseClient();

  if (supabase) {
    if (role === "teacher" || role === "admin") {
      await ensureMinimumLiveData();
    }

    const result = await supabase
      .from("profiles")
      .select("id, username, password_hash, role")
      .eq("username", normalized)
      .maybeSingle<StudentAuthRow>();

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (!result.data || result.data.role !== role || !result.data.password_hash) {
      return null;
    }

    if (!verifyPassword(password, result.data.password_hash)) {
      return null;
    }

    return { userId: result.data.id };
  }

  const demoMap: Record<StudentAuthRow["role"], Record<string, { id: string; password: string }>> = {
    student: {
      sara101: { id: "student-1", password: "12345678" },
      reem202: { id: "student-2", password: "12345678" },
      lama303: { id: "student-3", password: "12345678" }
    },
    teacher: {
      waleed1: { id: "teacher-1", password: "12345" },
      hanaa1: { id: "teacher-2", password: "12345" }
    },
    admin: {
      admin: { id: "admin-1", password: "12345" }
    }
  };

  const match = demoMap[role][normalized];
  if (!match || match.password !== password) {
    return null;
  }

  return { userId: match.id };
}

export async function authenticateStudent(username: string, password: string) {
  return authenticateByRole(username, password, "student");
}

export async function authenticateTeacher(username: string, password: string) {
  return authenticateByRole(username, password, "teacher");
}

export async function registerStudent(username: string, password: string) {
  const normalized = username.trim().toLowerCase();
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    throw new Error("التسجيل الذاتي يحتاج اتصال Supabase فعلي.");
  }

  if (!normalized || password.length < 6) {
    throw new Error("أدخل اسم مستخدم صالحاً وكلمة مرور من 6 أحرف على الأقل.");
  }

  const existing = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data?.id) {
    throw new Error("اسم المستخدم مستخدم بالفعل.");
  }

  const userId = randomUUID();
  const profileInsert = await supabase.from("profiles").insert({
    id: userId,
    email: `${normalized}@students.maariduna.local`,
    display_name: normalized,
    username: normalized,
    password_hash: createPasswordHash(password),
    role: "student"
  });

  if (profileInsert.error) {
    throw new Error(profileInsert.error.message);
  }

  const studentProfileInsert = await supabase.from("student_profiles").insert({
    user_id: userId,
    class_section_id: null,
    student_code: `STU-${Date.now()}`
  });

  if (studentProfileInsert.error) {
    throw new Error(studentProfileInsert.error.message);
  }

  return { userId };
}

export function getDemoStudentCredentials() {
  return users
    .filter((user) => user.role === "student")
    .map((user) => ({
      name: user.displayName,
      username: user.username,
      password: "12345678"
    }));
}

export function getDemoTeacherCredentials() {
  return users
    .filter((user) => user.role === "teacher")
    .map((user) => ({
      name: user.displayName,
      username: user.username,
      password: "12345"
    }));
}

export function buildPasswordHashForSql(password: string) {
  return createPasswordHash(password);
}
