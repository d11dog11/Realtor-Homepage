import EmailTemplateManager from "../EmailTemplateManager";

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
    return (
        <div style={{ padding: "0" }}>
            <EmailTemplateManager title="Email Templates" />
        </div>
    );
}
