import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0
    });

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
    }

    // Test 2: Check if we can connect to Supabase
    console.log('Testing Supabase connection...');
    
    // Test 3: List buckets to see if storage is accessible
    console.log('Attempting to list buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    console.log('Buckets result:', { buckets, bucketsError });

    if (bucketsError) {
      console.error('Buckets list error:', bucketsError);
      return NextResponse.json({
        success: false,
        error: 'Cannot access Supabase storage',
        details: bucketsError.message,
        errorName: bucketsError.name,
        fullError: bucketsError
      });
    }

    console.log('Available buckets:', buckets);

    // Test 4: Check if 'images' bucket exists
    const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
    
    if (!imagesBucket) {
      return NextResponse.json({
        success: false,
        error: 'Images bucket not found',
        availableBuckets: buckets?.map(b => b.name) || [],
        bucketsCount: buckets?.length || 0,
        solution: 'Please create the "images" bucket in your Supabase Storage dashboard'
      });
    }

    // Test 5: Test upload permissions (try to list files)
    console.log('Testing bucket access...');
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 });

    if (filesError) {
      console.error('Files list error:', filesError);
      return NextResponse.json({
        success: false,
        error: 'Cannot access images bucket',
        details: filesError.message,
        bucketExists: true,
        errorName: filesError.name
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase storage is properly configured',
      bucketExists: true,
      canAccessFiles: true,
      filesCount: files?.length || 0,
      hasCredentials: true
    });

  } catch (error) {
    console.error('Storage test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test storage',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}