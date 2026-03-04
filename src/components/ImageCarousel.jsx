import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

function ImageCarousel({ images, title, compact = false, autoPlay = true, interval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const nextImage = useCallback((e) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback((e) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Auto-play
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isFullScreen) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, images.length, isFullScreen])

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsFullScreen(false)
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'ArrowRight') nextImage()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isFullScreen, images.length, nextImage, prevImage])

  return (
    <>
      <div className={`relative group aspect-video overflow-hidden ${compact ? 'rounded-t-2xl' : 'rounded-2xl'} bg-gray-100`}>
        {/* Images */}
        <div 
          className="flex transition-transform duration-500 ease-out h-full cursor-zoom-in"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onClick={() => setIsFullScreen(true)}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img 
                src={image.url} 
                alt={`${title} - view ${index + 1}`} 
                className="w-full h-full object-contain bg-gray-100"
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons (Only show if > 1 image) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index ? 'bg-white w-3 sm:w-4' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Full Screen Overlay */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onClick={() => setIsFullScreen(false)}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
            <h3 className="text-white font-medium text-lg">{title}</h3>
            <button 
              onClick={() => setIsFullScreen(false)}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div 
            className="flex-1 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-[90vw] max-h-[85vh]">
              <img 
                src={images[currentIndex].url} 
                alt={`${title} - full view`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Caption Overlay */}
              {images[currentIndex].caption && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-max max-w-full px-4">
                  <div className="bg-black/60 text-white px-6 py-2 rounded-full text-base sm:text-lg font-medium backdrop-blur-md text-center shadow-lg">
                    {images[currentIndex].caption}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-md">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ImageCarousel