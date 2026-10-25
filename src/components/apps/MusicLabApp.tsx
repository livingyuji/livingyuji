'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Clock, Home, Library, MoreHorizontal, Shuffle, Repeat } from 'lucide-react';

interface Track {
  id: string;
  number: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  coverGradient: string;
}

interface Album {
  id: string;
  title: string;
  type: string;
  releaseYear: string;
  songsCount: number;
  totalTime: string;
  description: string;
  coverGradient: string;
  accentColor: string;
  tracks: Track[];
}

const ALBUMS: Album[] = [
  {
    id: 'christmas-2025',
    title: 'Christmas 2025: New Tales',
    type: 'Album',
    releaseYear: '2025',
    songsCount: 7,
    totalTime: '19 min 40 sec',
    description: "Official holiday cyber soundscape and ambient winter tracks by LivingYuji. Atmospheric lo-fi chords, chill pentatonic synths, and festive midnight programming rhythms.",
    coverGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    accentColor: '#10B981',
    tracks: [
      { id: 'c1', number: 1, title: 'Frostbite Protocol', artist: 'LivingYuji', album: 'Christmas 2025: New Tales', duration: '2:45', durationSec: 165, coverGradient: 'from-teal-500 to-emerald-600' },
      { id: 'c2', number: 2, title: 'Snowfall Synthwave', artist: 'LivingYuji', album: 'Christmas 2025: New Tales', duration: '3:12', durationSec: 192, coverGradient: 'from-cyan-500 to-blue-600' },
      { id: 'c3', number: 3, title: 'Arcane Bells & Reverie', artist: 'LivingYuji', album: 'Christmas 2025: New Tales', duration: '3:05', durationSec: 185, coverGradient: 'from-emerald-600 to-teal-700' },
      { id: 'c4', number: 4, title: 'Silent Server Night', artist: 'LivingYuji', album: 'Christmas 2025: New Tales', duration: '2:50', durationSec: 170, coverGradient: 'from-indigo-600 to-purple-800' },
      { id: 'c5', number: 5, title: 'Cyber Pine Tree', artist: 'LivingYuji', album: 'Christmas 2025: New Tales', duration: '3:30', durationSec: 210, coverGradient: 'from-green-600 to-emerald-800' },
      { id: 'c6', number: 6, title: 'Subzero Overclock', artist: 'LivingYuji', album: 'Christmas 2025: New Tales', duration: '2:18', durationSec: 138, coverGradient: 'from-sky-500 to-cyan-700' },
      { id: 'c7', number: 7, title: 'New Dawn 2026', artist: 'LivingYuji', album: 'Christmas 2025: New Tales', duration: '2:00', durationSec: 120, coverGradient: 'from-emerald-400 to-teal-600' },
    ],
  },
  {
    id: 'famous-songs',
    title: 'Famous Songs & Soundtracks',
    type: 'Album',
    releaseYear: '2026',
    songsCount: 5,
    totalTime: '15 min 20 sec',
    description: "LivingYuji's most requested electronic tracks from Minecraft trailers, YouTube plugin demos, and developer live streams.",
    coverGradient: 'from-purple-900 via-indigo-950 to-slate-950',
    accentColor: '#8B5CF6',
    tracks: [
      { id: 'f1', number: 1, title: 'Cyber Drift', artist: 'LivingYuji', album: 'Famous Songs & Soundtracks', duration: '2:45', durationSec: 165, coverGradient: 'from-purple-500 to-indigo-600' },
      { id: 'f2', number: 2, title: 'Midnight Code', artist: 'LivingYuji', album: 'Famous Songs & Soundtracks', duration: '3:12', durationSec: 192, coverGradient: 'from-indigo-500 to-violet-700' },
      { id: 'f3', number: 3, title: 'Arcane Reverie', artist: 'LivingYuji', album: 'Famous Songs & Soundtracks', duration: '3:05', durationSec: 185, coverGradient: 'from-violet-600 to-purple-800' },
      { id: 'f4', number: 4, title: 'Vanta Depths', artist: 'LivingYuji', album: 'Famous Songs & Soundtracks', duration: '2:50', durationSec: 170, coverGradient: 'from-fuchsia-600 to-pink-700' },
      { id: 'f5', number: 5, title: 'Neon Skylines', artist: 'LivingYuji', album: 'Famous Songs & Soundtracks', duration: '3:28', durationSec: 208, coverGradient: 'from-pink-500 to-rose-600' },
    ],
  },
  {
    id: 'loop-420',
    title: 'Loop 420: Infinite Beats',
    type: 'Album',
    releaseYear: '2026',
    songsCount: 4,
    totalTime: '11 min 45 sec',
    description: "Endless lo-fi chillhop loops engineered for deep coding sessions, bug hunting, and server management.",
    coverGradient: 'from-amber-900 via-stone-950 to-slate-950',
    accentColor: '#F59E0B',
    tracks: [
      { id: 'l1', number: 1, title: 'Coffee & Redstone', artist: 'LivingYuji', album: 'Loop 420: Infinite Beats', duration: '2:55', durationSec: 175, coverGradient: 'from-amber-500 to-orange-600' },
      { id: 'l2', number: 2, title: 'Packet Loss Blues', artist: 'LivingYuji', album: 'Loop 420: Infinite Beats', duration: '3:00', durationSec: 180, coverGradient: 'from-orange-500 to-amber-700' },
      { id: 'l3', number: 3, title: 'Terminal Rain', artist: 'LivingYuji', album: 'Loop 420: Infinite Beats', duration: '2:40', durationSec: 160, coverGradient: 'from-yellow-600 to-amber-800' },
      { id: 'l4', number: 4, title: 'Async Dreams', artist: 'LivingYuji', album: 'Loop 420: Infinite Beats', duration: '3:10', durationSec: 190, coverGradient: 'from-amber-600 to-yellow-700' },
    ],
  },
];

export function MusicLabApp() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('christmas-2025');
  const [currentTrack, setCurrentTrack] = useState<Track>(ALBUMS[0].tracks[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['c1', 'c3', 'f1']));
  const [isAlbumLiked, setIsAlbumLiked] = useState<boolean>(true);
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);

  const selectedAlbum = ALBUMS.find((a) => a.id === selectedAlbumId) || ALBUMS[0];
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Web Audio Synth for ambient playback
  const startSynth = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
      let step = 0;

      oscillatorTimerRef.current = setInterval(() => {
        if (!audioContextRef.current || isMuted || volume === 0) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        const note = notes[step % notes.length];
        osc.frequency.setValueAtTime(note, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06 * (isMuted ? 0 : volume), ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.2);
        step++;
      }, 500);
    } catch (err) {
      console.warn('Audio playback not supported:', err);
    }
  };

  const stopSynth = () => {
    if (oscillatorTimerRef.current) {
      clearInterval(oscillatorTimerRef.current);
      oscillatorTimerRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSynth();
      setIsPlaying(false);
    } else {
      startSynth();
      setIsPlaying(true);
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    if (!isPlaying) {
      startSynth();
      setIsPlaying(true);
    }
  };

  const playAlbum = (album: Album) => {
    setSelectedAlbumId(album.id);
    playTrack(album.tracks[0]);
  };

  const handleNextTrack = () => {
    const list = selectedAlbum.tracks;
    const idx = list.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % list.length;
    playTrack(list[nextIdx]);
  };

  const handlePrevTrack = () => {
    const list = selectedAlbum.tracks;
    const idx = list.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + list.length) % list.length;
    playTrack(list[prevIdx]);
  };

  const toggleLikeTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.durationSec) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    return () => stopSynth();
  }, []);

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] text-white select-none overflow-hidden font-sans">
      {/* Upper Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Dark Sidebar (Spotify style) */}
        <div className="w-60 bg-[#000000] p-3 flex flex-col gap-2 shrink-0 border-r border-white/5">
          {/* Navigation Pill Group */}
          <div className="bg-[#121212] rounded-xl p-3 space-y-3">
            <button
              onClick={() => setSelectedAlbumId('christmas-2025')}
              className="flex items-center gap-4 text-sm font-semibold text-white/90 hover:text-white transition-colors w-full"
            >
              <Home size={20} className="text-white" />
              <span>Home</span>
            </button>
            <button className="flex items-center gap-4 text-sm font-semibold text-white/70 hover:text-white transition-colors w-full">
              <Library size={20} className="text-white/70" />
              <span>Your Library</span>
            </button>
          </div>

          {/* Albums List */}
          <div className="flex-1 bg-[#121212] rounded-xl p-2 overflow-y-auto window-scroll flex flex-col gap-1">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Playlists & Albums
            </div>

            {ALBUMS.map((alb) => {
              const isSelected = alb.id === selectedAlbumId;
              return (
                <button
                  key={alb.id}
                  onClick={() => setSelectedAlbumId(alb.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                    isSelected ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-md bg-gradient-to-br ${alb.coverGradient} flex items-center justify-center text-base shadow-sm shrink-0 border border-white/10`}
                  >
                    🎵
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate text-white">{alb.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">Album • LivingYuji</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto window-scroll bg-gradient-to-b from-[#1E2430] to-[#121212] flex flex-col">
          {/* Album Hero Header */}
          <div className="p-7 flex items-end gap-6 bg-gradient-to-b from-[#2B3548] to-transparent">
            {/* Glowing Album Art Box */}
            <div
              className={`w-48 h-48 rounded-lg bg-gradient-to-br ${selectedAlbum.coverGradient} shadow-2xl flex flex-col items-center justify-center border border-white/20 relative group shrink-0 overflow-hidden`}
              style={{ boxShadow: `0 20px 40px -15px ${selectedAlbum.accentColor}40` }}
            >
              <div className="text-5xl drop-shadow-md">🎄</div>
              <div className="text-[11px] font-bold tracking-widest text-emerald-300 uppercase mt-2">
                LivingYuji OS
              </div>
              <div className="text-[10px] text-emerald-200/80">Digital Release</div>
            </div>

            {/* Album Metadata */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                {selectedAlbum.type}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {selectedAlbum.title}
              </h1>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {selectedAlbum.description}{' '}
                <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">
                  Read more
                </span>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium pt-1">
                <span className="font-bold text-white">LivingYuji</span>
                <span>•</span>
                <span>{selectedAlbum.releaseYear}</span>
                <span>•</span>
                <span>
                  {selectedAlbum.songsCount} songs, {selectedAlbum.totalTime}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row: Big Green Play Button, Heart, Options */}
          <div className="px-7 py-4 flex items-center gap-5">
            <button
              onClick={() => {
                if (currentTrack.album === selectedAlbum.title && isPlaying) {
                  togglePlay();
                } else {
                  playAlbum(selectedAlbum);
                }
              }}
              className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition-all"
              title={isPlaying && currentTrack.album === selectedAlbum.title ? 'Pause' : 'Play'}
            >
              {isPlaying && currentTrack.album === selectedAlbum.title ? (
                <Pause size={24} className="fill-black" />
              ) : (
                <Play size={24} className="fill-black ml-1" />
              )}
            </button>

            <button
              onClick={() => setIsAlbumLiked(!isAlbumLiked)}
              className="text-white/70 hover:text-white transition-colors"
              title="Save to Your Library"
            >
              <Heart
                size={26}
                className={isAlbumLiked ? 'text-[#1DB954] fill-[#1DB954]' : 'text-slate-400'}
              />
            </button>

            <button className="text-slate-400 hover:text-white transition-colors" title="More options">
              <MoreHorizontal size={26} />
            </button>
          </div>

          {/* Song Table */}
          <div className="px-7 pb-10 flex-1">
            {/* Table Header */}
            <div className="grid grid-cols-[36px_1fr_1fr_80px] text-xs font-semibold text-slate-400 border-b border-white/10 pb-2 px-3">
              <div className="text-center">#</div>
              <div>Title</div>
              <div className="hidden sm:block">Album</div>
              <div className="text-right flex items-center justify-end">
                <Clock size={15} />
              </div>
            </div>

            {/* Table Rows */}
            <div className="mt-2 space-y-0.5">
              {selectedAlbum.tracks.map((track) => {
                const isThisTrackPlaying = isPlaying && currentTrack.id === track.id;
                const isSelectedTrack = currentTrack.id === track.id;
                const isHovered = hoveredTrackId === track.id;
                const isLiked = likedTrackIds.has(track.id);

                return (
                  <div
                    key={track.id}
                    onMouseEnter={() => setHoveredTrackId(track.id)}
                    onMouseLeave={() => setHoveredTrackId(null)}
                    onClick={() => playTrack(track)}
                    className={`grid grid-cols-[36px_1fr_1fr_80px] items-center text-xs px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                      isSelectedTrack
                        ? 'bg-white/15 text-emerald-400'
                        : 'hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {/* Index / Play Triangle */}
                    <div className="text-center text-slate-400 group-hover:text-white font-medium flex items-center justify-center">
                      {isHovered ? (
                        <Play size={13} className="fill-current text-white" />
                      ) : isThisTrackPlaying ? (
                        <span className="text-emerald-400 text-xs animate-pulse">🔊</span>
                      ) : (
                        <span>{track.number}</span>
                      )}
                    </div>

                    {/* Title + Thumbnail + Artist */}
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div
                        className={`w-9 h-9 rounded bg-gradient-to-br ${track.coverGradient} flex items-center justify-center text-sm shadow-sm shrink-0 border border-white/10`}
                      >
                        🎵
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-semibold text-xs truncate ${
                            isSelectedTrack ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{track.artist}</div>
                      </div>
                    </div>

                    {/* Album Name */}
                    <div className="text-slate-400 text-xs truncate hidden sm:block">
                      {track.album}
                    </div>

                    {/* Duration + Heart */}
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button
                        onClick={(e) => toggleLikeTrack(track.id, e)}
                        className={`transition-opacity ${
                          isLiked ? 'opacity-100 text-[#1DB954]' : 'opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                      >
                        <Heart size={14} className={isLiked ? 'fill-[#1DB954]' : ''} />
                      </button>
                      <span className="tabular-nums text-xs">{track.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Media Controller Bar (Windows / Spotify style) */}
      <div className="h-20 bg-[#181818] border-t border-white/10 px-4 flex items-center justify-between shrink-0 select-none">
        {/* Current track info */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          <div
            className={`w-12 h-12 rounded bg-gradient-to-br ${currentTrack.coverGradient} flex items-center justify-center text-base shadow-md shrink-0 border border-white/10`}
          >
            🎵
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-white truncate text-xs hover:underline cursor-pointer">
              {currentTrack.title}
            </div>
            <div className="text-[11px] text-slate-400 truncate hover:underline cursor-pointer">
              {currentTrack.artist}
            </div>
          </div>
          <button
            onClick={(e) => toggleLikeTrack(currentTrack.id, e)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Heart
              size={16}
              className={likedTrackIds.has(currentTrack.id) ? 'text-[#1DB954] fill-[#1DB954]' : ''}
            />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Scrubber */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-lg px-4">
          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-white transition-colors" title="Shuffle">
              <Shuffle size={15} />
            </button>
            <button
              onClick={handlePrevTrack}
              className="text-slate-400 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-md transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={16} className="fill-black" />
              ) : (
                <Play size={16} className="fill-black ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNextTrack}
              className="text-slate-400 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward size={18} />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors" title="Repeat">
              <Repeat size={15} />
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>{formatSecs(currentTime)}</span>
            <div
              className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setCurrentTime(Math.floor(pos * currentTrack.durationSec));
              }}
            >
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] transition-all"
                style={{ width: `${(currentTime / currentTrack.durationSec) * 100}%` }}
              />
            </div>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Right: Volume & Speaker Controls */}
        <div className="flex items-center justify-end gap-3 w-64">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 h-1 accent-[#1DB954] bg-white/20 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
