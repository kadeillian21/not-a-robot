import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageGridProps {
  imageUrl: string;
  targetDescription: string;
  onSelectionComplete: (selectedTiles: number[]) => void;
  adminMode?: boolean;
  initialSelectedTiles?: number[];
}

export function ImageGrid({
  imageUrl,
  targetDescription,
  onSelectionComplete,
  adminMode = false,
  initialSelectedTiles = [],
}: ImageGridProps) {
  const [selectedTiles, setSelectedTiles] = useState<number[]>(initialSelectedTiles);
  
  const handleTileClick = (index: number) => {
    const newSelectedTiles = [...selectedTiles];
    
    if (newSelectedTiles.includes(index)) {
      // Remove if already selected
      const tileIndex = newSelectedTiles.indexOf(index);
      newSelectedTiles.splice(tileIndex, 1);
    } else {
      // Add if not already selected
      newSelectedTiles.push(index);
    }
    
    setSelectedTiles(newSelectedTiles);
    
    if (adminMode) {
      onSelectionComplete(newSelectedTiles);
    }
  };
  
  const handleVerify = () => {
    if (!adminMode) {
      onSelectionComplete(selectedTiles);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold mb-2">
        {adminMode ? 'Select the tiles that contain:' : 'Select all squares that contain:'}
      </h2>
      <p className="text-lg font-medium mb-4">{targetDescription}</p>
      
      <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1 rounded-md">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 cursor-pointer overflow-hidden border-2",
              selectedTiles.includes(i) ? "border-blue-500" : "border-transparent"
            )}
            onClick={() => handleTileClick(i)}
          >
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt={`Tile ${i}`}
                className="object-cover"
                style={{
                  objectPosition: `${(i % 3) * -100}% ${Math.floor(i / 3) * -100}%`,
                  objectFit: 'cover',
                  width: '300%',
                  height: '300%',
                  transform: `translate(${(i % 3) * -100}%, ${Math.floor(i / 3) * -100}%)`,
                }}
              />
            </div>
            <div className={cn(
              "absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-30",
              selectedTiles.includes(i) ? "opacity-100" : "opacity-0"
            )}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      {!adminMode && (
        <button
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={handleVerify}
        >
          Verify
        </button>
      )}
    </div>
  );
}