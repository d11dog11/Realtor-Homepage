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
        <aside style={{ width: "250px", background: "#f8fafc", padding: "2rem", borderRight: "1px solid #e5e7eb", height: "100%", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#064e3b", marginBottom: "3rem" }}>Admin Console</h2>

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
                                    borderRadius: "0.375rem",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    color: isActive ? "#2563eb" : "#4b5563",
                                    background: isActive ? "#eff6ff" : "transparent",
                                    transition: "all 0.2s"
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
                                                color: "#6b7280",
                                                textDecoration: "none",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
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

            <div style={{ marginTop: "auto", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                <Link href="/" style={{ display: "block", padding: "0.5rem 0", color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
                    &larr; Back to Website
                </Link>
            </div>
        </aside>
    );
}
