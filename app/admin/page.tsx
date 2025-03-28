'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageGrid } from '@/components/puzzle/image-grid';
import { PuzzleClient } from '@/lib/database.types';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [puzzles, setPuzzles] = useState<PuzzleClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekday, setSelectedWeekday] = useState<number>(0);
  const [editingPuzzle, setEditingPuzzle] = useState<PuzzleClient | null>(null);
  
  // Form state
  const [imageUrl, setImageUrl] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [correctTiles, setCorrectTiles] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  
  useEffect(() => {
    async function fetchPuzzles() {
      try {
        // Get all puzzles using API
        const response = await fetch('/api/puzzles');
        
        if (response.ok) {
          const data = await response.json();
          setPuzzles(data);
        } else {
          throw new Error('Failed to fetch puzzles');
        }
      } catch (error) {
        toast.error('Failed to load puzzles');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPuzzles();
  }, []);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName; // Don't include folder in path
      
      // Upload with proper content type
      const { error: uploadError, data } = await supabase.storage
        .from('puzzles')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }
      
      if (!data?.path) {
        toast.error('Upload succeeded but path is missing');
        return;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('puzzles')
        .getPublicUrl(data.path);
        
      if (!urlData?.publicUrl) {
        toast.error('Failed to get public URL');
        return;
      }
      
      setImageUrl(urlData.publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(`Error uploading: ${err?.message || 'Unknown error'}`);
      console.error('Full upload error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleSavePuzzle = async () => {
    if (!imageUrl || !targetDescription || correctTiles.length === 0) {
      toast.error('Please fill in all fields and select at least one correct tile');
      return;
    }
    
    try {
      if (editingPuzzle) {
        // Update existing puzzle using API
        const response = await fetch(`/api/puzzles/${editingPuzzle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl,
            targetDescription,
            correctTiles
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update puzzle');
        }
        
        toast.success('Puzzle updated successfully');
      } else {
        // Check if a puzzle already exists for this weekday
        const existingPuzzle = puzzles.find(p => p.weekday === selectedWeekday);
        
        if (existingPuzzle) {
          // Update existing puzzle using API
          const response = await fetch(`/api/puzzles/${existingPuzzle.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl,
              targetDescription,
              correctTiles
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update puzzle');
          }
          
          toast.success('Puzzle updated successfully');
        } else {
          // Create new puzzle using API
          const response = await fetch('/api/puzzles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              weekday: selectedWeekday,
              imageUrl,
              targetDescription,
              correctTiles
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Server error details:', errorData);
            throw new Error(`Failed to create puzzle: ${errorData.error || response.statusText}`);
          }
          
          toast.success('Puzzle created successfully');
        }
      }
      
      // Refresh puzzles
      const response = await fetch('/api/puzzles');
      if (response.ok) {
        const updatedPuzzles = await response.json();
        setPuzzles(updatedPuzzles);
      }
      
      // Reset form
      setEditingPuzzle(null);
      setImageUrl('');
      setTargetDescription('');
      setCorrectTiles([]);
      
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err?.message || 'Error saving puzzle');
      console.error('Save puzzle error:', error);
    }
  };
  
  const handleEditPuzzle = (puzzle: PuzzleClient) => {
    setEditingPuzzle(puzzle);
    setSelectedWeekday(puzzle.weekday);
    setImageUrl(puzzle.imageUrl);
    setTargetDescription(puzzle.targetDescription);
    setCorrectTiles(puzzle.correctTiles);
  };
  
  const handleDeletePuzzle = async (id: number) => {
    if (confirm('Are you sure you want to delete this puzzle?')) {
      try {
        // Delete puzzle using API
        const response = await fetch(`/api/puzzles/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete puzzle');
        }
        
        // Remove from state
        setPuzzles(puzzles.filter(p => p.id !== id));
        toast.success('Puzzle deleted successfully');
      } catch (error) {
        toast.error('Error deleting puzzle');
        console.error(error);
      }
    }
  };
  
  const handleTileSelection = (tiles: number[]) => {
    setCorrectTiles(tiles);
  };
  
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Portal</h1>
        <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{editingPuzzle ? 'Edit Puzzle' : 'Create New Puzzle'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!editingPuzzle && (
              <div>
                <label className="block text-sm font-medium mb-1">Day of the week</label>
                <select 
                  value={selectedWeekday} 
                  onChange={(e) => setSelectedWeekday(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  {weekdays.map((day, index) => (
                    <option key={day} value={index}>{day}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Target Description</label>
              <input 
                type="text" 
                value={targetDescription} 
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="e.g., 'a traffic light'"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              {!imageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <div className="space-y-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex flex-col items-center text-sm text-gray-600">
                      <p>Upload a square image for best results</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <label 
                      htmlFor="image-upload"
                      className="cursor-pointer inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Select Image'}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-80 object-contain bg-gray-100 rounded-md mb-2" 
                    />
                    <button 
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    This image will be used for the &quot;Select all squares&quot; verification challenge.
                  </p>
                </div>
              )}
            </div>
            
            {imageUrl && (
              <div>
                <label className="block text-sm font-medium mb-1">Select Correct Tiles</label>
                <ImageGrid 
                  imageUrl={imageUrl}
                  targetDescription={targetDescription || 'Please provide a description'}
                  onSelectionComplete={handleTileSelection}
                  adminMode={true}
                  initialSelectedTiles={correctTiles}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSavePuzzle} disabled={!imageUrl || !targetDescription || correctTiles.length === 0}>
              {editingPuzzle ? 'Update Puzzle' : 'Save Puzzle'}
            </Button>
            {editingPuzzle && (
              <Button 
                variant="outline"
                className="ml-2"
                onClick={() => {
                  setEditingPuzzle(null);
                  setImageUrl('');
                  setTargetDescription('');
                  setCorrectTiles([]);
                  setSelectedWeekday(0);
                }}
              >
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Puzzles</h2>
          {puzzles.length === 0 ? (
            <p className="text-gray-500">No puzzles created yet</p>
          ) : (
            <div className="space-y-4">
              {weekdays.map((day, index) => {
                const puzzle = puzzles.find(p => p.weekday === index);
                return (
                  <Card key={day}>
                    <CardHeader>
                      <CardTitle>{day}</CardTitle>
                    </CardHeader>
                    {puzzle ? (
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <img 
                              src={puzzle.imageUrl} 
                              alt={day}
                              className="w-full max-w-[300px] h-48 object-contain bg-gray-100 rounded"
                            />
                          </div>
                          <div>
                            <p><strong>Description:</strong> {puzzle.targetDescription}</p>
                            <p><strong>Correct Tiles:</strong> {puzzle.correctTiles.join(', ')}</p>
                          </div>
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent>
                        <p className="text-gray-500">No puzzle set for this day</p>
                      </CardContent>
                    )}
                    <CardFooter>
                      {puzzle && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPuzzle(puzzle)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline" 
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeletePuzzle(puzzle.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}