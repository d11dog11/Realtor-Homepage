"use client";

import { useState } from "react";

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);

        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: formData.get("phone"),
            email: formData.get("email"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("Something went wrong");

            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group grid-half">
                <div>
                    <label className="label" htmlFor="firstName">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="input"
                        required
                        placeholder="Jane"
                    />
                </div>
                <div>
                    <label className="label" htmlFor="lastName">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="input"
                        required
                        placeholder="Doe"
                    />
                </div>
            </div>
            <div className="form-group">
                <label className="label" htmlFor="phone">
                    Cell Phone Number
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input"
                    required
                    placeholder="(555) 123-4567"
                />
            </div>
            <div className="form-group">
                <label className="label" htmlFor="email">
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="input"
                    required
                    placeholder="jane@example.com"
                />
            </div>
            <button
                type="submit"
                className="btn btn-secondary submit-btn"
                disabled={loading}
                style={{ marginTop: "1rem", fontWeight: "bold", opacity: loading ? 0.7 : 1 }}
            >
                {loading ? "Sending..." : "Send Request"}
            </button>
            {success && (
                <p className="text-green-600 mt-4 text-center font-medium">
                    Message sent successfully! I&apos;ll be in touch soon.
                </p>
            )}
            {error && (
                <p className="text-red-600 mt-4 text-center font-medium">
                    Something went wrong. Please try again.
                </p>
            )}
        </form>
    );
}
