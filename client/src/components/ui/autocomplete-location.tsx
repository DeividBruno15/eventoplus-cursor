import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface LocationSuggestion {
  display_name: string;
  city: string;
  state: string;
}

interface AutocompleteLocationProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AutocompleteLocation({
  value,
  onChange,
  placeholder = "Digite sua cidade/estado",
  className = "",
  disabled = false
}: AutocompleteLocationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    if (debouncedValue.length >= 3) {
      searchLocation(debouncedValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedValue]);

  const searchLocation = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=5&q=${encodeURIComponent(query + ", Brasil")}`
      );
      const data = await response.json();
      
      const locationSuggestions = data.map((item: any) => {
        const parts = item.display_name.split(', ');
        const city = parts[0];
        const state = parts.find((part: string) => part.length === 2 && part.toUpperCase() === part) || parts[parts.length - 3];
        return {
          display_name: item.display_name,
          city,
          state,
          formatted: `${city}, ${state}`
        };
      }).filter((item: any, index: number, arr: any[]) => 
        arr.findIndex(i => i.formatted === item.formatted) === index
      ); // Remove duplicates
      
      setSuggestions(locationSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching location:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.formatted);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (e.target.value.length < 3) {
      setShowSuggestions(false);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={disabled}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm">{suggestion.formatted}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 