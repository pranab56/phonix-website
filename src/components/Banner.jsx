import { useSilderQuery } from '@/features/report/reportApi';
import { useCallback, useEffect, useState } from 'react';
import { baseURL } from '../../utils/BaseURL';
import './Banner.css';

const CarouselBanner = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { data, isLoading, isError } = useSilderQuery();

  const slides = data?.data || [];

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

        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${opacityClass} ${positionClass}`}
          >
            {/* Banner image container */}
            <div className="absolute inset-0 w-full h-full px-3 sm:px-10 rounded-xl overflow-hidden">
              <img
                src={`${baseURL}${item.image}`}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover rounded-xl transition-transform duration-5000 ease-out"
                style={{ transform: index === activeSlide ? 'scale(1.01)' : 'scale(1)' }}
              />
            </div>
          </div>
        );
      })}

      {/* Indicators - only show if more than one slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center rounded-xl space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => changeSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSlide === index
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselBanner;