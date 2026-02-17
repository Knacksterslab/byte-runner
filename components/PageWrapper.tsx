'use client'

import { ReactNode } from 'react'
import Footer from './Footer'

interface PageWrapperProps {
  children: ReactNode
  className?: string
  showFooter?: boolean
}

export function PageWrapper({ children, className = '', showFooter = true }: PageWrapperProps) {
  return (
    <>
      <style jsx>{`
        .page-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: scroll;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          scrollbar-width: none;
          touch-action: pan-y;
        }
        .page-wrapper::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
      <div className={`page-wrapper ${className}`}>
        {children}
        {showFooter && <Footer />}
      </div>
    </>
  )
}
