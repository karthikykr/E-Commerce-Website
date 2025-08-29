'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { products } from '@/data/products';

interface SearchSuggestionsProps {
  searchQuery: string;
  onSelect: (query: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  searchQuery,
  onSelect,
  isVisible,
  onClose,
}) => {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const query = searchQuery.toLowerCase();
      const productSuggestions = new Set<string>();

      products.forEach((product) => {
        // Add product names that match
        if (product.name.toLowerCase().includes(query)) {
          productSuggestions.add(product.name);
        }

        // Add category names that match
        if (product.category.name.toLowerCase().includes(query)) {
          productSuggestions.add(product.category.name);
        }

        // Add tags that match
        product.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(query)) {
            productSuggestions.add(tag);
          }
        });

        // Add origins that match
        if (product.origin.toLowerCase().includes(query)) {
          productSuggestions.add(product.origin);
        }
      });

      setSuggestions(Array.from(productSuggestions).slice(0, 6));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    router.push(`/products?search=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1"
    >
      <div className="py-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center"
          >
            <svg
              className="h-4 w-4 text-gray-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-gray-900">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
