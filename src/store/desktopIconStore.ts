import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppId } from '@/store/windowStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface IconPosition {
  x: number;
  y: number;
}

export const GRID_CONFIG = {
  startX: 16,
  startY: 16,
  cellWidth: 92,
  cellHeight: 96,
};

// Default layout matching user reference screenshot (3 columns)
export const getDefaultIconPositions = (): Record<string, IconPosition> => {
  const { startX, startY, cellWidth, cellHeight } = GRID_CONFIG;

  return {
    // Column 1 (Leftmost, x = 16)
    thispc: { x: startX + 0 * cellWidth, y: startY + 0 * cellHeight }, // Row 1, Col 1 (This PC)
    recyclebin: { x: startX + 0 * cellWidth, y: startY + 1 * cellHeight }, // Row 2, Col 1 (Recycle Bin)
    projects: { x: startX + 0 * cellWidth, y: startY + 2 * cellHeight }, // Row 3, Col 1 (Developer Lab)
    music: { x: startX + 0 * cellWidth, y: startY + 3 * cellHeight }, // Row 4, Col 1 (Music Lab)
    resume: { x: startX + 0 * cellWidth, y: startY + 4 * cellHeight }, // Row 5, Col 1 (Resume)
    about: { x: startX + 0 * cellWidth, y: startY + 5 * cellHeight }, // Row 6, Col 1 (Biography)
    contact: { x: startX + 0 * cellWidth, y: startY + 6 * cellHeight }, // Row 7, Col 1 (Contact Info)

    // Column 2 (Middle, x = 108)
    blog: { x: startX + 1 * cellWidth, y: startY + 0 * cellHeight }, // Row 1, Col 2 (Blog)
    games: { x: startX + 1 * cellWidth, y: startY + 1 * cellHeight }, // Row 2, Col 2 (Games)
    store: { x: startX + 1 * cellWidth, y: startY + 2 * cellHeight }, // Row 3, Col 2 (Store)
    minecraftstore: { x: startX + 1 * cellWidth, y: startY + 3 * cellHeight }, // Row 4, Col 2 (Minecraft Store)
    memorywall: { x: startX + 1 * cellWidth, y: startY + 4 * cellHeight }, // Row 5, Col 2 (Memory Wall)

    // Column 3 (Right, x = 200)
    paint: { x: startX + 2 * cellWidth, y: startY + 0 * cellHeight }, // Row 1, Col 3 (Paint)
    browser: { x: startX + 2 * cellWidth, y: startY + 1 * cellHeight }, // Row 2, Col 3 (LivingYuji Browser)
    terminal: { x: startX + 2 * cellWidth, y: startY + 2 * cellHeight }, // Row 3, Col 3 (Terminal)
    showcase: { x: startX + 2 * cellWidth, y: startY + 3 * cellHeight }, // Row 4, Col 3 (Showcase directly underneath Terminal!)
  };
};

export const snapCoordinatesToGrid = (x: number, y: number): IconPosition => {
  const { startX, startY, cellWidth, cellHeight } = GRID_CONFIG;
  const col = Math.max(0, Math.round((x - startX) / cellWidth));
  const row = Math.max(0, Math.round((y - startY) / cellHeight));
  return {
    x: startX + col * cellWidth,
    y: startY + row * cellHeight,
  };
};

interface DesktopIconState {
  positions: Record<string, IconPosition>;
  movementEnabled: boolean;
  selectedIconId: string | null;
  setPosition: (appId: string, x: number, y: number) => void;
  setMovementEnabled: (enabled: boolean) => void;
  setSelectedIconId: (id: string | null) => void;
  resetToDefaultLayout: () => void;
  fetchCloudLayout: () => Promise<void>;
  saveCloudLayout: () => Promise<void>;
}

export const useDesktopIconStore = create<DesktopIconState>()(
  persist(
    (set, get) => ({
      positions: getDefaultIconPositions(),
      movementEnabled: true,
      selectedIconId: null,

      setPosition: (appId, x, y) => {
        set((state) => ({
          positions: {
            ...state.positions,
            [appId]: { x, y },
          },
        }));
      },

      setMovementEnabled: (enabled: boolean) => {
        set({ movementEnabled: enabled });
      },

      setSelectedIconId: (id: string | null) => {
        set({ selectedIconId: id });
      },

      resetToDefaultLayout: () => {
        set({ positions: getDefaultIconPositions() });
        get().saveCloudLayout();
      },

      fetchCloudLayout: async () => {
        if (!isSupabaseConfigured() || !supabase) return;
        try {
          const { data, error } = await supabase
            .from('desktop_layouts')
            .select('positions')
            .eq('id', 'default')
            .single();
          if (data && data.positions && typeof data.positions === 'object') {
            set((state) => ({
              positions: { ...state.positions, ...data.positions },
            }));
          }
        } catch (err) {
          console.warn('Failed to load cloud desktop layout:', err);
        }
      },

      saveCloudLayout: async () => {
        if (!isSupabaseConfigured() || !supabase) return;
        try {
          const positions = get().positions;
          await supabase.from('desktop_layouts').upsert({
            id: 'default',
            positions,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Failed to save cloud desktop layout:', err);
        }
      },
    }),
    {
      name: 'livingyuji_desktop_icon_positions_v4',
      partialize: (state) => ({
        positions: state.positions,
        movementEnabled: state.movementEnabled ?? true,
      }),
    }
  )
);
