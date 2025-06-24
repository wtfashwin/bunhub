
export const getInitialLightLevel = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 5 : 1; 
};
