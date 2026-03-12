"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "TRACKER", icon: "◉" },
  { href: "/history", label: "HISTORY", icon: "◈" },
  { href: "/history/spy", label: "SPY SATS", icon: "⬡" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="main-nav">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`nav-link ${pathname === link.href ? "nav-active" : ""}`}
        >
          <span className="nav-icon">{link.icon}</span>
          <span className="nav-label">{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
