import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Returns a start function and the seconds remaining in the cooldown.
 * When `seconds` is 0 the user is free to submit again.
 */
export function useRateLimitCooldown(cooldownSeconds = 30) {
  const [remaining, setRemaining] = useState(0)
  const intervalRef = useRef<number | null>(null)

  function clear() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = useCallback(() => {
    clear()
    setRemaining(cooldownSeconds)
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [cooldownSeconds])

  useEffect(() => () => clear(), [])

  return { remaining, start }
}
