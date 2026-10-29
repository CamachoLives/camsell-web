import { useEffect, useRef, useState } from 'react'

/**
 * Anima un número desde 0 hasta `target` cuando el componente entra en el viewport.
 * Usa IntersectionObserver para activarse solo cuando es visible.
 */
export function useCountUp(target: number | undefined, duration = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (target === undefined) return

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        const startTime = performance.now()
        const startValue = 0

        function tick(now: number) {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          // easeOutQuart para sensación más natural
          const eased = 1 - (1 - progress) ** 4
          setValue(Math.round(startValue + (target - startValue) * eased))
          if (progress < 1) {
            requestAnimationFrame(tick)
          }
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [target, duration])

  return { value: target === undefined ? undefined : value, ref }
}
