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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                {title ? (
                    <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#064e3b", margin: 0 }}>{title}</h1>
                ) : <div />}

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                        style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                    >
                        + Create Template
                    </button>
                )}
            </div>

            <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>

                {isEditing ? (
                    <form onSubmit={handleSubmit} style={{ border: "1px solid #e5e7eb", padding: "1rem", borderRadius: "0.5rem" }}>
                        <div className="form-group">
                            <label className="label">Template Name</label>
                            <input
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Welcome Email"
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Subject Line</label>
                            <input
                                className="input"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                placeholder="e.g. Welcome {{firstName}}!"
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Email Body (HTML supported)</label>
                            <div style={{ marginBottom: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Insert Variable:</span>
                                {["firstName", "lastName", "email", "phone"].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => insertVariable(v)}
                                        style={{
                                            fontSize: "0.75rem",
                                            padding: "0.25rem 0.5rem",
                                            background: "#e0e7ff",
                                            color: "#3730a3",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {v}
                                    </button>
                                ))}

                                <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <label
                                        htmlFor="image-upload"
                                        style={{
                                            fontSize: "0.75rem",
                                            padding: "0.25rem 0.75rem",
                                            background: uploadingImage ? "#d1d5db" : "#34d399",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: uploadingImage ? "not-allowed" : "pointer",
                                            display: "inline-block"
                                        }}
                                    >
                                        {uploadingImage ? "Uploading..." : "📷 Add Image"}
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
                                            padding: "0.25rem 0.75rem",
                                            background: uploadingPdf ? "#d1d5db" : "#f59e0b",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: uploadingPdf ? "not-allowed" : "pointer",
                                            display: "inline-block"
                                        }}
                                    >
                                        {uploadingPdf ? "Uploading..." : "📄 Add PDF"}
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
                                className="input"
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                required
                                rows={10}
                                placeholder="Hello {{firstName}}, ..."
                                style={{ fontFamily: "monospace" }}
                            />
                            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }}>
                                Tip: Use HTML for formatting. Images will be embedded. PDFs will appear as download links.
                            </p>
                        </div>

                        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? "Saving..." : "Save Template"}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-secondary" style={{ background: "#f3f4f6", color: "#374151" }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        {templates.length === 0 ? (
                            <p style={{ color: "#6b7280", fontStyle: "italic" }}>No templates yet.</p>
                        ) : (
                            <div style={{ display: "grid", gap: "1rem" }}>
                                {templates.map(t => (
                                    <div key={t.id} style={{ border: "1px solid #e5e7eb", padding: "1rem", borderRadius: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <h4 style={{ fontWeight: "bold", fontSize: "1rem", color: "#1f2937" }}>{t.name}</h4>
                                            <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Subject: {t.subject}</p>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => handleEdit(t)}
                                                style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: "500", fontSize: "0.875rem" }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: "500", fontSize: "0.875rem" }}
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
