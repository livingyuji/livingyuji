'use client';

import React, { useState, useRef } from 'react';
import { useFileSystemStore, VFile } from '@/store/fileSystemStore';
import { useWindowStore } from '@/store/windowStore';
import { saveBinaryFile, getBinaryFile, deleteBinaryFile } from '@/lib/storage/binaryStorage';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Home,
  Monitor,
  Download,
  FileText,
  Image,
  Palette,
  Disc,
  HardDrive,
  Upload,
  FolderPlus,
  LayoutGrid,
  List,
  Trash2,
  ExternalLink,
  Check,
  Folder,
} from 'lucide-react';
import type { AppId } from '@/store/windowStore';

interface ThisPCAppProps {
  initialFolderId?: string;
}

interface DriveItem {
  id: string;
  driveLetter: string;
  name: string;
  freeSpace: string;
  totalSpace: string;
  percentUsed: number;
  targetFolderId?: string;
  associatedApp?: AppId;
}

const DRIVES: DriveItem[] = [
  {
    id: 'drive-c',
    driveLetter: 'C:',
    name: 'C: System',
    freeSpace: '136 GB free of 256 GB',
    totalSpace: '256 GB',
    percentUsed: 47,
    targetFolderId: 'c-root',
  },
  {
    id: 'drive-d',
    driveLetter: 'D:',
    name: 'D: — My Projects',
    freeSpace: '55 GB free of 100 GB',
    totalSpace: '100 GB',
    percentUsed: 45,
    targetFolderId: 'd-root',
  },
  {
    id: 'drive-e',
    driveLetter: 'E:',
    name: 'E: Music Lab',
    freeSpace: '122 GB free of 200 GB',
    totalSpace: '200 GB',
    percentUsed: 39,
    associatedApp: 'music',
  },
];

export function ThisPCApp({ initialFolderId = 'root' }: ThisPCAppProps) {
  const { files, createFolder, deleteItem, uploadFile } = useFileSystemStore();
  const { openWindow } = useWindowStore();

  const [currentFolderId, setCurrentFolderId] = useState<string>(initialFolderId);
  const [history, setHistory] = useState<string[]>([initialFolderId]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigateTo = (folderId: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
    setSelectedItemId(null);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolderId(history[historyIndex - 1]);
      setSelectedItemId(null);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolderId(history[historyIndex + 1]);
      setSelectedItemId(null);
    }
  };

  const goUp = () => {
    if (currentFolderId === 'root') return;
    if (currentFolderId === 'd-root' || currentFolderId === 'c-root') {
      navigateTo('root');
      return;
    }
    const current = files.find((f) => f.id === currentFolderId);
    if (current && current.parentId) {
      navigateTo(current.parentId);
    } else {
      navigateTo('root');
    }
  };

  const getAddressPath = () => {
    if (currentFolderId === 'root') return 'This PC';
    if (currentFolderId === 'c-root') return 'C:/';
    if (currentFolderId === 'd-root') return 'D: — My Projects';
    if (currentFolderId === 'u-desktop') return 'C:/Users/LivingYuji/Desktop';
    if (currentFolderId === 'u-downloads') return 'C:/Users/LivingYuji/Downloads';
    if (currentFolderId === 'u-documents') return 'C:/Users/LivingYuji/Documents';
    if (currentFolderId === 'u-pictures') return 'C:/Users/LivingYuji/Pictures';

    // Breadcrumbs path
    const parts: string[] = [];
    let cur = files.find((f) => f.id === currentFolderId);
    while (cur) {
      parts.unshift(cur.name);
      cur = files.find((f) => f.id === cur?.parentId);
    }
    return parts.length > 0 ? `D: — My Projects/${parts.join('/')}` : 'This PC';
  };

  const isRootView = currentFolderId === 'root';

  const currentFolderFiles = files
    .filter((f) => f.parentId === currentFolderId)
    .filter((f) => !searchQuery.trim() || f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDriveDoubleClick = (drive: DriveItem) => {
    if (drive.associatedApp) {
      openWindow(drive.associatedApp);
    } else if (drive.targetFolderId) {
      navigateTo(drive.targetFolderId);
    }
  };

  const handleItemDoubleClick = (item: VFile) => {
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else if (item.name.toLowerCase().endsWith('.txt') || item.name.toLowerCase().endsWith('.md') || item.type === 'text') {
      openWindow('textviewer' as AppId, { folderId: item.id, title: item.name });
    } else if (item.associatedApp) {
      openWindow(item.associatedApp as AppId);
    }
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file ceiling for IndexedDB storage

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const currentFolder = files.find((f) => f.id === currentFolderId);
    const targetDrive: 'C:' | 'D:' = currentFolder?.drive || 'D:';

    let successCount = 0;
    const fileList = Array.from(uploadedFiles);

    for (const file of fileList) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadToast(`File "${file.name}" exceeds 50MB limit.`);
        continue;
      }

      const isText =
        file.type.startsWith('text/') ||
        ['.txt', '.md', '.json', '.yml', '.yaml', '.sk', '.ts', '.js', '.css', '.html'].some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );

      if (isText) {
        const textContent = await file.text().catch(() => '');
        uploadFile(currentFolderId, targetDrive, {
          name: file.name,
          size: file.size,
          content: textContent,
        });
        successCount++;
      } else {
        // Binary file (images, audio, jars, zips) — save metadata in virtual store & raw bytes in IndexedDB!
        const fileId = uploadFile(currentFolderId, targetDrive, {
          name: file.name,
          size: file.size,
        });

        try {
          await saveBinaryFile(fileId, file.name, file.type, file);
          successCount++;
        } catch (err: any) {
          console.error('IndexedDB binary storage error:', err);
          setUploadToast(`Failed to store binary data for "${file.name}"`);
        }
      }
    }

    if (successCount > 0) {
      setUploadToast(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''} successfully!`);
      setTimeout(() => setUploadToast(null), 3000);
    }

    e.target.value = '';
  };

  const handleCreateNewFolder = () => {
    const currentFolder = files.find((f) => f.id === currentFolderId);
    const targetDrive: 'C:' | 'D:' = currentFolder?.drive || 'D:';
    createFolder(currentFolderId, targetDrive);
  };

  const handleDownloadFile = async (item: VFile) => {
    try {
      // 1. Check IndexedDB for binary payload first
      const binaryRecord = await getBinaryFile(item.id);
      if (binaryRecord && binaryRecord.data) {
        const url = URL.createObjectURL(binaryRecord.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // 2. Fall back to text content stored in metadata
      if (typeof item.content === 'string') {
        const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      setUploadToast(`File "${item.name}" has no local content to download.`);
      setTimeout(() => setUploadToast(null), 3000);
    } catch (err: any) {
      console.error('File download error:', err);
      setUploadToast(`Error downloading "${item.name}".`);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="h-full flex flex-col bg-[#181C26] text-slate-200 select-none text-xs font-sans">
      {/* Hidden File Input for Real Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* 1. Top Ribbon Navigation & Address Bar */}
      <div className="h-11 px-3 border-b border-white/10 bg-[#1D2230] flex items-center justify-between gap-3 shrink-0">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Forward"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={goUp}
            disabled={currentFolderId === 'root'}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Up to parent folder"
          >
            <ChevronUp size={16} />
          </button>
        </div>

        {/* Address Pill (Home icon + path) */}
        <div className="flex-1 bg-[#141822] border border-white/10 rounded-lg px-3 py-1 flex items-center gap-2 text-slate-300 shadow-inner min-w-0">
          <Home size={14} className="text-slate-400 shrink-0" />
          <span className="font-normal text-xs text-white truncate">{getAddressPath()}</span>
        </div>

        {/* Search Bar */}
        <div className="relative w-52 shrink-0">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141822] border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* 2. Action Toolbar (Upload, New Folder, View Mode) */}
      <div className="h-9 px-4 bg-[#191E2C] border-b border-white/5 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2">
          {!isRootView && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-medium transition-colors"
                title="Upload real files from your device"
              >
                <Upload size={13} />
                <span>Upload</span>
              </button>

              <button
                onClick={handleCreateNewFolder}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
                title="Create a new folder"
              >
                <FolderPlus size={13} />
                <span>New Folder</span>
              </button>
            </>
          )}

          {uploadToast && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pl-2 animate-in fade-in">
              <Check size={13} />
              <span>{uploadToast}</span>
            </span>
          )}
        </div>

        {/* View Switcher */}
        {!isRootView && (
          <div className="flex items-center gap-1 bg-[#121622] p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#0078D4] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Details / List view"
            >
              <List size={13} />
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Split Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Quick Access & This PC) */}
        <div className="w-56 bg-[#151924] border-r border-white/10 p-3 overflow-y-auto window-scroll flex flex-col gap-4 shrink-0">
          {/* Quick Access */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Quick access
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => navigateTo('u-desktop')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  currentFolderId === 'u-desktop'
                    ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Monitor size={15} className="text-sky-400" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => navigateTo('u-downloads')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  currentFolderId === 'u-downloads'
                    ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Download size={15} className="text-emerald-400" />
                <span>Downloads</span>
              </button>
              <button
                onClick={() => navigateTo('u-documents')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  currentFolderId === 'u-documents'
                    ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <FileText size={15} className="text-amber-400" />
                <span>Documents</span>
              </button>
              <button
                onClick={() => openWindow('paint')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-slate-300 hover:bg-white/5 transition-colors"
              >
                <Palette size={15} className="text-pink-400" />
                <span>Visitor Arts</span>
              </button>
              <button
                onClick={() => navigateTo('u-pictures')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  currentFolderId === 'u-pictures'
                    ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Image size={15} className="text-purple-400" />
                <span>Pictures</span>
              </button>
            </div>
          </div>

          {/* This PC */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              This PC
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => navigateTo('c-root')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  currentFolderId === 'c-root'
                    ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <HardDrive size={15} className="text-slate-400" />
                <span>C: System</span>
              </button>
              <button
                onClick={() => navigateTo('d-root')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  currentFolderId === 'd-root' || currentFolderId.startsWith('d-')
                    ? 'bg-[#0078D4]/20 text-[#38BDF8] font-semibold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <HardDrive size={15} className="text-sky-400" />
                <span>D: — My Projects</span>
              </button>
              <button
                onClick={() => openWindow('music')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-slate-300 hover:bg-white/5 transition-colors"
              >
                <Disc size={15} className="text-emerald-400" />
                <span>E: Music Lab</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 p-5 overflow-y-auto window-scroll bg-[#171B26]">
          {isRootView ? (
            /* VIEW A: Devices and drives */
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white tracking-tight">Devices and drives</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DRIVES.map((drive) => {
                  const isSelected = selectedItemId === drive.id;
                  return (
                    <div
                      key={drive.id}
                      onClick={() => setSelectedItemId(drive.id)}
                      onDoubleClick={() => handleDriveDoubleClick(drive)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#0078D4]/20 border-sky-500/50 ring-1 ring-sky-500/30'
                          : 'bg-[#1D2230]/70 border-white/10 hover:bg-[#202738] hover:border-white/20'
                      }`}
                    >
                      {/* Realistic Hard Drive Icon */}
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-500/40 p-1 flex flex-col justify-between shadow-md shrink-0">
                        <div className="flex items-center justify-between px-1 pt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        </div>
                        <div className="w-7 h-7 mx-auto rounded-full bg-sky-400/80 border-2 border-white/80 flex items-center justify-center shadow-inner">
                          <div className="w-2 h-2 rounded-full bg-slate-800" />
                        </div>
                        <div className="flex items-center justify-between px-1 pb-0.5">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                          <div className="w-2 h-1 bg-slate-400 rounded-sm" />
                        </div>
                      </div>

                      {/* Drive Info & Storage Bar */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{drive.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{drive.freeSpace}</div>
                        <div className="w-full h-2 bg-slate-700/80 rounded-full mt-2 overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-[#0078D4] rounded-full transition-all"
                            style={{ width: `${drive.percentUsed}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* VIEW B: Non-overlapping Grid View with auto-fill minmax(115px) */
            <div className="grid grid-cols-[repeat(auto-fill,minmax(115px,1fr))] gap-3">
              {currentFolderFiles.map((item) => {
                const isSelected = selectedItemId === item.id;
                const isFolder = item.type === 'folder';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    title={item.name}
                    className={`w-full min-w-0 flex flex-col items-center justify-start p-2.5 rounded-xl cursor-pointer text-center select-none overflow-hidden transition-all group ${
                      isSelected
                        ? 'bg-[#0078D4]/25 ring-1 ring-[#0078D4]/70 shadow-sm'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Icon Container */}
                    <div className="w-14 h-14 flex items-center justify-center mb-1 shrink-0 relative">
                      {isFolder ? (
                        /* Windows 11 Yellow Folder */
                        <svg
                          width="52"
                          height="46"
                          viewBox="0 0 64 56"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="drop-shadow-md"
                        >
                          <path
                            d="M4 10C4 6.68629 6.68629 4 10 4H24C26.2091 4 28.2574 5.22836 29.28 7.18571L31.72 11.8143C32.7426 13.7716 34.7909 15 37 15H54C57.3137 15 60 17.6863 60 21V46C60 49.3137 57.3137 52 54 52H10C6.68629 52 4 49.3137 4 46V10Z"
                            fill="#E5A93B"
                          />
                          <path
                            d="M2 20C2 16.6863 4.68629 14 8 14H56C59.3137 14 62 16.6863 62 20V46C62 49.3137 59.3137 52 56 52H8C4.68629 52 2 49.3137 2 46V20Z"
                            fill="#FFCA28"
                          />
                        </svg>
                      ) : (
                        /* Document Notebook File with Blue Border */
                        <div className="w-11 h-13 bg-[#1E2538] border border-sky-400/50 rounded-lg shadow-md flex flex-col justify-between p-2 relative">
                          <div className="space-y-1">
                            <div className="w-5 h-1 bg-sky-400 rounded" />
                            <div className="w-7 h-1 bg-slate-400/60 rounded" />
                            <div className="w-6 h-1 bg-slate-400/60 rounded" />
                          </div>
                          <span className="text-[8px] font-bold text-sky-400 uppercase tracking-wider text-left">
                            {item.extension?.toUpperCase() || 'TXT'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Filename with clean multi-line wrapping and zero overlap */}
                    <div className="w-full min-w-0 px-1 flex flex-col items-center">
                      <span className="w-full text-center text-xs font-medium text-slate-100 break-words line-clamp-2 leading-tight">
                        {item.name}
                      </span>
                      {!isFolder && item.size ? (
                        <span className="w-full text-center text-[10px] text-slate-400 mt-0.5 truncate">
                          {formatFileSize(item.size)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {currentFolderFiles.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 text-xs">
                  This folder is empty. Click &ldquo;Upload&rdquo; or &ldquo;New Folder&rdquo; above.
                </div>
              )}
            </div>
          ) : (
            /* VIEW C: Details / List View */
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 pb-2">
                    <th className="pb-2 font-semibold">Name</th>
                    <th className="pb-2 font-semibold">Date Modified</th>
                    <th className="pb-2 font-semibold">Type</th>
                    <th className="pb-2 font-semibold">Size</th>
                    <th className="pb-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentFolderFiles.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`hover:bg-white/5 cursor-pointer ${
                        selectedItemId === item.id ? 'bg-[#0078D4]/20' : ''
                      }`}
                    >
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          {item.type === 'folder' ? (
                            <Folder size={16} className="text-[#FFCA28]" />
                          ) : (
                            <FileText size={16} className="text-sky-400" />
                          )}
                          <span className="font-medium text-white truncate max-w-xs">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-400">{item.modifiedAt}</td>
                      <td className="py-2.5 text-slate-400 uppercase text-[11px]">
                        {item.type === 'folder' ? 'File folder' : `${item.extension} file`}
                      </td>
                      <td className="py-2.5 font-mono text-slate-400">{formatFileSize(item.size)}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!item.type.includes('folder') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(item);
                              }}
                              className="p-1 hover:text-sky-400 text-slate-400 transition-colors"
                              title="Download"
                            >
                              <Download size={13} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBinaryFile(item.id);
                              deleteItem(item.id);
                            }}
                            className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Status Bar */}
      <div className="h-7 px-4 bg-[#141822] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div>
          {isRootView ? `${DRIVES.length} items` : `${currentFolderFiles.length} items`}
          {selectedItemId && ' • 1 item selected'}
        </div>
        <div className="flex items-center gap-3">
          <span>NTFS Virtual Partition</span>
        </div>
      </div>
    </div>
  );
}
