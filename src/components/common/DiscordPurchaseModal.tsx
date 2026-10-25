'use client';

import React, { useState } from 'react';
import { useDiscordSettingsStore } from '@/store/discordSettingsStore';
import { X, Copy, Check, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';

interface DiscordPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    category?: string;
    price: number | string;
    isFree?: boolean;
  } | null;
}

export function DiscordPurchaseModal({ isOpen, onClose, product }: DiscordPurchaseModalProps) {
  const { purchaseInstructions, getUrlForCategory, buttonLabelMinecraft } = useDiscordSettingsStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const priceStr = typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price;
  const orderRef = `ORD-${product.id.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const discordUrl = getUrlForCategory(product.category || product.name);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`Order Reference: ${orderRef}\nProduct: ${product.name}\nPrice: ${priceStr}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceedToDiscord = () => {
    navigator.clipboard.writeText(`Hi LivingYuji! I'd like to purchase:\n- Product: ${product.name}\n- Price: ${priceStr}\n- Order Code: ${orderRef}`);
    window.open(discordUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#1C2232] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Discord Purchase Ticket</h3>
              <p className="text-[11px] text-slate-400">LivingYuji Official Discord Delivery System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Details Card */}
        <div className="p-4 rounded-xl bg-[#141824] border border-white/10 space-y-2.5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                {product.category || 'Digital Asset'}
              </div>
              <div className="font-bold text-white text-sm mt-0.5">{product.name}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-extrabold text-emerald-400">{priceStr}</div>
              <div className="text-[10px] text-slate-400">USD</div>
            </div>
          </div>

          {/* Copyable Order Code */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
            <div className="text-[11px] font-mono text-slate-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex-1 select-all truncate">
              {orderRef}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
              title="Copy Order Details"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Info'}</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>How to complete this purchase</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300 leading-relaxed whitespace-pre-line font-sans">
            {purchaseInstructions}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceedToDiscord}
            className="flex-[2] py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-lg shadow-[#5865F2]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{buttonLabelMinecraft || 'Buy on Discord'}</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
