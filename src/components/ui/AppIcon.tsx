import React from 'react';
import type { AppDef } from '@/config/apps';

interface AppIconProps {
  type: AppDef['iconType'] | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-11 h-11',
  xl: 'w-14 h-14',
};

export function AppIcon({ type, size = 'lg', className = '' }: AppIconProps) {
  const s = sizeClasses[size];

  switch (type) {
    case 'thispc':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Monitor body */}
          <rect x="5" y="6" width="38" height="26" rx="3" fill="url(#pc-grad)" stroke="#2563EB" strokeWidth="1.5" />
          {/* Screen */}
          <rect x="8" y="9" width="32" height="20" rx="1.5" fill="#0284C7" />
          <path d="M8 9H40V16L8 23V9Z" fill="white" fillOpacity="0.15" />
          <rect x="11" y="24" width="6" height="3" rx="0.5" fill="#38BDF8" fillOpacity="0.6" />
          {/* Stand */}
          <path d="M21 32H27V38H21V32Z" fill="#94A3B8" />
          <path d="M15 38H33C33.5523 38 34 38.4477 34 39V40C34 40.5523 33.5523 41 33 41H15C14.4477 41 14 40.5523 14 40V39C14 38.4477 14.4477 38 15 38Z" fill="#CBD5E1" />
          <defs>
            <linearGradient id="pc-grad" x1="5" y1="6" x2="43" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E3A8A" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'recyclebin':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bin top */}
          <path d="M12 14H36L34 40C34 41.1 33.1 42 32 42H16C14.9 42 14 41.1 14 40L12 14Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Grid ribs */}
          <path d="M18 19V37M24 19V37M30 19V37" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          {/* Lid */}
          <rect x="9" y="10" width="30" height="4" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M20 7C20 6.44772 20.4477 6 21 6H27C27.5523 6 28 6.44772 28 7V10H20V7Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Recycle symbol in center */}
          <circle cx="24" cy="27" r="4.5" fill="#38BDF8" fillOpacity="0.2" />
        </svg>
      );

    case 'music':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="21" fill="#1DB954" />
          <path d="M14 20C21 16 30 17 35 20M15 25C21 21.5 29 22.5 33 25M17 30C21.5 27.5 27.5 28 31 30" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'projects':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Back folder */}
          <path d="M6 10C6 8.89543 6.89543 8 8 8H18L22 12H40C41.1046 12 42 12.8954 42 14V38C42 39.1046 41.1046 40 40 40H8C6.89543 40 6 39.1046 6 38V10Z" fill="#D97706" />
          {/* Paper sheet */}
          <rect x="11" y="14" width="26" height="18" rx="1" fill="#F8FAFC" />
          {/* Code tags on paper */}
          <path d="M16 22L19 19M16 22L19 25M32 22L29 19M32 22L29 25M25 18L23 26" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
          {/* Front folder tab */}
          <path d="M4 18C4 16.8954 4.89543 16 6 16H42C43.1046 16 44 16.8954 44 18L41 38C41 39.1046 40.1046 40 39 40H7C5.89543 40 5 39.1046 5 38L4 18Z" fill="#F59E0B" />
        </svg>
      );

    case 'resume':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="6" width="28" height="36" rx="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="14" y="10" width="20" height="28" rx="2" fill="#F0F9FF" />
          {/* Document lines */}
          <rect x="17" y="14" width="8" height="3" rx="1" fill="#0284C7" />
          <rect x="17" y="20" width="14" height="2" rx="0.5" fill="#94A3B8" />
          <rect x="17" y="24" width="14" height="2" rx="0.5" fill="#94A3B8" />
          <rect x="17" y="28" width="10" height="2" rx="0.5" fill="#94A3B8" />
          <rect x="17" y="32" width="12" height="2" rx="0.5" fill="#0284C7" />
        </svg>
      );

    case 'about':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="url(#bio-grad)" stroke="#EC4899" strokeWidth="1.5" />
          {/* Glowing Fingerprint pattern */}
          <path d="M24 13C17.9249 13 13 17.9249 13 24M24 16C19.5817 16 16 19.5817 16 24C16 28.4183 19.5817 32 24 32M24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29M24 22C22.8954 22 22 22.8954 22 24C22 25.1046 22.8954 26 24 26M24 13C30.0751 13 35 17.9249 35 24C35 30.0751 30.0751 35 24 35M24 16C28.4183 16 32 19.5817 32 24C32 28.4183 28.4183 32 24 32" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="bio-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B0764" />
              <stop offset="1" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'contact':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="10" width="36" height="28" rx="4" fill="#0EA5E9" />
          <circle cx="16" cy="21" r="5" fill="#F0F9FF" />
          <path d="M10 32C10 28.6863 12.6863 26 16 26C19.3137 26 22 28.6863 22 32H10Z" fill="#F0F9FF" />
          {/* Card details lines */}
          <rect x="25" y="17" width="13" height="3" rx="1" fill="#F0F9FF" />
          <rect x="25" y="23" width="9" height="2" rx="1" fill="#BAE6FD" />
          <rect x="25" y="28" width="11" height="2" rx="1" fill="#BAE6FD" />
        </svg>
      );

    case 'blog':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Typewriter body */}
          <rect x="8" y="18" width="32" height="22" rx="4" fill="#06B6D4" stroke="#0891B2" strokeWidth="1.5" />
          {/* Paper sticking out */}
          <rect x="14" y="6" width="20" height="15" rx="1.5" fill="#FFFFFF" />
          <rect x="17" y="9" width="14" height="2" rx="0.5" fill="#94A3B8" />
          <rect x="17" y="13" width="10" height="2" rx="0.5" fill="#94A3B8" />
          {/* Keys row */}
          <circle cx="14" cy="26" r="2" fill="#E0F2FE" />
          <circle cx="20" cy="26" r="2" fill="#E0F2FE" />
          <circle cx="26" cy="26" r="2" fill="#E0F2FE" />
          <circle cx="32" cy="26" r="2" fill="#E0F2FE" />
          <circle cx="16" cy="32" r="2" fill="#E0F2FE" />
          <circle cx="22" cy="32" r="2" fill="#E0F2FE" />
          <circle cx="28" cy="32" r="2" fill="#E0F2FE" />
          {/* Spacebar */}
          <rect x="17" y="36" width="14" height="2" rx="1" fill="#FFFFFF" />
        </svg>
      );

    case 'games':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Card 1 (Back/Tilted) */}
          <rect x="6" y="10" width="24" height="32" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" transform="rotate(-10 6 10)" />
          <path d="M14 18L17 21L14 24L11 21L14 18Z" fill="#DC2626" transform="rotate(-10 6 10)" />
          {/* Card 2 (Front) */}
          <rect x="18" y="10" width="24" height="32" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Ace of Spades */}
          <path d="M30 20C28.5 22.5 26 23.5 26 25.5C26 26.8 27.2 28 28.5 28C29.8 28 30 27 30 27C30 27 30.2 28 31.5 28C32.8 28 34 26.8 34 25.5C34 23.5 31.5 22.5 30 20Z" fill="#0F172A" />
          <path d="M29 27H31V30H29V27Z" fill="#0F172A" />
          <text x="21" y="18" fill="#0F172A" fontSize="7" fontWeight="bold" fontFamily="sans-serif">A</text>
        </svg>
      );

    case 'store':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shopping bag */}
          <path d="M9 16C9 14.8954 9.89543 14 11 14H37C38.1046 14 39 14.8954 39 16L37 40C37 41.1046 36.1046 42 35 42H13C11.8954 42 11 41.1046 11 40L9 16Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Handle */}
          <path d="M18 17V12C18 8.68629 20.6863 6 24 6C27.3137 6 30 8.68629 30 12V17" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {/* 4 Windows Store Colors */}
          <rect x="18" y="22" width="5" height="5" rx="0.5" fill="#EF4444" />
          <rect x="25" y="22" width="5" height="5" rx="0.5" fill="#10B981" />
          <rect x="18" y="29" width="5" height="5" rx="0.5" fill="#3B82F6" />
          <rect x="25" y="29" width="5" height="5" rx="0.5" fill="#F59E0B" />
        </svg>
      );

    case 'minecraftstore':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Minecraft Isometric Grass Block with Emerald Gem Badge */}
          {/* Top Face */}
          <path d="M24 6L40 15L24 24L8 15L24 6Z" fill="#10B981" stroke="#059669" strokeWidth="1" />
          <path d="M24 8L36 15L24 22L12 15L24 8Z" fill="#34D399" fillOpacity="0.4" />
          {/* Left Face (Dirt) */}
          <path d="M8 15L24 24V40L8 31V15Z" fill="#78350F" stroke="#451A03" strokeWidth="1" />
          <path d="M8 15L24 24V28L8 19V15Z" fill="#059669" />
          <path d="M12 21V24M16 23V27M20 22V25" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right Face (Dirt) */}
          <path d="M24 24L40 15V31L24 40V24Z" fill="#92400E" stroke="#451A03" strokeWidth="1" />
          <path d="M24 24L40 15V19L24 28V24Z" fill="#047857" />
          <path d="M28 22V25M32 23V27M36 21V24" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          {/* Center Golden Shopping Gem */}
          <circle cx="24" cy="24" r="8" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
          <path d="M21 21H27L28 28H20L21 21Z" fill="#78350F" />
          <path d="M23 19C23 18.4 23.4 18 24 18C24.6 18 25 18.4 25 19V21H23V19Z" stroke="#78350F" strokeWidth="1" />
        </svg>
      );

    case 'memorywall':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="11" width="34" height="26" rx="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <path d="M7 13L24 26L41 13" stroke="#F0F9FF" strokeWidth="2" strokeLinecap="round" />
          {/* Red Heart seal */}
          <circle cx="24" cy="27" r="6" fill="#EF4444" />
          <path d="M24 29.5C23.5 29 21.5 27.5 21.5 26.2C21.5 25.3 22.2 24.6 23.1 24.6C23.6 24.6 24 24.9 24 25.1C24 24.9 24.4 24.6 24.9 24.6C25.8 24.6 26.5 25.3 26.5 26.2C26.5 27.5 24.5 29 24 29.5Z" fill="white" />
        </svg>
      );

    case 'paint':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Palette */}
          <path d="M22 6C12.0589 6 4 14.0589 4 24C4 33.9411 12.0589 42 22 42C25.5 42 28 39.5 28 37C28 35.8 27.5 34.8 26.8 34C26.1 33.2 25.7 32.2 25.7 31C25.7 28.8 27.5 27 29.7 27H34C39.5228 27 44 22.5228 44 17C44 10.9249 34.1503 6 22 6Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Paint spots */}
          <circle cx="14" cy="17" r="3.5" fill="#EF4444" />
          <circle cx="22" cy="13" r="3.5" fill="#F59E0B" />
          <circle cx="30" cy="15" r="3.5" fill="#10B981" />
          <circle cx="36" cy="21" r="3.5" fill="#3B82F6" />
          <circle cx="14" cy="28" r="3.5" fill="#8B5CF6" />
          {/* Thumb hole */}
          <ellipse cx="20" cy="35" rx="3" ry="2.5" fill="#64748B" fillOpacity="0.3" />
        </svg>
      );

    case 'browser':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#2563EB" />
          <circle cx="24" cy="24" r="19" stroke="#60A5FA" strokeWidth="1.5" fill="none" />
          {/* Chrome / Edge orb swirl */}
          <circle cx="24" cy="24" r="8" fill="#F8FAFC" />
          <path d="M24 16C28 16 31.5 18 33.5 21L27 32H20L15 23H24" fill="#EF4444" />
          <path d="M33.5 21C35.5 24.5 35.5 28.5 33.5 32L24 32L27 21L33.5 21Z" fill="#F59E0B" />
          <path d="M24 32C20 32 16.5 30 14.5 27L20 18L24 24L24 32Z" fill="#10B981" />
          <circle cx="24" cy="24" r="5" fill="#2563EB" />
        </svg>
      );

    case 'terminal':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="8" width="36" height="32" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
          {/* Top header bar */}
          <path d="M6 12C6 9.79086 7.79086 8 10 8H38C40.2091 8 42 9.79086 42 12V14H6V12Z" fill="#1E293B" />
          <circle cx="11" cy="11" r="1.5" fill="#EF4444" />
          <circle cx="15" cy="11" r="1.5" fill="#F59E0B" />
          <circle cx="19" cy="11" r="1.5" fill="#10B981" />
          {/* Prompt >_ */}
          <path d="M12 21L18 26L12 31" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="31" x2="30" y2="31" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'showcase':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Back card */}
          <rect x="10" y="8" width="28" height="32" rx="4" fill="url(#showcase-grad-bg)" stroke="#1E40AF" strokeWidth="1.5" />
          {/* Front angled card */}
          <rect x="6" y="12" width="28" height="28" rx="4" fill="url(#showcase-grad-fg)" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Content lines on front card */}
          <rect x="10" y="17" width="12" height="3" rx="1.5" fill="#38BDF8" />
          <rect x="10" y="23" width="20" height="2" rx="1" fill="#94A3B8" />
          <rect x="10" y="28" width="16" height="2" rx="1" fill="#94A3B8" />
          {/* Shining gemstone / star badge */}
          <path d="M34 14L36 20L42 22L36 24L34 30L32 24L26 22L32 20L34 14Z" fill="#FACC15" stroke="#EAB308" strokeWidth="1" />
          <circle cx="34" cy="22" r="2" fill="white" />
          <defs>
            <linearGradient id="showcase-grad-bg" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="showcase-grad-fg" x1="6" y1="12" x2="34" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0369A1" />
              <stop offset="1" stopColor="#082F49" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'admin':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L8 10V22C8 32.5 14.8 42.1 24 44C33.2 42.1 40 32.5 40 22V10L24 4Z" fill="url(#admin-grad)" stroke="#38BDF8" strokeWidth="2" strokeLinejoin="round" />
          <path d="M24 14V34M16 24H32" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <defs>
            <linearGradient id="admin-grad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'settings':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="8" fill="#64748B" />
          <path d="M24 4V8M24 40V44M4 24H8M40 24H44M9.8 9.8L12.6 12.6M35.4 35.4L38.2 38.2M9.8 38.2L12.6 35.4M35.4 12.6L38.2 9.8" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="24" cy="24" r="14" stroke="#94A3B8" strokeWidth="3" />
        </svg>
      );

    case 'notes':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Notepad Body */}
          <rect x="8" y="6" width="32" height="36" rx="4" fill="url(#notes-bg)" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Top Binding */}
          <path d="M8 10C8 7.79 9.79 6 12 6H36C38.21 6 40 7.79 40 10V14H8V10Z" fill="#F59E0B" />
          {/* Notepad Lines */}
          <line x1="14" y1="20" x2="34" y2="20" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="26" x2="34" y2="26" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="32" x2="26" y2="32" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          {/* Pin Tag */}
          <circle cx="24" cy="10" r="2" fill="#FEF3C7" />
          <defs>
            <linearGradient id="notes-bg" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFBEB" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'tasks':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Board Body */}
          <rect x="8" y="6" width="32" height="36" rx="4" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Checkbox 1 (Checked) */}
          <rect x="13" y="14" width="6" height="6" rx="1.5" fill="#0284C7" />
          <path d="M14.5 17L16 18.5L18.5 15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="17" x2="34" y2="17" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          {/* Checkbox 2 (Checked) */}
          <rect x="13" y="24" width="6" height="6" rx="1.5" fill="#0284C7" />
          <path d="M14.5 27L16 28.5L18.5 25.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="27" x2="32" y2="27" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          {/* Checkbox 3 (Pending) */}
          <rect x="13" y="34" width="6" height="6" rx="1.5" stroke="#64748B" strokeWidth="1.5" fill="none" />
          <line x1="22" y1="37" x2="30" y2="37" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'calendar':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Calendar Body */}
          <rect x="7" y="8" width="34" height="34" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Red Header Bar */}
          <path d="M7 12C7 9.79 8.79 8 11 8H37C39.21 8 41 9.79 41 12V17H7V12Z" fill="#EF4444" />
          {/* Rings */}
          <rect x="13" y="5" width="3" height="6" rx="1.5" fill="#CBD5E1" />
          <rect x="32" y="5" width="3" height="6" rx="1.5" fill="#CBD5E1" />
          {/* Grid Dots */}
          <circle cx="14" cy="24" r="1.5" fill="#94A3B8" />
          <circle cx="21" cy="24" r="1.5" fill="#94A3B8" />
          <circle cx="28" cy="24" r="1.5" fill="#94A3B8" />
          <circle cx="35" cy="24" r="1.5" fill="#94A3B8" />
          <circle cx="14" cy="31" r="1.5" fill="#94A3B8" />
          <circle cx="21" cy="31" r="1.5" fill="#EF4444" />
          <circle cx="28" cy="31" r="1.5" fill="#94A3B8" />
          <circle cx="35" cy="31" r="1.5" fill="#94A3B8" />
          <circle cx="14" cy="37" r="1.5" fill="#94A3B8" />
          <circle cx="21" cy="37" r="1.5" fill="#94A3B8" />
          <circle cx="28" cy="37" r="1.5" fill="#94A3B8" />
        </svg>
      );

    case 'calculator':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Calculator Body */}
          <rect x="9" y="5" width="30" height="38" rx="4" fill="#182234" stroke="#0EA5E9" strokeWidth="1.5" />
          {/* Screen */}
          <rect x="13" y="9" width="22" height="9" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <rect x="23" y="13" width="9" height="2" rx="0.5" fill="#38BDF8" />
          {/* Buttons grid */}
          <circle cx="16" cy="24" r="2" fill="#64748B" />
          <circle cx="22" cy="24" r="2" fill="#64748B" />
          <circle cx="28" cy="24" r="2" fill="#64748B" />
          <circle cx="34" cy="24" r="2" fill="#F59E0B" />
          <circle cx="16" cy="30" r="2" fill="#64748B" />
          <circle cx="22" cy="30" r="2" fill="#64748B" />
          <circle cx="28" cy="30" r="2" fill="#64748B" />
          <circle cx="34" cy="30" r="2" fill="#F59E0B" />
          <circle cx="16" cy="36" r="2" fill="#64748B" />
          <circle cx="22" cy="36" r="2" fill="#64748B" />
          <circle cx="28" cy="36" r="2" fill="#0284C7" />
          <circle cx="34" cy="36" r="2" fill="#0284C7" />
        </svg>
      );

    case 'clipboard':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clipboard Board */}
          <rect x="10" y="8" width="28" height="34" rx="3" fill="#6366F1" stroke="#4F46E5" strokeWidth="1.5" />
          {/* Paper */}
          <rect x="13" y="13" width="22" height="26" rx="2" fill="#EEF2FF" />
          {/* Clip */}
          <rect x="19" y="5" width="10" height="6" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="24" cy="8" r="1" fill="#475569" />
          {/* Document lines */}
          <line x1="17" y1="20" x2="31" y2="20" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="26" x2="31" y2="26" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="32" x2="25" y2="32" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'devstudio':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* IDE Frame */}
          <rect x="6" y="7" width="36" height="34" rx="4" fill="url(#devstudio-bg)" stroke="#818CF8" strokeWidth="1.5" />
          {/* Top Bar */}
          <path d="M6 11C6 8.79 7.79 7 10 7H38C40.21 7 42 8.79 42 11V14H6V11Z" fill="#1E1B4B" />
          <circle cx="11" cy="10.5" r="1.5" fill="#EF4444" />
          <circle cx="15.5" cy="10.5" r="1.5" fill="#F59E0B" />
          <circle cx="20" cy="10.5" r="1.5" fill="#10B981" />
          {/* Code Braces { } */}
          <path d="M19 20C17 20 16 21 16 23V25C16 26.5 15 27 14 27C15 27 16 27.5 16 29V31C16 33 17 34 19 34" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M29 20C31 20 32 21 32 23V25C32 26.5 33 27 34 27C33 27 32 27.5 32 29V31C32 33 31 34 29 34" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="27" r="1.5" fill="#A855F7" />
          <defs>
            <linearGradient id="devstudio-bg" x1="6" y1="7" x2="42" y2="41" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F172A" />
              <stop offset="1" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'sysmonitor':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Screen Body */}
          <rect x="6" y="8" width="36" height="30" rx="4" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
          {/* Pulse Line */}
          <path d="M10 24H18L21 16L25 32L29 21L32 26L34 24H38" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Stand */}
          <path d="M20 38H28V41H20V38Z" fill="#10B981" />
          <path d="M16 41H32V42C32 42.55 31.55 43 31 43H17C16.45 43 16 42.55 16 42V41Z" fill="#34D399" />
        </svg>
      );

    case 'appstore':
      return (
        <svg className={`${s} ${className}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shopping Bag Handle */}
          <path d="M18 16V12C18 8.68629 20.6863 6 24 6C27.3137 6 30 8.68629 30 12V16" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Shopping Bag Body */}
          <rect x="8" y="14" width="32" height="28" rx="4" fill="url(#appstore-bg)" stroke="#0284C7" strokeWidth="1.5" />
          {/* 4 Colored Windows-style Tiles */}
          <rect x="17" y="22" width="6" height="6" rx="1" fill="#F87171" />
          <rect x="25" y="22" width="6" height="6" rx="1" fill="#60A5FA" />
          <rect x="17" y="30" width="6" height="6" rx="1" fill="#34D399" />
          <rect x="25" y="30" width="6" height="6" rx="1" fill="#FBBF24" />
          <defs>
            <linearGradient id="appstore-bg" x1="8" y1="14" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0369A1" />
              <stop offset="1" stopColor="#0C4A6E" />
            </linearGradient>
          </defs>
        </svg>
      );

    default:
      return (
        <div className={`${s} bg-primary/20 rounded-xl flex items-center justify-center text-lg`}>
          📁
        </div>
      );
  }
}
