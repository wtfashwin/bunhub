import React, { useEffect, useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [lightLevel, setLightLevel] = useState(1.0);


  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = isDark ? 1.0 : 0.0;
    setLightLevel(initial);
    document.body.dataset.light = initial.toFixed(1);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);

    if (value.length > 0 && lightLevel > 0) {
      const newLevel = Math.max(0, lightLevel - 0.1);
      setLightLevel(newLevel);
      document.body.dataset.light = newLevel.toFixed(1);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <input
        type="text"
        value={query}
        onChange={handleInput}
        placeholder="Search GitHub users or repositories..."
        className="w-full px-6 py-4 text-lg rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        autoFocus
      />
    </div>
  );
};

export default SearchBar;
