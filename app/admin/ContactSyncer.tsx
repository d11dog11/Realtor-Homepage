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
        <div style={{ padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#fff", height: "100%" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#064e3b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🔄</span> Sync Contacts
            </h3>

            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
                Push your local contacts to your connected email providers. Duplicate emails will be skipped.
            </p>

            <div style={{ padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "6px", marginBottom: "1.5rem", border: "1px solid #e5e7eb" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "0.75rem" }}>
                    <div style={{ position: "relative", width: "36px", height: "20px" }}>
                        <input
                            type="checkbox"
                            checked={autoSync}
                            onChange={toggleAutoSync}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: autoSync ? "#2563eb" : "#ccc",
                            borderRadius: "20px", transition: "0.3s"
                        }}></span>
                        <span style={{
                            position: "absolute", content: '""', height: "16px", width: "16px",
                            left: autoSync ? "18px" : "2px", bottom: "2px",
                            backgroundColor: "white", borderRadius: "50%", transition: "0.3s"
                        }}></span>
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                        Automatically sync new contacts when created
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
                            padding: "0.5rem 1rem",
                            backgroundColor: syncing ? "#9ca3af" : p.color,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: syncing ? "not-allowed" : "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            transition: "all 0.2s"
                        }}
                    >
                        {syncing === p.id ? "Syncing..." : p.name}
                    </button>
                ))}
            </div>

            {message && (
                <div style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    backgroundColor: message.includes("Error") ? "#fef2f2" : "#f0fdf4",
                    color: message.includes("Error") ? "#991b1b" : "#166534",
                    border: `1px solid ${message.includes("Error") ? "#fecaca" : "#bbf7d0"}`,
                    fontSize: "0.875rem"
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}
