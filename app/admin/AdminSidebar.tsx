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
        { href: "/admin/settings", label: "Settings" },
    ];

    return (
        <aside style={{ width: "250px", background: "#f8fafc", padding: "2rem", borderRight: "1px solid #e5e7eb", height: "100%", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e3a8a", marginBottom: "3rem" }}>Admin Console</h2>

            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
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
