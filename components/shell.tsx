import Link from "next/link";
import type { ReactNode } from "react";

interface ShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/student", label: "الطالب" },
  { href: "/teacher", label: "المعلم" },
  { href: "/admin", label: "المشرف" }
];

export function Shell({ title, subtitle, children }: ShellProps) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <div className="brand-mark">معارضنا</div>
          <p className="brand-copy">منصة تنظيم وتسليم المعارض الفنية لمدرسة البلد الأمين</p>
        </div>
        <nav className="nav-grid" aria-label="التنقل الرئيسي">
          {links.map((link) => (
            <Link key={link.href} className="nav-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="hero-card">
        <span className="eyebrow">واجهة عربية RTL</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <main>{children}</main>
    </div>
  );
}
