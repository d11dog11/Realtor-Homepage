"use client";

import { useState, useEffect } from "react";

interface Integration {
    provider: string;
    providerEmail: string | null;
    connected: boolean;
}

const PROVIDERS = [
    { id: "google", name: "Gmail (Google)", icon: "📧", color: "#DB4437" },
    { id: "microsoft", name: "Outlook (Microsoft)", icon: "📮", color: "#0078D4" },
    { id: "yahoo", name: "Yahoo Mail", icon: "📬", color: "#6001D2" },
];

export default function IntegrationsManager() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const response = await fetch("/api/admin/integrations");
            const data = await response.json();
            setIntegrations(data);
        } catch (error) {
            console.error("Failed to fetch integrations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (provider: string) => {
        window.location.href = `/api/auth/${provider}/login`;
    };

    const handleDisconnect = async (provider: string) => {
        if (!confirm(`Are you sure you want to disconnect ${provider}?`)) {
            return;
        }
        window.location.href = `/api/auth/${provider}/logout`;
    };

    if (loading) {
        return (
            <div style={{ padding: "0", textAlign: "center" }}>
                <p>Loading integrations...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "0" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#1e3a8a", margin: 0, marginBottom: "1.5rem" }}>
                Email & Calendar Integrations
            </h1>

            <div style={{ display: "grid", gap: "1rem", maxWidth: "800px" }}>
                {PROVIDERS.map((provider) => {
                    const integration = integrations.find((i) => i.provider === provider.id);
                    const isConnected = integration?.connected || false;

                    return (
                        <div
                            key={provider.id}
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "1.5rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: isConnected ? "#f0fdf4" : "#ffffff",
                                borderColor: isConnected ? "#86efac" : "#e5e7eb",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <span style={{ fontSize: "2rem" }}>{provider.icon}</span>
                                <div>
                                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", margin: 0 }}>
                                        {provider.name}
                                    </h3>
                                    {isConnected && integration?.providerEmail && (
                                        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                                            Connected as: {integration.providerEmail}
                                        </p>
                                    )}
                                    {!isConnected && (
                                        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                                            Not connected
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                {isConnected ? (
                                    <button
                                        onClick={() => handleDisconnect(provider.id)}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            backgroundColor: "#ef4444",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "500",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        Disconnect
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(provider.id)}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            backgroundColor: provider.color,
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "500",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", marginTop: 0, color: "#1e40af" }}>
                    📋 Integration Features
                </h4>
                <ul style={{ fontSize: "0.875rem", color: "#1e40af", lineHeight: "1.6" }}>
                    <li><strong>Email:</strong> Send emails directly from your connected account</li>
                    <li><strong>Calendar:</strong> Create and manage calendar events</li>
                    <li><strong>Contacts:</strong> Import and sync contacts from your email provider</li>
                </ul>
            </div>
        </div>
    );
}
