import { useSilderQuery } from '@/features/report/reportApi';
import { useCallback, useEffect, useState } from 'react';
import { baseURL } from '../../utils/BaseURL';

const CarouselBanner = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [loadingProgress, setLoadingProgress] = useState({});
  const { data, isLoading, isError } = useSilderQuery();

  const slides = data?.data || [];

  // Simulate chunked loading progress
  const simulateChunkedLoading = useCallback((imageIndex, imageUrl) => {
    const chunks = 8; // Number of loading chunks
    let currentChunk = 0;

    const loadChunk = () => {
      currentChunk++;
      const progress = (currentChunk / chunks) * 100;

      setLoadingProgress(prev => ({
        ...prev,
        [imageIndex]: progress
      }));

      if (currentChunk < chunks) {
        // Random delay between 50-200ms for realistic loading feel
        setTimeout(loadChunk, Math.random() * 150 + 50);
      } else {
        // Image fully loaded
        setLoadedImages(prev => new Set([...prev, imageIndex]));
        setLoadingProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[imageIndex];
          return newProgress;
        });
      }
    };

    // Start loading simulation
    setTimeout(loadChunk, 100);
  }, []);

  // Preload images with chunked loading simulation
  useEffect(() => {
    if (!slides.length) return;

    slides.forEach((item, index) => {
      if (!loadedImages.has(index)) {
        const img = new Image();
        img.onload = () => {
          simulateChunkedLoading(index, `${baseURL}${item.image}`);
        };
        img.onerror = () => {
          // Handle error - mark as loaded to prevent infinite loading
          setLoadedImages(prev => new Set([...prev, index]));
        };
        img.src = `${baseURL}${item.image}`;
      }
    });
  }, [slides, loadedImages, simulateChunkedLoading]);

  // Handle slide transition - extracted to a reusable function
  const changeSlide = useCallback((newIndex) => {
    if (isTransitioning) return;

    setPrevSlide(activeSlide);
    setIsTransitioning(true);
    setActiveSlide(newIndex);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  }, [activeSlide, isTransitioning]);

  // Calculate transition direction - memoized with useCallback
  const getTransitionDirection = useCallback((current, previous, totalSlides) => {
    if (current === previous) return '';

    // Handle wrap-around case
    if (current === 0 && previous === totalSlides - 1) return 'right';
    if (current === totalSlides - 1 && previous === 0) return 'left';

    return current > previous ? 'right' : 'left';
  }, []);

  useEffect(() => {
    // Skip auto-slide if there's only one slide or none
    if (!slides.length || slides.length <= 1) return;

    // Auto-slide every 10 seconds
    const interval = setInterval(() => {
      const nextSlide = activeSlide === slides.length - 1 ? 0 : activeSlide + 1;
      changeSlide(nextSlide);
    }, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [activeSlide, changeSlide, slides.length]);

  // Handle loading and error states
  if (isLoading) return <div className="w-full h-64 bg-gray-200 animate-pulse rounded-xl"></div>;
  if (isError) return <div className="w-full h-64 bg-red-100 flex items-center justify-center rounded-xl">Failed to load banner</div>;
  if (!slides || slides.length === 0) return null;

  const direction = getTransitionDirection(activeSlide, prevSlide, slides.length);

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-xl sm:my-2">
      {/* Carousel slides */}
      {slides.map((item, index) => {
        // Determine slide animation classes
        let positionClass = '';
        let opacityClass = '';

        if (index === activeSlide) {
          opacityClass = 'opacity-100';
          positionClass = direction === 'right' ? 'translate-x-0' : direction === 'left' ? 'translate-x-0' : '';
        } else if (index === prevSlide && isTransitioning) {
          opacityClass = 'opacity-0';
          positionClass = direction === 'right' ? '-translate-x-full' : direction === 'left' ? 'translate-x-full' : '';
        } else {
          opacityClass = 'opacity-0';
        }

        const isImageLoaded = loadedImages.has(index);
        const loadingProgressValue = loadingProgress[index] || 0;

        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${opacityClass} ${positionClass}`}
          >
            {/* Banner image container */}
            <div className="absolute inset-0 w-full h-full px-3 sm:px-10 rounded-xl overflow-hidden">
              {isImageLoaded ? (
                // Fully loaded image with subtle zoom effect
                <img
                  src={`${baseURL}${item.image}`}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-5000 ease-out"
                  style={{ transform: index === activeSlide ? 'scale(1.01)' : 'scale(1)' }}
                />
              ) : (
                // Loading state with chunked progress
                <div className="w-full h-full bg-gray-200 rounded-xl relative overflow-hidden">
                  {/* Background skeleton */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>

                  {/* Chunked loading visualization */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 8 }, (_, chunkIndex) => {
                      const chunkProgress = Math.max(0, Math.min(100, loadingProgressValue - (chunkIndex * 12.5)));
                      const chunkLoaded = chunkProgress >= 12.5;

                      return (
                        <div
                          key={chunkIndex}
                          className="flex-1 h-full relative overflow-hidden"
                          style={{
                            background: chunkLoaded
                              ? `linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)`
                              : 'transparent'
                          }}
                        >
                          {/* Chunk loading animation */}
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-300 ease-out"
                            style={{
                              height: `${Math.min(100, chunkProgress * 8)}%`,
                              opacity: chunkLoaded ? 0.6 : 0.3
                            }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Loading text and progress */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-600 text-sm font-medium mb-2">
                        {/* Loading Image... */}
                      </div>
                      <div className="w-32 h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 ease-out"
                          style={{ width: `${loadingProgressValue}%` }}
                        ></div>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {Math.round(loadingProgressValue)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Indicators - only show if more than one slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center rounded-xl space-x-3">
          {slides.map((_, index) => {
            const isImageLoaded = loadedImages.has(index);
            return (
              <button
                key={index}
                onClick={() => changeSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 relative ${activeSlide === index
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {/* Loading indicator on dots */}
                {!isImageLoaded && (
                  <div className="absolute inset-0 rounded-full border border-white/30 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CarouselBanner;