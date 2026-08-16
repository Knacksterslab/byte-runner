import { useState, useEffect, useRef } from 'react'
import { initCrazyGames, cgLoadingStart, cgLoadingStop } from '@/lib/crazygames'

export interface AssetLoaderState {
  isMounted: boolean
  isLoading: boolean
  loadProgress: number
}

export function useAssetLoader(): AssetLoaderState {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsMounted(true)
    initCrazyGames()
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const images = {
      background: new Image(),
    }

    cgLoadingStart()

    let loadedCount = 0
    const totalImages = Object.keys(images).length

    const handleImageLoad = () => {
      loadedCount++
      setLoadProgress((loadedCount / totalImages) * 100)
      if (loadedCount === totalImages) {
        timeoutRef.current = setTimeout(() => {
          cgLoadingStop()
          setIsLoading(false)
        }, 2000)
      }
    }

    Object.values(images).forEach(img => {
      img.onload = handleImageLoad
      img.onerror = handleImageLoad
    })

    images.background.src = '/space-background-final.webp'

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      Object.values(images).forEach(img => {
        img.src = ''
        img.onload = null
        img.onerror = null
      })
    }
  }, [isMounted])

  return { isMounted, isLoading, loadProgress }
}
