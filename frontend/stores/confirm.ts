import { defineStore } from 'pinia'

export interface ConfirmOptions {
    title: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
}

export const useConfirmStore = defineStore('confirm', {
    state: () => ({
        isOpen: false,
        options: {} as ConfirmOptions,
        resolver: null as ((value: boolean) => void) | null,
    }),

    actions: {
        confirm(options: ConfirmOptions): Promise<boolean> {
            this.isOpen = true
            this.options = {
                confirmText: 'Confirmer',
                cancelText: 'Annuler',
                showCancel: true,
                type: 'info',
                ...options,
            }

            return new Promise((resolve) => {
                this.resolver = resolve
            })
        },

        handleConfirm() {
            if (this.resolver) {
                this.resolver(true)
            }
            this.close()
        },

        handleCancel() {
            if (this.resolver) {
                this.resolver(false)
            }
            this.close()
        },

        close() {
            this.isOpen = false
            this.resolver = null
        },
    },
})