

import { Page } from '@/lib/types/types';
import { YooptaBlockData } from '@yoopta/editor';
import { create } from 'zustand';



export type PagesDataType = {
  pages: Page[];
  blocks: YooptaBlockData[];
};

export type PagesState = {
  pages: Page[];
  blocks: YooptaBlockData[];
};

export type PagesStoreActions = {
  updatePages: (newPages: Page[]) => void;
  updateBlocks: (newBlocks: YooptaBlockData[]) => void;
};

export type PagesStore =PagesState & PagesStoreActions;

export const initialState: PagesState = {
  pages: [],
  blocks: [],
}

export const usePagesStore = create<PagesStore>()((set) => ({
  ...initialState,

  updatePages: (newPages: Page[]) =>
    set((state) => ({
      pages: newPages,
    })),

  updateBlocks: (newBlocks: YooptaBlockData[]) =>
    set((state) => ({
      blocks: newBlocks,
    })),
}));