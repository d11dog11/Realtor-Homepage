"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
}

interface Campaign {
    id: number;
    name: string;
    templateId: number;
    scheduledFor: string | null;
    status: string;
    recipientFilter: string;
    sentCount: number;
    createdAt: string;
}

export default function EmailCampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState<number | null>(null);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [campaignsRes, templatesRes] = await Promise.all([
            fetch("/api/campaigns"),
            fetch("/api/templates"),
        ]);

        const campaignsData = await campaignsRes.json();
        const templatesData = await templatesRes.json();

        setCampaigns(campaignsData);
        setTemplates(templatesData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            templateId: formData.get("templateId"),
            scheduledFor: formData.get("scheduledFor") || null,
            recipientFilter: formData.get("recipientFilter"),
        };

        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create campaign");

            setShowForm(false);
            loadData();
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error(error);
            alert("Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingCampaign) return;

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            templateId: formData.get("templateId"),
            scheduledFor: formData.get("scheduledFor") || null,
            recipientFilter: formData.get("recipientFilter"),
        };

        try {
            const res = await fetch(`/api/campaigns/${editingCampaign.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update campaign");

            setEditingCampaign(null);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Failed to update campaign");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this campaign? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            loadData();
        } catch (error: any) {
            console.error(error);
            alert(`Failed to delete campaign: ${error.message}`);
        }
    };

    const handleSendCampaign = async (id: number) => {
        if (!confirm("Are you sure you want to send this campaign?")) return;

        setSending(id);
        try {
            const res = await fetch(`/api/campaigns/${id}/send`, {
                method: "POST",
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            const result = await res.json();
            alert(`Campaign sent successfully! ${result.sentCount} emails sent.`);
            loadData();
        } catch (error: any) {
            console.error(error);
            alert(`Failed to send campaign: ${error.message}`);
        } finally {
            setSending(null);
        }
    };

    return (
        <div style={{ padding: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#f0fdf4", margin: 0, letterSpacing: "-0.025em" }}>Email Campaigns</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                    style={{ fontSize: "0.875rem", padding: "0.75rem 1.5rem", fontWeight: "700" }}
                >
                    {showForm ? "Cancel" : "+ New Campaign"}
                </button>
            </div>

            {showForm && (
                <div style={{ background: "#064e3b", padding: "2.5rem", borderRadius: "1rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)", marginBottom: "3rem", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "2rem", color: "#f0fdf4" }}>
                        Create Campaign
                    </h3>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Campaign Name</label>
                            <input name="name" required style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }} placeholder="Monthly Newsletter" />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Email Template</label>
                                <select name="templateId" required style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none", appearance: "none" }}>
                                    <option value="" style={{ background: "#064e3b" }}>Select template...</option>
                                    {templates.map(template => (
                                        <option key={template.id} value={template.id} style={{ background: "#064e3b" }}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Recipient Filter</label>
                                <select name="recipientFilter" style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none", appearance: "none" }}>
                                    <option value="all" style={{ background: "#064e3b" }}>All Contacts (not opted out)</option>
                                    <option value="birthday" style={{ background: "#064e3b" }}>Today's Birthdays</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Schedule For (Optional)</label>
                            <input name="scheduledFor" type="datetime-local" style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }} />
                            <p style={{ fontSize: "0.75rem", color: "#d1fae5", marginTop: "0.5rem", opacity: "0.6" }}>
                                Leave blank to save as draft. Scheduled sends are not automatic - you must manually send them.
                            </p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{ padding: "0.75rem 1.5rem", border: "1px solid rgba(16, 185, 129, 0.3)", background: "transparent", color: "#d1fae5", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ padding: "0.75rem 1.5rem", fontWeight: "700" }}
                            >
                                {loading ? "Creating..." : "Create Campaign"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {editingCampaign && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
                    <div style={{ background: "#064e3b", padding: "2.5rem", borderRadius: "1rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(16, 185, 129, 0.2)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f0fdf4", margin: 0 }}>Edit Campaign</h3>
                            <button onClick={() => setEditingCampaign(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#d1fae5" }}>&times;</button>
                        </div>

                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Campaign Name</label>
                                <input name="name" required style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }} defaultValue={editingCampaign.name} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Email Template</label>
                                    <select name="templateId" required style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none", appearance: "none" }} defaultValue={editingCampaign.templateId}>
                                        {templates.map(template => (
                                            <option key={template.id} value={template.id} style={{ background: "#064e3b" }}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Recipient Filter</label>
                                    <select name="recipientFilter" style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none", appearance: "none" }} defaultValue={editingCampaign.recipientFilter}>
                                        <option value="all" style={{ background: "#064e3b" }}>All Contacts (not opted out)</option>
                                        <option value="birthday" style={{ background: "#064e3b" }}>Today's Birthdays</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Schedule For (Optional)</label>
                                <input
                                    name="scheduledFor"
                                    type="datetime-local"
                                    style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }}
                                    defaultValue={editingCampaign.scheduledFor ? new Date(editingCampaign.scheduledFor).toISOString().slice(0, 16) : ""}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingCampaign(null)}
                                    style={{ padding: "0.75rem 1.5rem", border: "1px solid rgba(16, 185, 129, 0.3)", background: "transparent", color: "#d1fae5", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ padding: "0.75rem 1.5rem", fontWeight: "700" }}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ background: "#064e3b", borderRadius: "1rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)", border: "1px solid rgba(16, 185, 129, 0.2)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", textAlign: "left" }}>
                    <thead style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                        <tr>
                            <th style={{ padding: "1.25rem", color: "#10b981", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Campaign Name</th>
                            <th style={{ padding: "1.25rem", color: "#10b981", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                            <th style={{ padding: "1.25rem", color: "#10b981", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filter</th>
                            <th style={{ padding: "1.25rem", color: "#10b981", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Scheduled For</th>
                            <th style={{ padding: "1.25rem", color: "#10b981", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sent</th>
                            <th style={{ padding: "1.25rem", color: "#10b981", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign, idx) => (
                            <tr key={campaign.id} style={{ borderTop: "1px solid rgba(16, 185, 129, 0.1)", background: idx % 2 === 0 ? "transparent" : "rgba(0, 0, 0, 0.1)" }}>
                                <td style={{ padding: "1.25rem", color: "#f0fdf4", fontWeight: "600" }}>{campaign.name}</td>
                                <td style={{ padding: "1.25rem" }}>
                                    <span style={{
                                        padding: "0.375rem 0.75rem",
                                        borderRadius: "2rem",
                                        fontSize: "0.75rem",
                                        background:
                                            campaign.status === "Sent" ? "rgba(16, 185, 129, 0.15)" :
                                                campaign.status === "Sending" ? "rgba(245, 158, 11, 0.15)" :
                                                    campaign.status === "Failed" ? "rgba(239, 68, 68, 0.15)" : "rgba(156, 163, 175, 0.15)",
                                        color:
                                            campaign.status === "Sent" ? "#10b981" :
                                                campaign.status === "Sending" ? "#f59e0b" :
                                                    campaign.status === "Failed" ? "#ef4444" : "#d1fae5",
                                        fontWeight: "700",
                                        border: "1px solid currentColor"
                                    }}>
                                        {campaign.status}
                                    </span>
                                </td>
                                <td style={{ padding: "1.25rem", color: "#d1fae5" }}>{campaign.recipientFilter}</td>
                                <td style={{ padding: "1.25rem", color: "#d1fae5" }}>
                                    {campaign.scheduledFor
                                        ? new Date(campaign.scheduledFor).toLocaleString()
                                        : "-"
                                    }
                                </td>
                                <td style={{ padding: "1.25rem", color: "#f0fdf4", fontWeight: "700" }}>{campaign.sentCount}</td>
                                <td style={{ padding: "1.25rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                        {campaign.status !== "Sent" && campaign.status !== "Sending" && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(campaign)}
                                                    style={{ color: "#34d399", background: "none", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "0.875rem" }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleSendCampaign(campaign.id)}
                                                    disabled={sending === campaign.id}
                                                    style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "0.5rem", padding: "0.375rem 0.75rem", cursor: "pointer", fontWeight: "700", fontSize: "0.875rem" }}
                                                >
                                                    {sending === campaign.id ? "Sending..." : "Send Now"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(campaign.id)}
                                                    style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "0.875rem" }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {campaigns.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "#d1fae5", opacity: "0.5", fontStyle: "italic" }}>
                                    No campaigns yet. Create your first one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
