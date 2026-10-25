import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'LivingYuji OS privacy policy and data practices.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href="/" className="text-sm text-primary hover:underline block">← Back to OS</Link>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-border/40 space-y-4">
          <h1 className="text-2xl font-bold text-deep dark:text-white">Privacy Policy</h1>
          <p className="text-sm text-secondary leading-relaxed">
            LivingYuji respects your privacy. When you submit project enquiries via our contact forms, the details you provide (name, email, Discord username, and project scope) are used solely to evaluate and respond to your enquiry.
          </p>
          <p className="text-sm text-secondary leading-relaxed">
            We do not sell, rent, or distribute your personal details to third parties. UI preferences (such as wallpaper and theme settings) are stored locally in your browser storage and never transmitted to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
