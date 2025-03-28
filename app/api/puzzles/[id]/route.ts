import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// GET /api/puzzles/[id] - Get a specific puzzle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const id = parseInt(params.id);
    
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Puzzle not found' },
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
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch puzzle' },
      { status: 500 }
    );
  }
}

// PUT /api/puzzles/[id] - Update a puzzle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const id = parseInt(params.id);
    const body = await request.json();
    const { imageUrl, targetDescription, correctTiles } = body;
    
    // Check if any required fields are missing
    if (!imageUrl || !targetDescription || !correctTiles || !correctTiles.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if puzzle exists
    const { data: existingPuzzle, error: findError } = await supabase
      .from('puzzles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError || !existingPuzzle) {
      return NextResponse.json(
        { error: 'Puzzle not found' },
        { status: 404 }
      );
    }
    
    // Update puzzle
    const { data, error } = await supabase
      .from('puzzles')
      .update({
        image_url: imageUrl,
        target_description: targetDescription,
        correct_tiles: correctTiles,
      })
      .eq('id', id)
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
  } catch (error) {
    console.error('Error updating puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to update puzzle' },
      { status: 500 }
    );
  }
}

// DELETE /api/puzzles/[id] - Delete a puzzle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const id = parseInt(params.id);
    
    // Check if puzzle exists
    const { data: existingPuzzle, error: findError } = await supabase
      .from('puzzles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError || !existingPuzzle) {
      return NextResponse.json(
        { error: 'Puzzle not found' },
        { status: 404 }
      );
    }
    
    // Delete puzzle
    const { error } = await supabase
      .from('puzzles')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to delete puzzle' },
      { status: 500 }
    );
  }
}