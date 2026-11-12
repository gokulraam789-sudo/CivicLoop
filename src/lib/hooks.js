import { useEffect, useState } from 'react'

// Runs an async api call and refetches whenever demo data changes.
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const h = () => setTick((t) => t + 1)
    window.addEventListener('civic:change', h)
    return () => window.removeEventListener('civic:change', h)
  }, [])
  useEffect(() => {
    let live = true
    fn().then((r) => live && setData(r)).catch(() => live && setData(null))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])
  return data
}
