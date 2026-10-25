import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resume & Credentials',
  description: 'LivingYuji development background, tech stack and project history.',
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="text-sm text-primary hover:underline block">← Back to OS</Link>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-border/40">
          <h1 className="text-2xl font-bold text-deep dark:text-white">LivingYuji</h1>
          <p className="text-secondary text-sm mt-1">Independent Developer & Creator</p>
          <div className="mt-4 pt-4 border-t border-border/40 space-y-3 text-sm text-secondary">
            <p>Specializing in Minecraft Paper/Purpur plugin development, Discord bots, modern responsive web applications, and game server infrastructure.</p>
            <div>
              <strong className="text-deep dark:text-white">GitHub:</strong>{' '}
              <a href="https://github.com/livingyuji" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                github.com/livingyuji
              </a>
            </div>
            <div>
              <strong className="text-deep dark:text-white">Discord:</strong> LivingYuji
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
