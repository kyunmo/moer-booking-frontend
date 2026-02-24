import bookmarkApi from '@/api/bookmarks'
import { defineStore } from 'pinia'

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    bookmarks: [],
    bookmarkedIds: new Set(),
    loading: false,
  }),

  getters: {
    isBookmarked: state => businessId => {
      return state.bookmarkedIds.has(businessId)
    },
    bookmarkCount: state => state.bookmarks.length,
  },

  actions: {
    async fetchBookmarks() {
      this.loading = true
      try {
        const { data } = await bookmarkApi.getBookmarks()

        this.bookmarks = data || []
        this.bookmarkedIds = new Set(this.bookmarks.map(b => b.businessId))

        return this.bookmarks
      }
      catch (error) {
        this.bookmarks = []
        this.bookmarkedIds = new Set()
        throw error
      }
      finally {
        this.loading = false
      }
    },

    async toggleBookmark(businessId) {
      const wasBookmarked = this.bookmarkedIds.has(businessId)

      // Optimistic update
      if (wasBookmarked) {
        this.bookmarkedIds.delete(businessId)
        this.bookmarks = this.bookmarks.filter(b => b.businessId !== businessId)
      }
      else {
        this.bookmarkedIds.add(businessId)
      }

      try {
        if (wasBookmarked) {
          await bookmarkApi.removeBookmark(businessId)
        }
        else {
          await bookmarkApi.addBookmark(businessId)
        }

        return !wasBookmarked
      }
      catch (error) {
        // Revert optimistic update
        if (wasBookmarked) {
          this.bookmarkedIds.add(businessId)
        }
        else {
          this.bookmarkedIds.delete(businessId)
        }
        throw error
      }
    },

    async checkBookmark(businessId) {
      try {
        const { data } = await bookmarkApi.checkBookmark(businessId)

        if (data.bookmarked) {
          this.bookmarkedIds.add(businessId)
        }
        else {
          this.bookmarkedIds.delete(businessId)
        }

        return data.bookmarked
      }
      catch {
        return false
      }
    },
  },
})
