import { create } from 'zustand'

interface CrawlStore {
  url: string
  setUrl: (url: string) => void
}

export const useCrawlStore = create<CrawlStore>((set) => ({
  url: '',
  setUrl: (url) => set({ url }),
}))
