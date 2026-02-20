"use client";

import { useState, useEffect } from "react";

const PROVIDERS = [
    { id: "google", name: "Sync to Gmail", color: "#DB4437" },
    { id: "microsoft", name: "Sync to Outlook", color: "#0078D4" },
    { id: "yahoo", name: "Sync to Yahoo", color: "#6001D2" },
];

export default function ContactSyncer() {
    const [autoSync, setAutoSync] = useState(false);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/admin/settings/auto-sync")
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("Failed to fetch settings");
            })
            .then((data) => setAutoSync(data.autoSync))
            .catch(err => console.error(err));
    }, []);

    const toggleAutoSync = async () => {
        const newValue = !autoSync;
        setAutoSync(newValue); // Optimistic update
        try {
            await fetch("/api/admin/settings/auto-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ autoSync: newValue }),
            });
        } catch (error) {
            console.error("Failed to save setting", error);
            setAutoSync(!newValue); // Revert on error
        }
    };

    const handleSync = async (provider: string) => {
        // Confirmation dialog
        if (!confirm(`Sync all local contacts to ${provider}? This will act as a one-way sync.`)) return;

        setSyncing(provider);
        setMessage("Starting sync...");

        try {
            const res = await fetch("/api/admin/sync-contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            });
            const data = await res.json();

            if (res.ok) {
                if (data.syncedCount === 0 && data.errors === 0) {
                    setMessage("All contacts are already synced!");
                } else {
                    setMessage(`Success! Synced ${data.syncedCount} new contacts. (${data.errors} failed)`);
                }
            } else {
                setMessage(`Error: ${data.message || "Sync failed"}`);
            }
        } catch (error) {
            setMessage("Failed to sync. Please check your connection.");
        } finally {
            setSyncing(null);
        }
    };

    return (
        <div style={{ padding: "2rem", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "1rem", backgroundColor: "#064e3b", height: "100%", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span>🔄</span> Sync Contacts
            </h3>

            <p style={{ fontSize: "0.875rem", color: "#d1fae5", marginBottom: "1.5rem", opacity: "0.8" }}>
                Push your local contacts to your connected email providers. Duplicate emails will be skipped.
            </p>

            <div style={{ padding: "1.25rem", backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: "0.75rem", marginBottom: "1.5rem", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "1rem" }}>
                    <div style={{ position: "relative", width: "40px", height: "22px" }}>
                        <input
                            type="checkbox"
                            checked={autoSync}
                            onChange={toggleAutoSync}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: autoSync ? "#10b981" : "#011c16",
                            borderRadius: "20px", transition: "0.3s",
                            border: "1px solid rgba(16, 185, 129, 0.2)"
                        }}></span>
                        <span style={{
                            position: "absolute", content: '""', height: "16px", width: "16px",
                            left: autoSync ? "21px" : "3px", bottom: "3px",
                            backgroundColor: "white", borderRadius: "50%", transition: "0.3s",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}></span>
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#f0fdf4" }}>
                        Auto-sync new contacts
                    </span>
                </label>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {PROVIDERS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => handleSync(p.id)}
                        disabled={!!syncing}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.75rem 1rem",
                            backgroundColor: syncing ? "rgba(156, 163, 175, 0.2)" : p.color,
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: syncing ? "not-allowed" : "pointer",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            transition: "all 0.2s",
                            textTransform: "uppercase",
                            letterSpacing: "0.025em"
                        }}
                    >
                        {syncing === p.id ? "Syncing..." : p.id}
                    </button>
                ))}
            </div>

            {message && (
                <div style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: message.includes("Error") ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                    color: message.includes("Error") ? "#ef4444" : "#10b981",
                    border: `1px solid ${message.includes("Error") ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
                    fontSize: "0.875rem",
                    fontWeight: "600"
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}
