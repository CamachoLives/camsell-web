import { useEffect, useRef, useState } from 'react'

interface RevealOptions {
  threshold?: number
  once?: boolean
}

/**
 * Returns a ref and a boolean indicating whether the element is visible.
 * When `once` is true (default) the element stays visible after the first entry.
 */
export function useReveal<T extends HTMLElement = HTMLElement>({ threshold = 0.15, once = true }: RevealOptions = {}) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, once])

  return { ref, visible }
}
