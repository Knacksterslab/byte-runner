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
      virus: new Image(),
      firewall: new Image(),
      malware: new Image(),
      dataBreach: new Image(),
      spamWave: new Image(),
      dataPacket: new Image(),
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

    images.virus.src = '/assets/sprites/virus.png'
    images.firewall.src = '/assets/sprites/firewall.png'
    images.malware.src = '/assets/sprites/malware.png'
    images.dataBreach.src = '/assets/sprites/data-breach.png'
    images.spamWave.src = '/assets/sprites/spam-wave.png'
    images.dataPacket.src = '/assets/sprites/data-packet.png'
    images.background.src = '/space-background-final.png'

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
