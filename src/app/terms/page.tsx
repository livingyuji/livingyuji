import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'LivingYuji OS terms and conditions for development services and digital downloads.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href="/" className="text-sm text-primary hover:underline block">← Back to OS</Link>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-border/40 space-y-4">
          <h1 className="text-2xl font-bold text-deep dark:text-white">Terms of Service</h1>
          <p className="text-sm text-secondary leading-relaxed">
            All custom software projects, plugin commissions, and server configurations delivered by LivingYuji are governed by individual scope agreements established prior to development work.
          </p>
          <p className="text-sm text-secondary leading-relaxed">
            Free plugins and open-source downloads are provided &ldquo;as is&rdquo; without warranties of any kind. Compatibility with specific server versions or third-party modifications is documented per project.
          </p>
        </div>
      </div>
    </div>
  );
}
