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
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#1e3a8a", marginBottom: "2rem" }}>Settings</h1>

            <div style={{ display: "grid", gap: "2rem" }}>
                {/* Security Section */}
                <section id="security">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem", color: "#1e3a8a", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
                        Security
                    </h2>
                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", maxWidth: "500px" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem", color: "#374151" }}>Change Admin Password</h3>

                        <form onSubmit={handlePasswordChange}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "#4b5563" }}>Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                                />
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "#4b5563" }}>New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "#4b5563" }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                                />
                            </div>

                            {message && (
                                <div style={{
                                    marginBottom: "1rem",
                                    padding: "0.75rem",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem",
                                    background: message.startsWith("Error") ? "#fee2e2" : "#dcfce7",
                                    color: message.startsWith("Error") ? "#991b1b" : "#166534"
                                }}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: "100%", padding: "0.75rem" }}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Contacts Section */}
                <section id="contacts">
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem", color: "#1e3a8a", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
                        Contacts
                    </h2>
                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
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

