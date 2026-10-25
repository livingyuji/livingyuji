import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with LivingYuji to discuss custom projects, commissions and services.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-6 block">← Back to OS</Link>
        <h1 className="text-2xl font-bold text-deep dark:text-white mb-2">Contact</h1>
        <p className="text-secondary mb-6 text-sm">
          Use the interactive OS for the full experience, or fill out the enquiry form below.
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-border/40">
          <p className="text-sm text-secondary mb-4">
            For the full contact form with all fields and categories, visit the interactive OS homepage and open the Contact app, or use the form below.
          </p>
          <Link href="/?app=contact" className="block text-center px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
            Open Contact in LivingYuji OS
          </Link>
          <div className="mt-4 pt-4 border-t border-border/40 space-y-1 text-sm text-secondary">
            <div><strong className="text-deep dark:text-white">Discord:</strong> LivingYuji</div>
            <div><strong className="text-deep dark:text-white">GitHub:</strong>{' '}
              <a href="https://github.com/livingyuji" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                github.com/livingyuji
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
