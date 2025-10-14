import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Testing actual image upload...');
    
    // Create a small test file (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAFKOCr0OQAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageData, 'base64');
    const testFile = new File([testImageBuffer], 'test.png', { type: 'image/png' });
    
    console.log('Test file created:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    });

    // Try to upload the test file
    const fileName = `test-upload-${Date.now()}.png`;
    const filePath = `event-images/${fileName}`;
    
    console.log('Attempting upload to path:', filePath);

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, testFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload test failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Upload test failed',
        details: error.message,
        suggestions: [
          'Check if Row Level Security policies allow uploads',
          'Verify authentication is working',
          'Check bucket permissions in Supabase dashboard'
        ]
      });
    }

    console.log('Upload test successful:', data);

    // Try to get the public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    console.log('Public URL generated:', urlData.publicUrl);

    // Clean up - delete the test file
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([data.path]);

    if (deleteError) {
      console.warn('Failed to clean up test file:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Image upload test completed successfully',
      uploadedPath: data.path,
      publicUrl: urlData.publicUrl,
      fileSize: testFile.size
    });

  } catch (error) {
    console.error('Upload test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Upload test failed with exception',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}