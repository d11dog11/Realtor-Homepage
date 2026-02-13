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
                backgroundColor: "#f1f5f9"
            }}>
                <div style={{
                    background: "white",
                    padding: "2rem",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    width: "100%",
                    maxWidth: "400px"
                }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#1e3a8a", textAlign: "center" }}>
                        Admin Login
                    </h2>
                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            style={{
                                padding: "0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "0.375rem",
                                fontSize: "1rem"
                            }}
                            autoFocus
                        />
                        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>}
                        <button
                            type="submit"
                            style={{
                                padding: "0.75rem",
                                background: "#1e3a8a",
                                color: "white",
                                border: "none",
                                borderRadius: "0.375rem",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Access Console
                        </button>
                    </form>
                    <div style={{ marginTop: "1rem", textAlign: "center" }}>
                        <a href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>&larr; Back to Website</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
            <div style={{ position: "fixed", width: "250px", height: "100vh" }}>
                <AdminSidebar />
            </div>
            <div style={{ marginLeft: "250px", width: "calc(100% - 250px)", padding: "2rem" }}>
                {children}
            </div>
        </div>
    );
}
