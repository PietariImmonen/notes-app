import { Block, Page, PageWithBlocks } from "@/lib/types/types";
import { create } from "zustand";

export type PagesDataType = {
  pages: Page[];
  blocks: PageWithBlocks[];
};

export type PagesState = {
  pages: Page[];
  blocks: PageWithBlocks[];
  currentPage: Page | null;
  currentBlocks: PageWithBlocks | null;
  isLoading: boolean;
};

export type PagesStoreActions = {
  updatePages: (newPages: Page[]) => void;
  updateBlocks: (newBlocks: PageWithBlocks[]) => void;
  setCurrentPage: (page: Page | null) => void;
  setCurrentBlocks: (blocks: PageWithBlocks | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

export type PagesStore = PagesState & PagesStoreActions;

export const initialState: PagesState = {
  pages: [],
  blocks: [],
  currentPage: null,
  currentBlocks: null,
  isLoading: false,
};

export const usePagesStore = create<PagesStore>()((set) => ({
  ...initialState,

  updatePages: (newPages: Page[]) =>
    set((state) => ({
      pages: newPages,
    })),

  updateBlocks: (newBlocks: PageWithBlocks[]) =>
    set((state) => ({
      blocks: newBlocks,
    })),

  setCurrentPage: (page: Page | null) =>
    set((state) => ({
      currentPage: page,
    })),

  setCurrentBlocks: (blocks: PageWithBlocks | null) =>
    set((state) => ({
      currentBlocks: blocks,
    })),

  setIsLoading: (isLoading: boolean) =>
    set((state) => ({
      isLoading,
    })),
}));
