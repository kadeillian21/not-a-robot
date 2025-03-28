import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { Puzzle } from '@/lib/database.types';

// GET /api/puzzles - Get all puzzles
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const url = new URL(request.url);
    const weekday = url.searchParams.get('weekday');

    if (weekday !== null) {
      // Get puzzle for specific weekday
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .eq('weekday', parseInt(weekday))
        .single();
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Puzzle not found for this day' },
          { status: 404 }
        );
      }
      
      // Convert to client-friendly format
      const puzzle = {
        id: data.id,
        createdAt: data.created_at,
        weekday: data.weekday,
        imageUrl: data.image_url,
        targetDescription: data.target_description,
        correctTiles: data.correct_tiles,
      };
      
      return NextResponse.json(puzzle);
    } else {
      // Get all puzzles
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .order('weekday', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Convert to client-friendly format
      const puzzles = data.map(puzzle => ({
        id: puzzle.id,
        createdAt: puzzle.created_at,
        weekday: puzzle.weekday,
        imageUrl: puzzle.image_url,
        targetDescription: puzzle.target_description,
        correctTiles: puzzle.correct_tiles,
      }));
      
      return NextResponse.json(puzzles);
    }
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch puzzles' },
      { status: 500 }
    );
  }
}

// POST /api/puzzles - Create a new puzzle
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { weekday, imageUrl, targetDescription, correctTiles } = body;
    
    if (weekday === undefined || !imageUrl || !targetDescription || !correctTiles || !correctTiles.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if puzzle already exists for this weekday
    const { data: existingPuzzle } = await supabase
      .from('puzzles')
      .select('*')
      .eq('weekday', weekday)
      .single();
    
    if (existingPuzzle) {
      // Update existing puzzle
      const { data, error } = await supabase
        .from('puzzles')
        .update({
          image_url: imageUrl,
          target_description: targetDescription,
          correct_tiles: correctTiles,
        })
        .eq('id', existingPuzzle.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Convert to client-friendly format
      const updatedPuzzle = {
        id: data.id,
        createdAt: data.created_at,
        weekday: data.weekday,
        imageUrl: data.image_url,
        targetDescription: data.target_description,
        correctTiles: data.correct_tiles,
      };
      
      return NextResponse.json(updatedPuzzle);
    } else {
      // Create new puzzle
      const { data, error } = await supabase
        .from('puzzles')
        .insert({
          weekday,
          image_url: imageUrl,
          target_description: targetDescription,
          correct_tiles: correctTiles,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        );
      }
      
      // Convert to client-friendly format
      const newPuzzle = {
        id: data.id,
        createdAt: data.created_at,
        weekday: data.weekday,
        imageUrl: data.image_url,
        targetDescription: data.target_description,
        correctTiles: data.correct_tiles,
      };
      
      return NextResponse.json(newPuzzle);
    }
  } catch (error: any) {
    console.error('Error creating puzzle:', error);
    return NextResponse.json(
      { error: `Failed to create puzzle: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}