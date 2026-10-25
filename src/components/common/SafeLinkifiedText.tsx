'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SafeLinkifiedTextProps {
  text: string;
  searchQuery?: string;
  className?: string;
  showIcon?: boolean;
}

// Allowed URL schemes
const ALLOWED_SCHEMES = ['https:', 'http:'];

// Trailing punctuation characters that are typically not part of URLs
const TRAILING_PUNCTUATION_REGEX = /[.,;:!?)]+$/;

/**
 * Validates and sanitizes a URL string. Returns safe href or null if invalid/dangerous.
 */
export function sanitizeUrl(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  let href = rawUrl.trim();

  // If starts with www. or domain shorthand, prepend https://
  if (/^www\./i.test(href) || /^(github\.com|discord\.gg|livingyuji\.com|x\.com|twitter\.com)\//i.test(href)) {
    href = `https://${href}`;
  }

  try {
    const parsed = new URL(href);
    if (!ALLOWED_SCHEMES.includes(parsed.protocol.toLowerCase())) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Splits text into segments of plain text and recognized URLs,
 * safely separating trailing punctuation from URLs.
 */
export function parseLinks(text: string): Array<{ type: 'text' | 'link'; content: string; href?: string }> {
  if (!text) return [];

  // Regex matching http/https URLs, www. URLs, and common developer domains
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+|www\.[a-zA-Z0-9][-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&//=]*|(?:github\.com|discord\.gg)\/[^\s<>"'{}|\\^`]+)/gi;

  const result: Array<{ type: 'text' | 'link'; content: string; href?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    let rawUrl = match[0];

    // Push preceding text if any
    if (matchIndex > lastIndex) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex, matchIndex),
      });
    }

    // Separate trailing punctuation (e.g. "https://example.com." -> URL "https://example.com" + ".")
    let trailingPunctuation = '';
    const punctMatch = rawUrl.match(TRAILING_PUNCTUATION_REGEX);
    if (punctMatch) {
      // Check if parentheses are balanced (e.g., in Wikipedia URLs)
      const openParens = (rawUrl.match(/\(/g) || []).length;
      const closeParens = (rawUrl.match(/\)/g) || []).length;
      
      if (punctMatch[0] !== ')' || closeParens > openParens) {
        trailingPunctuation = punctMatch[0];
        rawUrl = rawUrl.slice(0, -trailingPunctuation.length);
      }
    }

    const safeHref = sanitizeUrl(rawUrl);

    if (safeHref) {
      result.push({
        type: 'link',
        content: rawUrl,
        href: safeHref,
      });
    } else {
      result.push({
        type: 'text',
        content: rawUrl,
      });
    }

    if (trailingPunctuation) {
      result.push({
        type: 'text',
        content: trailingPunctuation,
      });
    }

    lastIndex = matchIndex + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return result;
}

/**
 * Highlights search matches within text safely without raw HTML injection.
 */
function renderHighlightedText(text: string, query?: string): React.ReactNode {
  if (!query || !query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={idx} className="bg-amber-400 text-slate-950 px-1 py-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * SafeLinkifiedText:
 * Safely transforms plain text containing URLs into clickable, accessible links
 * with full security protections (rel="noopener noreferrer", scheme validation, no HTML injection).
 */
export function SafeLinkifiedText({
  text,
  searchQuery,
  className,
  showIcon = false,
}: SafeLinkifiedTextProps) {
  if (!text) return null;

  const segments = parseLinks(text);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'link' && seg.href) {
          return (
            <a
              key={idx}
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-1 text-sky-400 hover:text-sky-300 underline underline-offset-2 decoration-sky-400/40 hover:decoration-sky-300 transition-colors cursor-pointer break-all font-mono select-text"
              onClick={(e) => e.stopPropagation()}
              title={`Open ${seg.href} in new tab`}
            >
              <span>{renderHighlightedText(seg.content, searchQuery)}</span>
              {showIcon && <ExternalLink size={10} className="inline opacity-70 shrink-0 self-center" />}
            </a>
          );
        }

        return <React.Fragment key={idx}>{renderHighlightedText(seg.content, searchQuery)}</React.Fragment>;
      })}
    </span>
  );
}
