import { useConfirmStore } from '~/stores/confirm'
import type { ConfirmOptions } from '~/stores/confirm'

export const useConfirm = () => {
  const confirmStore = useConfirmStore()

  return {
    confirm(options: ConfirmOptions) {
      return confirmStore.confirm(options)
    },
  }
}