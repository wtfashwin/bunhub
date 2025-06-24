import { useState, useEffect } from 'react';

export const useSearchLightTransition = () => {
  const [lightLevel, setLightLevel] = useState(1);

  useEffect(() => {
    document.body.setAttribute('data-light', lightLevel.toFixed(1));
  }, [lightLevel]);

  const decreaseLight = () => {
    setLightLevel(prev => Math.max(0, parseFloat((prev - 0.1).toFixed(1))));
  };

  return { lightLevel, decreaseLight };
};
