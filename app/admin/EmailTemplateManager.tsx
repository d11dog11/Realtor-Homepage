"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
}

export default function EmailTemplateManager({ title }: { title?: string }) {
    const router = useRouter();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
    const [formData, setFormData] = useState({ name: "", subject: "", body: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/templates");
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (err) {
            console.error("Failed to fetch templates", err);
        }
    };

    const handleEdit = (template: EmailTemplate) => {
        setCurrentTemplate(template);
        setFormData({ name: template.name, subject: template.subject, body: template.body });
        setIsEditing(true);
        setError("");
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await fetch(`/api/templates/${id}`, { method: "DELETE" });
            fetchTemplates();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentTemplate(null);
        setFormData({ name: "", subject: "", body: "" });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = currentTemplate ? `/api/templates/${currentTemplate.id}` : "/api/templates";
            const method = currentTemplate ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save template");

            fetchTemplates();
            handleCancel();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "image");

            const res = await fetch("/api/upload/image", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Upload failed");
            }

            const data = await res.json();

            // Insert image HTML at cursor position or at the end
            const imageHtml = `\n<img src="${data.url}" alt="Email image" style="max-width: 100%; height: auto; margin: 10px 0;" />\n`;
            setFormData(prev => ({
                ...prev,
                body: prev.body + imageHtml
            }));

            // Reset file input
            e.target.value = "";
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPdf(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "pdf");

            const res = await fetch("/api/upload/image", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Upload failed");
            }

            const data = await res.json();

            // Insert PDF download link
            const pdfHtml = `\n<div style="margin: 15px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #064e3b;">
    <p style="margin: 0 0 8px 0; font-weight: bold; color: #064e3b;">📄 Download Attachment</p>
    <a href="${data.url}" style="color: #064e3b; text-decoration: none; font-weight: 500;" download>
        ${file.name}
    </a>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">Click to download PDF</p>
</div>\n`;
            setFormData(prev => ({
                ...prev,
                body: prev.body + pdfHtml
            }));

            // Reset file input
            e.target.value = "";
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadingPdf(false);
        }
    };

    const insertVariable = (variable: string) => {
        setFormData(prev => ({
            ...prev,
            body: prev.body + ` {{${variable}}} `
        }));
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                {title ? (
                    <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#f0fdf4", margin: 0, letterSpacing: "-0.025em" }}>{title}</h1>
                ) : <div />}

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                        style={{ fontSize: "0.875rem", padding: "0.75rem 1.5rem" }}
                    >
                        + Create Template
                    </button>
                )}
            </div>

            <div style={{ background: "#064e3b", padding: "2rem", borderRadius: "1rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>

                {isEditing ? (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Template Name</label>
                            <input
                                style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Welcome Email"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Subject Line</label>
                            <input
                                style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }}
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                placeholder="e.g. Welcome {{firstName}}!"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.75rem" }}>Email Body (HTML supported)</label>
                            <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                                <span style={{ fontSize: "0.75rem", color: "#d1fae5", fontWeight: "600", textTransform: "uppercase", opacity: "0.7" }}>Insert:</span>
                                {["firstName", "lastName", "email", "phone"].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => insertVariable(v)}
                                        style={{
                                            fontSize: "0.75rem",
                                            padding: "0.375rem 0.75rem",
                                            background: "rgba(16, 185, 129, 0.2)",
                                            color: "#34d399",
                                            border: "1px solid rgba(16, 185, 129, 0.3)",
                                            borderRadius: "0.5rem",
                                            cursor: "pointer",
                                            fontWeight: "700"
                                        }}
                                    >
                                        {v}
                                    </button>
                                ))}

                                <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                    <label
                                        htmlFor="image-upload"
                                        style={{
                                            fontSize: "0.75rem",
                                            padding: "0.375rem 1rem",
                                            background: uploadingImage ? "rgba(156, 163, 175, 0.2)" : "#10b981",
                                            color: uploadingImage ? "#9ca3af" : "#022c22",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            cursor: uploadingImage ? "not-allowed" : "pointer",
                                            display: "inline-block",
                                            fontWeight: "700"
                                        }}
                                    >
                                        {uploadingImage ? "Uploading..." : "📷 Image"}
                                    </label>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        style={{ display: "none" }}
                                    />

                                    <label
                                        htmlFor="pdf-upload"
                                        style={{
                                            fontSize: "0.75rem",
                                            padding: "0.375rem 1rem",
                                            background: uploadingPdf ? "rgba(156, 163, 175, 0.2)" : "#f59e0b",
                                            color: uploadingPdf ? "#9ca3af" : "#ffffff",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            cursor: uploadingPdf ? "not-allowed" : "pointer",
                                            display: "inline-block",
                                            fontWeight: "700"
                                        }}
                                    >
                                        {uploadingPdf ? "Uploading..." : "📄 PDF"}
                                    </label>
                                    <input
                                        id="pdf-upload"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePdfUpload}
                                        disabled={uploadingPdf}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>
                            <textarea
                                style={{ width: "100%", padding: "1rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none", fontFamily: "monospace", fontSize: "0.875rem", resize: "vertical" }}
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                required
                                rows={12}
                                placeholder="Hello {{firstName}}, ..."
                            />
                            <p style={{ fontSize: "0.75rem", color: "#d1fae5", marginTop: "1rem", opacity: "0.6" }}>
                                Tip: Use HTML for formatting. Images will be embedded. PDFs will appear as download links.
                            </p>
                        </div>

                        {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: "600" }}>{error}</p>}

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "0.75rem 1.5rem", fontWeight: "700" }}>
                                {loading ? "Saving..." : "Save Template"}
                            </button>
                            <button type="button" onClick={handleCancel} style={{ padding: "0.75rem 1.5rem", border: "1px solid rgba(16, 185, 129, 0.3)", background: "transparent", color: "#d1fae5", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        {templates.length === 0 ? (
                            <p style={{ color: "#d1fae5", fontStyle: "italic", opacity: "0.7" }}>No templates yet.</p>
                        ) : (
                            <div style={{ display: "grid", gap: "1rem" }}>
                                {templates.map(t => (
                                    <div key={t.id} style={{ border: "1px solid rgba(16, 185, 129, 0.2)", padding: "1.5rem", borderRadius: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0, 0, 0, 0.1)" }}>
                                        <div>
                                            <h4 style={{ fontWeight: "700", fontSize: "1.125rem", color: "#f0fdf4", margin: "0 0 0.25rem 0" }}>{t.name}</h4>
                                            <p style={{ color: "#d1fae5", fontSize: "0.875rem", margin: 0, opacity: "0.8" }}>Subject: {t.subject}</p>
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <button
                                                onClick={() => handleEdit(t)}
                                                style={{ color: "#34d399", background: "none", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "0.875rem" }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "0.875rem" }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
