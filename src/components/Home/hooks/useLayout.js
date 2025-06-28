import { useEffect, useState } from 'react';

export const useLayout = () => {
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Window resize handler with debounce
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isGrid2 = gridNumber === 2 && isDesktop;

  const columnCount = (() => {
    if (windowWidth >= 1024) {
      return isGrid2 ? 2 : 1;
    } else if (windowWidth >= 640) {
      return gridNumber === 2 ? 2 : 1;
    }
    return 1;
  })();

  return {
    gridNumber,
    setGridNumber,
    windowWidth,
    isDesktop,
    isGrid2,
    columnCount
  };
};