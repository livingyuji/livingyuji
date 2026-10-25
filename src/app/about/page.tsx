import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About LivingYuji',
  description: 'Learn about LivingYuji — independent developer specializing in Minecraft plugins, Discord bots and web development.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-soft-bg dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-6 block">← Back to OS</Link>
        <div className="flex flex-col items-center text-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">LY</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-deep dark:text-white">LivingYuji</h1>
            <p className="text-secondary mt-1">Independent Developer & Creator</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-border/40 space-y-4">
          <p className="text-secondary leading-relaxed">
            I&apos;m an independent developer and creator interested in building useful digital products across different technical fields.
          </p>
          <p className="text-secondary leading-relaxed">
            My work spans web development, Discord bots, Minecraft plugins and resource packs, automation, and AI-powered tools. I enjoy exploring new technologies, solving practical problems, and turning ideas into projects people can actually use.
          </p>
          <p className="text-secondary leading-relaxed">
            I believe good development is about more than writing code. It is about understanding the problem, designing a thoughtful solution, testing it properly and continuously improving the result.
          </p>
          <Link href="/contact" className="inline-block mt-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
