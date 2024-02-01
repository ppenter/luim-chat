import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export interface IFunctionApp {
  name: string;
  isActive: boolean;
  config: any;
}

export interface IOpenaiSetting {
  apiKey?: string;
  engine?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface IPluginSetting {
  name_for_human: string;
  description_for_human: string;
  auth: boolean;
  tags: string[];
  api: any[];
  logo_url?: string;
  contact_email?: string;
}

export interface IInstalledPlugin {
  name: string;
  isActive: boolean;
  url?: string;
  authorization?: string;
}

export const functionAppConfigAtom = atom<{
  [key: string]: IFunctionApp;
}>({
  key: "functionAppConfig",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

export const meAtom = atom<any>({
  key: "meAtom",
  default: null,
});

export const openaiSettingAtom = atom<IOpenaiSetting | null>({
  key: "openaiSettingAtom",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const pluginsAtom = atom({
  key: "pluginsAtom",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const pluginsSettingAtom = atom<IPluginSetting[] | []>({
  key: "pluginsSettingAtom",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const functionsContextAtom = atom({
  key: "functionsContextAtom",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const installedPluginsAtom = atom<IInstalledPlugin[] | []>({
  key: "installedPluginsAtom",
  default: [],
  effects_UNSTABLE: [persistAtom],
});
