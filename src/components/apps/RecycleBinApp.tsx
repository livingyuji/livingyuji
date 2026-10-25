'use client';

import React, { useState } from 'react';
import { useFileSystemStore } from '@/store/fileSystemStore';

export function RecycleBinApp() {
  const { files, restoreItem, permanentlyDeleteItem, emptyRecycleBin } = useFileSystemStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const deletedItems = files.filter((f) => f.parentId === 'trash');

  const handleEmpty = () => {
    if (confirm('Are you sure you want to permanently delete all items in the Recycle Bin?')) {
      emptyRecycleBin();
      setSelectedId(null);
    }
  };

  const handleRestoreSelected = () => {
    if (selectedId) {
      restoreItem(selectedId);
      setSelectedId(null);
    }
  };

  const handleRestoreAll = () => {
    deletedItems.forEach((item) => restoreItem(item.id));
    setSelectedId(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#161922] text-slate-100 select-none text-xs">
      {/* Top Action Ribbon */}
      <div className="h-11 px-4 bg-[#1C202C] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestoreSelected}
            disabled={!selectedId}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            <span>↩️</span> Restore selected item
          </button>
          <button
            onClick={handleRestoreAll}
            disabled={deletedItems.length === 0}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            <span>🔄</span> Restore all items
          </button>
          <button
            onClick={handleEmpty}
            disabled={deletedItems.length === 0}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            <span>🗑️</span> Empty Recycle Bin
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          {deletedItems.length} {deletedItems.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Main Files Table */}
      <div className="flex-1 overflow-y-auto window-scroll p-4 bg-[#141720]">
        {deletedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16">
            <span className="text-5xl mb-3">🗑️</span>
            <div className="text-sm font-medium text-slate-300">Recycle Bin is empty</div>
            <div className="text-xs text-slate-500 mt-1">Deleted virtual files from File Explorer appear here.</div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-semibold text-slate-400 border-b border-white/5">
              <span className="col-span-6">Name</span>
              <span className="col-span-3">Original Location</span>
              <span className="col-span-3">Date deleted</span>
            </div>
            {deletedItems.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`grid grid-cols-12 px-3 py-2 rounded-lg cursor-default items-center transition-colors ${
                    isSelected ? 'bg-[#38BDF8]/20 text-white' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="col-span-6 flex items-center gap-2 truncate">
                    <span>{item.type === 'folder' ? '📁' : '📄'}</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="col-span-3 text-[11px] text-slate-400 truncate">
                    {item.drive} Drive ({item.originalParentId || 'Desktop'})
                  </div>
                  <div className="col-span-3 text-[11px] text-slate-400">
                    {item.modifiedAt || '2026-10-25'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
