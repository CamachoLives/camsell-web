import { useEffect, useRef, useState } from 'react'

/** Returns a ref and whether the element is currently intersecting. */
export function useIntersection<T extends HTMLElement = HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null)
  const [intersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, intersecting }
}
