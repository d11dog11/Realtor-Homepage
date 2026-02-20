"use client";

import { useState } from "react";
import ContactImporter from "../ContactImporter";
import ContactSyncer from "../ContactSyncer";

export default function SettingsPage() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (newPassword !== confirmPassword) {
            setMessage("Error: New passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/admin/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Success: Password updated successfully.");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage(`Error: ${data.message || "Failed to update password."}`);
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "0" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#f0fdf4", marginBottom: "3rem", letterSpacing: "-0.025em" }}>Settings</h1>

            <div style={{ display: "grid", gap: "4rem" }}>
                {/* Security Section */}
                <section id="security">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#10b981", borderBottom: "1px solid #064e3b", paddingBottom: "1rem" }}>
                        Security
                    </h2>
                    <div style={{ background: "#064e3b", padding: "2.5rem", borderRadius: "1rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)", maxWidth: "550px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "2rem", color: "#f0fdf4" }}>Change Admin Password</h3>

                        <form onSubmit={handlePasswordChange}>
                            <div style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5" }}>Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }}
                                />
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5" }}>New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }}
                                />
                            </div>

                            <div style={{ marginBottom: "2rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5" }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }}
                                />
                            </div>

                            {message && (
                                <div style={{
                                    marginBottom: "1.5rem",
                                    padding: "1rem",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.875rem",
                                    fontWeight: "600",
                                    background: message.startsWith("Error") ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                    color: message.startsWith("Error") ? "#ef4444" : "#10b981",
                                    border: message.startsWith("Error") ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(16, 185, 129, 0.2)"
                                }}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: "100%", padding: "0.875rem", fontWeight: "700" }}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Contacts Section */}
                <section id="contacts">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#10b981", borderBottom: "1px solid #064e3b", paddingBottom: "1rem" }}>
                        Contacts
                    </h2>
                    <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 450px" }}>
                            <ContactImporter />
                        </div>
                        <div style={{ flex: "1 1 450px" }}>
                            <ContactSyncer />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

