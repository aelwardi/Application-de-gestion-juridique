import { defineStore } from 'pinia'

export interface Toast {
    id: string
    title: string
    message?: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

export const useToastStore = defineStore('toast', {
    state: () => ({
        toasts: [] as Toast[],
    }),

    actions: {
        addToast(toast: Omit<Toast, 'id'>) {
            const id = Math.random().toString(36).substring(7)
            const newToast: Toast = {
                ...toast,
                id,
                duration: toast.duration || 5000,
            }

            this.toasts.push(newToast)

            // Auto-remove après la durée spécifiée
            if (newToast.duration && newToast.duration > 0) {
                setTimeout(() => {
                    this.removeToast(id)
                }, newToast.duration)
            }

            return id
        },

        removeToast(id: string) {
            const index = this.toasts.findIndex(t => t.id === id)
            if (index !== -1) {
                this.toasts.splice(index, 1)
            }
        },

        clearAll() {
            this.toasts = []
        },
    },
})
