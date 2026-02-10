"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/payments", label: "Payments" },
  { href: "/records", label: "Records" },
  { href: "/stats", label: "Stats" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav" role="navigation" aria-label="Main">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          Finance
        </Link>
        <ul className="nav-links">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? "nav-link active" : "nav-link"}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
