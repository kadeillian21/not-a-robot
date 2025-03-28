'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { ImageGrid } from '@/components/puzzle/image-grid';
import { SuccessAnimation } from '@/components/puzzle/success-animation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getCurrentWeekday, arraysEqual } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { PuzzleClient } from '@/lib/database.types';

export default function Home() {
  const [puzzle, setPuzzle] = useState<PuzzleClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchTodaysPuzzle() {
      try {
        const weekday = getCurrentWeekday();
        
        // Get puzzle for today using API
        const response = await fetch(`/api/puzzles?weekday=${weekday}`);
        
        if (response.ok) {
          const data = await response.json();
          setPuzzle(data);
        } else if (response.status === 404) {
          // Try to get any puzzle as fallback
          const fallbackResponse = await fetch('/api/puzzles');
          if (fallbackResponse.ok) {
            const puzzles = await fallbackResponse.json();
            if (puzzles.length > 0) {
              setPuzzle(puzzles[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching puzzle:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTodaysPuzzle();
  }, []);
  
  const handleSelectionComplete = (selectedTiles: number[]) => {
    if (!puzzle) return;
    
    setAttempts(attempts + 1);
    
    if (arraysEqual(selectedTiles, puzzle.correctTiles)) {
      setShowSuccess(true);
    } else {
      toast.error('Incorrect selection. Please try again.', {
        icon: '🤖',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading puzzle...</p>
      </div>
    );
  }
  
  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Puzzle Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">There is no puzzle available for today.</p>
            <p>Please check back later or contact the administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">I'm Not a Robot</h1>
        <p className="text-lg text-gray-600">Prove you're human by solving the puzzle below</p>
      </header>
      
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verification Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageGrid
              imageUrl={puzzle.imageUrl}
              targetDescription={puzzle.targetDescription}
              onSelectionComplete={handleSelectionComplete}
            />
          </CardContent>
        </Card>
      </div>
      
      {showSuccess && (
        <SuccessAnimation onComplete={() => setShowSuccess(false)} />
      )}
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Verification system powered by humans</p>
        <p className="mt-2">
          <a href="/admin" className="text-blue-500 hover:underline">Admin Login</a>
        </p>
      </footer>
    </div>
  );
}