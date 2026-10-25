import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DiscordSettings {
  mainServerUrl: string;
  purchaseSupportUrl: string;
  minecraftProductsUrl: string;
  webDevelopmentUrl: string;
  discordBotsUrl: string;
  serverSetupsUrl: string;
  resourcePacksUrl: string;
  fallbackUrl: string;
  buttonLabelStore: string;
  buttonLabelMinecraft: string;
  buttonLabelServices: string;
  purchaseInstructions: string;
}

const DEFAULT_DISCORD_SETTINGS: DiscordSettings = {
  mainServerUrl: 'https://discord.gg/livingyuji',
  purchaseSupportUrl: 'https://discord.gg/livingyuji',
  minecraftProductsUrl: 'https://discord.gg/livingyuji',
  webDevelopmentUrl: 'https://discord.gg/livingyuji',
  discordBotsUrl: 'https://discord.gg/livingyuji',
  serverSetupsUrl: 'https://discord.gg/livingyuji',
  resourcePacksUrl: 'https://discord.gg/livingyuji',
  fallbackUrl: 'https://discord.gg/livingyuji',
  buttonLabelStore: 'Order via Discord',
  buttonLabelMinecraft: 'Buy on Discord',
  buttonLabelServices: 'Inquire on Discord',
  purchaseInstructions:
    '1. Join the LivingYuji Discord server.\n2. Navigate to the #orders or #tickets channel.\n3. Mention the product code or name to open an order ticket.\n4. LivingYuji or our automated assistant will verify payment & deliver your asset instantly.',
};

interface DiscordSettingsState extends DiscordSettings {
  updateSettings: (settings: Partial<DiscordSettings>) => void;
  resetSettings: () => void;
  getUrlForCategory: (category: string) => string;
}

export const useDiscordSettingsStore = create<DiscordSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_DISCORD_SETTINGS,

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
      },

      resetSettings: () => {
        set(DEFAULT_DISCORD_SETTINGS);
      },

      getUrlForCategory: (category: string) => {
        const state = get();
        const cat = category.toLowerCase();
        if (cat.includes('minecraft') || cat.includes('plugin') || cat.includes('combat')) {
          return state.minecraftProductsUrl || state.mainServerUrl;
        }
        if (cat.includes('bot') || cat.includes('discord')) {
          return state.discordBotsUrl || state.mainServerUrl;
        }
        if (cat.includes('web') || cat.includes('frontend') || cat.includes('portfolio')) {
          return state.webDevelopmentUrl || state.mainServerUrl;
        }
        if (cat.includes('setup') || cat.includes('server')) {
          return state.serverSetupsUrl || state.mainServerUrl;
        }
        if (cat.includes('pack') || cat.includes('model') || cat.includes('texture')) {
          return state.resourcePacksUrl || state.mainServerUrl;
        }
        return state.fallbackUrl || state.mainServerUrl;
      },
    }),
    {
      name: 'livingyuji_discord_settings_v1',
    }
  )
);
