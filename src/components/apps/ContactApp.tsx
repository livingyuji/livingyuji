'use client';

import React, { useState } from 'react';
import { useDiscordSettingsStore } from '@/store/discordSettingsStore';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

const SERVICE_CATEGORIES = [
  'Web Development',
  'Discord Bot Development',
  'Minecraft Plugin Development',
  'Minecraft Resource Pack',
  'Custom Minecraft Setup',
  'Discord Server Setup',
  'Paid Product Question',
  'Bug Fixing & Maintenance',
  'Other Custom Work',
];

type SubmitState = 'idle' | 'loading' | 'success' | 'error';
type ContactMethod = 'discord' | 'form';

export function ContactApp() {
  const { mainServerUrl, purchaseSupportUrl } = useDiscordSettingsStore();
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod>('discord');

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    discord: '',
    category: '',
    title: '',
    budget: '',
    timeline: '',
    description: '',
    links: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');
  const [copiedTag, setCopiedTag] = useState(false);

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText('LivingYuji');
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.category) e.category = 'Please select a category';
    if (!form.title.trim()) e.title = 'Project title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 20)
      e.description = 'Please provide more detail (20+ characters)';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitState('loading');
    setSubmitError('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      setSubmitState('success');
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    }
  };

  const Field = ({
    label,
    name,
    required,
    children,
  }: {
    label: string;
    name: keyof typeof form;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {errors[name] && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" /> {errors[name]}
        </p>
      )}
    </div>
  );

  const inputClass = (field: keyof typeof form) =>
    `w-full px-3 py-2 rounded-xl text-xs bg-[#161B27] border text-white placeholder-slate-500 outline-none transition-colors ${
      errors[field]
        ? 'border-red-500/80 focus:border-red-400'
        : 'border-white/10 focus:border-[#0078D4]'
    }`;

  return (
    <div className="h-full overflow-y-auto window-scroll bg-[#0D111A] text-slate-100 select-none text-xs font-sans">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
            <Sparkles size={12} />
            <span>LivingYuji Communications Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Get in Touch</h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose your preferred contact method for custom development, Minecraft plugin commissions, and technical inquiries.
          </p>
        </div>

        {/* 2 MAIN CONTACT OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OPTION 1: DISCORD (FAST & RELIABLE - PREFERRED) */}
          <div
            onClick={() => setSelectedMethod('discord')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden ${
              selectedMethod === 'discord'
                ? 'bg-[#5865F2]/10 border-[#5865F2] shadow-lg shadow-[#5865F2]/15 ring-1 ring-[#5865F2]'
                : 'bg-[#141824] border-white/10 hover:border-white/20'
            }`}
          >
            {/* Preferred Badge */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5865F2] text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Zap size={10} />
                <span>Fast & Reliable (Preferred)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Chat
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Discord Direct</h3>
                  <p className="text-[11px] text-slate-400">Direct Message & Support Tickets</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                For fast and reliable communication, I prefer Discord. Instant responses, voice consults, and live order tracking.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="flex gap-2">
                <a
                  href={purchaseSupportUrl || mainServerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.01]"
                >
                  <span>Open Discord Ticket</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyDiscord();
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Copy Discord Username"
                >
                  {copiedTag ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedTag ? 'Copied' : 'Tag'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* OPTION 2: CONTACT VIA FILLING DETAILS */}
          <div
            onClick={() => setSelectedMethod('form')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden ${
              selectedMethod === 'form'
                ? 'bg-[#0078D4]/10 border-[#0078D4] shadow-lg shadow-sky-500/15 ring-1 ring-[#0078D4]'
                : 'bg-[#141824] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold text-[9px] uppercase tracking-wider">
                Option 2 • Web Form
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={11} />
                Email Response
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Contact via Filling Details</h3>
                  <p className="text-[11px] text-slate-400">Formal Project Specification Form</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                Prefer email? Fill out your complete requirements, timeline, and budget. We will respond with an official quote.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSelectedMethod('form')}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{selectedMethod === 'form' ? 'Form Active Below' : 'Fill Details Below'}</span>
                <span>↓</span>
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS FORM SECTION */}
        <div className="p-6 rounded-2xl bg-[#141824] border border-white/10 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText size={15} className="text-sky-400" />
                <span>Project Details & Specifications</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All fields marked with an asterisk (<span className="text-red-400">*</span>) are required.
              </p>
            </div>
            {selectedMethod === 'discord' && (
              <span className="text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
                Tip: Discord is faster
              </span>
            )}
          </div>

          {submitState === 'success' ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-base font-bold text-white">Enquiry Sent Successfully!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Thank you for your project submission. LivingYuji will review your specifications and contact you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitState('idle');
                  setForm({
                    name: '',
                    email: '',
                    discord: '',
                    category: '',
                    title: '',
                    budget: '',
                    timeline: '',
                    description: '',
                    links: '',
                  });
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Submit Another Project
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Your Name" name="name" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputClass('name')}
                    placeholder="e.g. Alex"
                    maxLength={100}
                  />
                </Field>
                <Field label="Email Address" name="email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputClass('email')}
                    placeholder="your@email.com"
                    maxLength={200}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Discord Username (Recommended)" name="discord">
                  <input
                    type="text"
                    value={form.discord}
                    onChange={(e) => setForm((f) => ({ ...f, discord: e.target.value }))}
                    className={inputClass('discord')}
                    placeholder="e.g. alex_dev"
                    maxLength={100}
                  />
                </Field>

                <Field label="Service Category" name="category" required>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputClass('category')}
                  >
                    <option value="">Select a service category…</option>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Project Title / System Name" name="title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass('title')}
                  placeholder="e.g. Custom Weapons Engine or Full Next.js Web Application"
                  maxLength={200}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Estimated Budget (Optional)" name="budget">
                  <input
                    type="text"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    className={inputClass('budget')}
                    placeholder="e.g. $200 – $600 USD"
                    maxLength={100}
                  />
                </Field>
                <Field label="Target Timeline (Optional)" name="timeline">
                  <input
                    type="text"
                    value={form.timeline}
                    onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value }))}
                    className={inputClass('timeline')}
                    placeholder="e.g. 1-2 weeks"
                    maxLength={100}
                  />
                </Field>
              </div>

              <Field label="Detailed Project Description" name="description" required>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`${inputClass('description')} resize-none`}
                  placeholder="Describe your requirements, core features, server software (Paper/Purpur), dependencies, and expected deliverables in detail…"
                  rows={4}
                  maxLength={3000}
                />
                <div className="text-right text-[10px] text-slate-500 mt-0.5">
                  {form.description.length}/3000 characters
                </div>
              </Field>

              <Field label="Relevant Links / References (Optional)" name="links">
                <input
                  type="text"
                  value={form.links}
                  onChange={(e) => setForm((f) => ({ ...f, links: e.target.value }))}
                  className={inputClass('links')}
                  placeholder="GitHub repo, reference documentation, Discord server link…"
                  maxLength={500}
                />
              </Field>

              {submitState === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                  <button
                    type="button"
                    onClick={() => setSubmitState('idle')}
                    className="ml-auto underline font-medium"
                  >
                    Retry
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitState === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0078D4] hover:bg-[#0086F0] text-white font-bold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {submitState === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Specifications…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Project Details</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
