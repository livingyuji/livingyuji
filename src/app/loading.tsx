import React from 'react';

export default function RootLoading() {
  return (
    <aside
      role="status"
      aria-label="Loading LivingYuji OS"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#000000] text-white select-none overflow-hidden"
    >
      {/* Top spacer */}
      <div className="w-full h-12 md:h-16" aria-hidden="true" />

      {/* Center Hero Block — Matching reference image */}
      <div className="flex flex-col items-center text-center">
        {/* 4-Square Windows-style Grid Logo */}
        <div
          className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-6 sm:mb-7 filter drop-shadow-[0_4px_24px_rgba(255,255,255,0.06)]"
          aria-hidden="true"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px]" />
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px]" />
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px]" />
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFFFFF] rounded-[7px] sm:rounded-[8px]" />
        </div>

        {/* Primary Identity Name */}
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-normal font-sans mb-2 antialiased">
          LivingYuji
        </h1>

        {/* Subtitle with wide letter-spacing */}
        <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.28em] text-[#8A909E] uppercase font-sans mb-12 sm:mb-14 antialiased">
          System Builder &mdash; Creative Technologist
        </p>

        {/* Minimalist Circular Ring Spinner matching reference */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[2.5px] border-white/10" />
          <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-white motion-safe:animate-spin" />
        </div>
      </div>

      {/* Footer Branding Line matching reference image */}
      <footer className="w-full pb-8 sm:pb-10 text-center px-4">
        <p className="text-[9.5px] sm:text-[10.5px] tracking-[0.25em] text-[#717684] uppercase font-sans antialiased">
          Powered by LivingYuji&apos;s Creative Mind
        </p>
      </footer>
    </aside>
  );
}
