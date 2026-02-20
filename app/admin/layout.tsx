"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                setIsAuthenticated(true);
                setError("");
            } else {
                setError("Incorrect password");
            }
        } catch (err) {
            setError("Login failed");
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#011c16" // Darker than main bg for focus
            }}>
                <div style={{
                    background: "#064e3b",
                    padding: "2.5rem",
                    borderRadius: "1rem",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                    border: "1px solid #10b981",
                    width: "100%",
                    maxWidth: "400px"
                }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "2rem", color: "#f0fdf4", textAlign: "center", letterSpacing: "-0.025em" }}>
                        Admin Console
                    </h2>
                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Console Password"
                            style={{
                                padding: "0.875rem",
                                background: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid #10b981",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                                color: "#ffffff",
                                outline: "none"
                            }}
                            autoFocus
                        />
                        {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>}
                        <button
                            type="submit"
                            style={{
                                padding: "0.875rem",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "#022c22",
                                border: "none",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                transition: "transform 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Access Console
                        </button>
                    </form>
                    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                        <a href="/" style={{ color: "#d1fae5", textDecoration: "none", fontSize: "0.875rem", opacity: "0.8" }}>&larr; Exit to Website</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#022c22", color: "#f0fdf4" }}>
            <div style={{ position: "fixed", width: "250px", height: "100vh" }}>
                <AdminSidebar />
            </div>
            <div style={{ marginLeft: "250px", width: "calc(100% - 250px)", padding: "2.5rem" }}>
                {children}
            </div>
        </div>
    );
}
