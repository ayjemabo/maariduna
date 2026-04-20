import { NextRequest, NextResponse } from "next/server";
import { createStudentSession } from "@/lib/auth";
import { registerStudent } from "@/lib/student-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "");
    const password = String(body.password ?? "");

    const result = await registerStudent(username, password);
    await createStudentSession(result.userId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 400 }
    );
  }
}
