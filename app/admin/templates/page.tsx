import EmailTemplateManager from "../EmailTemplateManager";

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
    return (
        <div style={{ padding: "2rem" }}>
            <EmailTemplateManager title="Email Templates" />
        </div>
    );
}
