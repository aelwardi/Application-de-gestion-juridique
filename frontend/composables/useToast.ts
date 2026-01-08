import { useToastStore } from '~/stores/toast'

export const useToast = () => {
    const toastStore = useToastStore()

    return {
        success(title: string, message?: string, duration?: number) {
            return toastStore.addToast({
                title,
                message,
                type: 'success',
                duration,
            })
        },

        error(title: string, message?: string, duration?: number) {
            return toastStore.addToast({
                title,
                message,
                type: 'error',
                duration,
            })
        },

        warning(title: string, message?: string, duration?: number) {
            return toastStore.addToast({
                title,
                message,
                type: 'warning',
                duration,
            })
        },

        info(title: string, message?: string, duration?: number) {
            return toastStore.addToast({
                title,
                message,
                type: 'info',
                duration,
            })
        },

        remove(id: string) {
            toastStore.removeToast(id)
        },

        clearAll() {
            toastStore.clearAll()
        },
    }
}
