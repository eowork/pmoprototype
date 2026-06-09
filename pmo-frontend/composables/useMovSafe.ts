import { useToast } from '~/composables/useToast'

const URL_REGEX = /^https?:\/\/.+\..+/i

export type MovState = 'valid' | 'empty' | 'invalid'

const MOV_MESSAGES: Record<Exclude<MovState, 'valid'>, string> = {
  empty: 'No MOV link has been provided for this record.',
  invalid: 'The MOV link appears to be invalid or malformed.',
}

export function useMovSafe() {
  const toast = useToast()

  function resolveMovState(url?: string | null): MovState {
    if (!url || !url.trim()) return 'empty'
    if (!URL_REGEX.test(url.trim())) return 'invalid'
    return 'valid'
  }

  function openMovSafely(url?: string | null): void {
    const state = resolveMovState(url)
    if (state === 'valid') {
      window.open(url!.trim(), '_blank', 'noopener,noreferrer')
    } else {
      toast.error(MOV_MESSAGES[state])
    }
  }

  function openFileSafely(path?: string | null): void {
    if (!path || !path.trim()) {
      toast.error('The MOV file reference is no longer available or has not been attached.')
      return
    }
    window.open(path.trim(), '_blank', 'noopener,noreferrer')
  }

  return { resolveMovState, openMovSafely, openFileSafely }
}
