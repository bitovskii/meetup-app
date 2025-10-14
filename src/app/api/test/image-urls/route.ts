import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing image URLs and accessibility...');
    
    // 1. List files in the images bucket to see what's there
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('event-images', { limit: 10 });

    if (listError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list files',
        details: listError.message
      });
    }

    console.log('Files found:', files);

    // 2. Generate public URLs for each file and test accessibility
    const fileTests = await Promise.all(
      files.map(async (file) => {
        const filePath = `event-images/${file.name}`;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        // Try to fetch the image to see if it's accessible
        try {
          const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
          return {
            filename: file.name,
            publicUrl: urlData.publicUrl,
            accessible: response.ok,
            status: response.status,
            contentType: response.headers.get('content-type'),
            size: file.metadata?.size || 'unknown'
          };
        } catch (fetchError) {
          return {
            filename: file.name,
            publicUrl: urlData.publicUrl,
            accessible: false,
            error: fetchError instanceof Error ? fetchError.message : 'Fetch failed',
            size: file.metadata?.size || 'unknown'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Image URL test completed',
      filesCount: files.length,
      fileTests: fileTests,
      bucketPublicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`
    });

  } catch (error) {
    console.error('Image URL test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Image URL test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}