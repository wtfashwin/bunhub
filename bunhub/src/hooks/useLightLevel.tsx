// hooks/useLightLevel.ts
import { useEffect, useState } from 'react';

export const useLightLevel = () => {
  const [lightLevel, setLightLevel] = useState(1); // Starts bright

  useEffect(() => {
    document.body.setAttribute('data-light', String(lightLevel));
  }, [lightLevel]);

  const darken = () => {
    setLightLevel((prev) => (prev < 10 ? prev + 1 : 10));
  };

  const reset = () => setLightLevel(1);

  return { lightLevel, darken, reset };
};
