"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Contacts" },
        { href: "/admin/templates", label: "Email Templates" },
        { href: "/admin/campaigns", label: "Email Campaigns" },
        { href: "/admin/integrations", label: "Integrations" },
        {
            href: "/admin/settings",
            label: "Settings",
            subLinks: [
                { href: "/admin/settings#security", label: "Security" },
                { href: "/admin/settings#contacts", label: "Contact Tools" },
            ]
        },
    ];

    return (
        <aside style={{
            width: "250px",
            background: "#011c16",
            padding: "2rem",
            borderRight: "1px solid #064e3b",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxShadow: "4px 0 10px rgba(0,0,0,0.3)"
        }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#10b981", marginBottom: "3rem", letterSpacing: "-0.025em" }}>Admin Console</h2>

            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <div key={link.href} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <Link
                                href={link.href}
                                style={{
                                    display: "block",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "0.5rem",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    color: isActive ? "#022c22" : "#d1fae5",
                                    background: isActive ? "#10b981" : "transparent",
                                    transition: "all 0.2s",
                                    boxShadow: isActive ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none"
                                }}
                            >
                                {link.label}
                            </Link>

                            {isActive && link.subLinks && (
                                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "2rem", gap: "0.25rem", marginBottom: "0.5rem" }}>
                                    {link.subLinks.map(sub => (
                                        <Link
                                            key={sub.href}
                                            href={sub.href}
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#10b981",
                                                textDecoration: "none",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                transition: "all 0.2s",
                                                opacity: "0.9"
                                            }}
                                        >
                                            • {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            <div style={{ marginTop: "auto", borderTop: "1px solid #064e3b", paddingTop: "1.5rem" }}>
                <Link href="/" style={{ display: "block", padding: "0.5rem 0", color: "#d1fae5", textDecoration: "none", fontSize: "0.875rem", opacity: "0.7" }}>
                    &larr; Exit Console
                </Link>
            </div>
        </aside>
    );
}
