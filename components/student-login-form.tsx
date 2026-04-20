"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentLoginFormProps {
  showDemoHelp: boolean;
  demoCredentials?: Array<{
    name: string;
    username?: string | null;
    password: string;
  }>;
}

export function StudentLoginForm({ showDemoHelp, demoCredentials = [] }: StudentLoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("أدخل اسم المستخدم وكلمة المرور ثم اضغط دخول الطالب.");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(mode === "login" ? "/api/student-login" : "/api/student-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "تعذر تسجيل الدخول.");
      return;
    }

    router.push("/student");
    router.refresh();
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>دخول الطالب</h2>
          <p>أدخل اسم المستخدم وكلمة المرور، أو أنشئ حساباً جديداً بسرعة.</p>
        </div>
      </div>

      <div className="inline-actions" style={{ marginBottom: 14 }}>
        <button className={mode === "login" ? "primary-button" : "secondary-button"} type="button" onClick={() => setMode("login")}>
          دخول
        </button>
        <button className={mode === "signup" ? "primary-button" : "secondary-button"} type="button" onClick={() => setMode("signup")}>
          إنشاء حساب
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span className="helper-copy">اسم المستخدم</span>
          <input className="text-input" dir="ltr" value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          <span className="helper-copy">كلمة المرور</span>
          <input
            className="text-input"
            dir="ltr"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "جاري التنفيذ..." : mode === "login" ? "دخول الطالب" : "إنشاء الحساب"}
        </button>
      </form>

      <p className="helper-copy" style={{ marginTop: 14 }}>
        {message}
      </p>

      {showDemoHelp ? (
        <div className="card" style={{ marginTop: 16, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>بيانات تجريبية</h3>
          <div className="simple-steps">
            {demoCredentials.map((item) => (
              <div className="step-card" key={item.username}>
                <strong>{item.name}</strong>
                <p>اسم المستخدم: {item.username}</p>
                <p>كلمة المرور: {item.password}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
