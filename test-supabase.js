const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Missing environment variables');
    return;
  }

  console.log('Trying to connect to Supabase...');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    // Test query to list tables
    const { data, error } = await supabase.from('puzzles').select('*').limit(1);
    
    if (error) {
      console.log('Error querying table:', error);
    } else {
      console.log('Successfully queried puzzles table');
      console.log('Data:', data);
    }

    // Try inserting a test record
    const testData = {
      weekday: 0,
      image_url: 'https://example.com/test.jpg',
      target_description: 'Test description',
      correct_tiles: [0, 1, 2]
    };

    console.log('Trying to insert a test record...');
    const { data: insertData, error: insertError } = await supabase
      .from('puzzles')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.log('Error inserting test record:', insertError);
    } else {
      console.log('Successfully inserted test record');
      console.log('Inserted data:', insertData);
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('puzzles')
        .delete()
        .eq('id', insertData.id);
        
      if (deleteError) {
        console.log('Error deleting test record:', deleteError);
      } else {
        console.log('Successfully deleted test record');
      }
    }
  } catch (err) {
    console.log('Unexpected error:', err);
  }
}

testSupabase().catch(console.error);