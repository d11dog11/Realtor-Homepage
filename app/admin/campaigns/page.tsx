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
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#064e3b", margin: 0 }}>Email Campaigns</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                    style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                >
                    {showForm ? "Cancel" : "+ New Campaign"}
                </button>
            </div>

            {showForm && (
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#1f2937" }}>
                        Create Campaign
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label className="label">Campaign Name</label>
                            <input name="name" required className="input" placeholder="Monthly Newsletter" />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <label className="label">Email Template</label>
                                <select name="templateId" required className="input">
                                    <option value="">Select template...</option>
                                    {templates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} - {template.subject}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Recipient Filter</label>
                                <select name="recipientFilter" className="input">
                                    <option value="all">All Contacts (not opted out)</option>
                                    <option value="birthday">Today's Birthdays</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label className="label">Schedule For (Optional)</label>
                            <input name="scheduledFor" type="datetime-local" className="input" />
                            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                                Leave blank to save as draft. Scheduled sends are not automatic - you must manually send them.
                            </p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? "Creating..." : "Create Campaign"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {editingCampaign && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937" }}>Edit Campaign</h3>
                            <button onClick={() => setEditingCampaign(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="label">Campaign Name</label>
                                <input name="name" required className="input" defaultValue={editingCampaign.name} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                <div>
                                    <label className="label">Email Template</label>
                                    <select name="templateId" required className="input" defaultValue={editingCampaign.templateId}>
                                        {templates.map(template => (
                                            <option key={template.id} value={template.id}>
                                                {template.name} - {template.subject}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Recipient Filter</label>
                                    <select name="recipientFilter" className="input" defaultValue={editingCampaign.recipientFilter}>
                                        <option value="all">All Contacts (not opted out)</option>
                                        <option value="birthday">Today's Birthdays</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label className="label">Schedule For (Optional)</label>
                                <input
                                    name="scheduledFor"
                                    type="datetime-local"
                                    className="input"
                                    defaultValue={editingCampaign.scheduledFor ? new Date(editingCampaign.scheduledFor).toISOString().slice(0, 16) : ""}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingCampaign(null)}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Campaign Name</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Status</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Filter</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Scheduled For</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Sent</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map(campaign => (
                            <tr key={campaign.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "1rem" }}>{campaign.name}</td>
                                <td style={{ padding: "1rem" }}>
                                    <span style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "4px",
                                        fontSize: "0.75rem",
                                        background:
                                            campaign.status === "Sent" ? "#dcfce7" :
                                                campaign.status === "Sending" ? "#fef3c7" :
                                                    campaign.status === "Failed" ? "#fee2e2" : "#f3f4f6",
                                        color:
                                            campaign.status === "Sent" ? "#166534" :
                                                campaign.status === "Sending" ? "#92400e" :
                                                    campaign.status === "Failed" ? "#991b1b" : "#374151",
                                        fontWeight: 600
                                    }}>
                                        {campaign.status}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem" }}>{campaign.recipientFilter}</td>
                                <td style={{ padding: "1rem" }}>
                                    {campaign.scheduledFor
                                        ? new Date(campaign.scheduledFor).toLocaleString()
                                        : "-"
                                    }
                                </td>
                                <td style={{ padding: "1rem" }}>{campaign.sentCount}</td>
                                <td style={{ padding: "1rem" }}>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {campaign.status !== "Sent" && campaign.status !== "Sending" && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(campaign)}
                                                    className="btn"
                                                    style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem", background: "#f3f4f6", color: "#374151", border: "none" }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleSendCampaign(campaign.id)}
                                                    disabled={sending === campaign.id}
                                                    className="btn btn-primary"
                                                    style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
                                                >
                                                    {sending === campaign.id ? "Sending..." : "Send Now"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(campaign.id)}
                                                    className="btn"
                                                    style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem", background: "#fee2e2", color: "#991b1b", border: "none" }}
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
                                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
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
