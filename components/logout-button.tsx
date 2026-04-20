"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutButtonProps {
  label?: string;
}

export function LogoutButton({ label = "تسجيل الخروج" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/logout", {
      method: "POST"
    });
    router.push("/");
    router.refresh();
  }

  return (
    <button className="secondary-button" disabled={loading} onClick={handleLogout} type="button">
      {loading ? "جاري الخروج..." : label}
    </button>
  );
}
