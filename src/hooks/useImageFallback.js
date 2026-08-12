import { useCallback, useEffect, useState } from 'react'

export function useImageFallback(src) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  const markFailed = useCallback(() => setFailed(true), [])
  return [failed, markFailed]
}
