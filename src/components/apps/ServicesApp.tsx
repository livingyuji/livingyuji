'use client';

import React, { useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { Send, MessageSquare } from 'lucide-react';
import { DiscordPurchaseModal } from '@/components/common/DiscordPurchaseModal';

const SERVICES = [
  {
    id: 'web-dev',
    emoji: '🌐',
    title: 'Website Development',
    description: 'Custom websites, web apps and dashboards built with modern frameworks. From landing pages to complex full-stack applications.',
    deliverables: ['Responsive design', 'Clean source code', 'Deployment guidance', 'Basic documentation'],
    pricing: 'custom-quote',
    category: 'web',
  },
  {
    id: 'discord-bot',
    emoji: '💬',
    title: 'Discord Bot Development',
    description: 'Custom Discord bots with commands, moderation, automation and optional web dashboards.',
    deliverables: ['Bot application', 'Commands & interactions', 'Configuration guide', 'Setup support'],
    pricing: 'custom-quote',
    category: 'discord',
  },
  {
    id: 'minecraft-plugin',
    emoji: '🟩',
    title: 'Minecraft Plugin Development',
    description: 'Custom Paper, Purpur or Spigot plugins. Custom gameplay mechanics, commands, events and configurations.',
    deliverables: ['Plugin JAR', 'Configuration files', 'Documentation', 'Basic support'],
    pricing: 'custom-quote',
    category: 'minecraft',
  },
  {
    id: 'resource-pack',
    emoji: '🎨',
    title: 'Resource Pack Development',
    description: 'Custom Minecraft resource packs with texture modifications, custom item models and pack validation.',
    deliverables: ['Resource pack ZIP', 'Installation guide', 'Compatibility check'],
    pricing: 'custom-quote',
    category: 'minecraft',
  },
  {
    id: 'mc-setup',
    emoji: '🔧',
    title: 'Custom Minecraft Setup',
    description: 'Full Minecraft server setup including plugin installation, configuration, permissions and custom systems.',
    deliverables: ['Configured server', 'Plugin configuration', 'Permissions setup', 'Basic support'],
    pricing: 'custom-quote',
    category: 'minecraft',
  },
  {
    id: 'discord-setup',
    emoji: '🛡️',
    title: 'Discord Server Setup',
    description: 'Complete Discord server setup with channels, roles, permissions, moderation and bot configuration.',
    deliverables: ['Configured server', 'Role structure', 'Bot setup', 'Admin guide'],
    pricing: 'custom-quote',
    category: 'discord',
  },
  {
    id: 'bug-fixing',
    emoji: '🐛',
    title: 'Bug Fixing & Maintenance',
    description: 'Debugging, optimisation and maintenance for existing Minecraft plugins, Discord bots and web projects.',
    deliverables: ['Bug fixes', 'Explanation of issues', 'Optional documentation'],
    pricing: 'custom-quote',
    category: 'other',
  },
];

export function ServicesApp() {
  const { openWindow } = useWindowStore();
  const [selectedServiceForDiscord, setSelectedServiceForDiscord] = useState<{
    id: string;
    name: string;
    category?: string;
    price: number | string;
  } | null>(null);

  return (
    <div className="h-full overflow-y-auto window-scroll bg-soft-bg dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-deep dark:text-white">Services & Pricing</h1>
          <p className="text-sm text-secondary mt-1">
            All services are quoted based on scope. You can initiate an inquiry via LivingYuji Discord ticket or submit the contact form.
          </p>
        </div>

        <div className="space-y-3">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-border/40 hover:border-primary/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-soft-bg dark:bg-slate-700 flex items-center justify-center text-xl shrink-0">
                  {service.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-deep dark:text-white">{service.title}</h2>
                    <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium shrink-0">
                      Request a Quote
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-1.5 leading-relaxed">{service.description}</p>
                  <div className="mt-3">
                    <div className="text-xs font-medium text-deep dark:text-white mb-1.5">What&apos;s included:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.deliverables.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] px-2 py-0.5 bg-soft-bg dark:bg-slate-700 text-secondary rounded-lg border border-border/60 dark:border-slate-600"
                        >
                          ✓ {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 dark:border-slate-700/40 flex justify-end gap-3">
                <button
                  onClick={() =>
                    setSelectedServiceForDiscord({
                      id: service.id,
                      name: service.title,
                      category: service.category,
                      price: 'Custom Quote',
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Order via Discord
                </button>
                <button
                  onClick={() => openWindow('contact')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soft-bg dark:bg-slate-700 text-xs font-medium text-deep dark:text-white hover:bg-border/40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Contact Form
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DiscordPurchaseModal
        isOpen={Boolean(selectedServiceForDiscord)}
        onClose={() => setSelectedServiceForDiscord(null)}
        product={selectedServiceForDiscord}
      />
    </div>
  );
}
