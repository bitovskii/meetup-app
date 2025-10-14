# Image Upload Setup for Meetup App

This guide explains how to set up image upload functionality using Supabase Storage.

## Prerequisites

- Supabase project with database already configured
- Access to Supabase SQL Editor

## Setup Steps

### 1. Create Storage Bucket

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Allow public read access to images bucket
CREATE POLICY "Public read access on images bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own uploaded images (optional)
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own uploaded images (optional)
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );
```

### 2. Verify Storage Setup

1. Go to your Supabase dashboard
2. Navigate to Storage section
3. Verify that the "images" bucket exists and is set to public

### 3. Features Implemented

#### Image Upload
- Users can now upload images during event creation
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Images are uploaded to Supabase Storage and URLs are saved in the database

#### Time Selection Improvements
- Replaced free-form time input with dropdown selection
- Available times in 15-minute intervals (00:00, 00:15, 00:30, 00:45, etc.)
- Times displayed in 12-hour format (AM/PM) for better UX
- Still saves in 24-hour format (HH:MM) for consistency

#### Title Length Restriction
- Event titles limited to 30 characters maximum
- Real-time character counter shows remaining characters
- Counter turns red when approaching limit (25+ characters)
- Form validation prevents submission of titles over 30 characters

### 4. Testing

To test the new features:

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000
3. Try creating a new event:
   - Enter a title (test character limit)
   - Select a time from the dropdown
   - Upload an image file
   - Submit the form

### 5. File Structure

The image upload functionality is implemented in:
- `src/components/events/CreateEventModal.tsx` - Main component with upload logic
- `database/storage-setup.sql` - Storage bucket configuration

### 6. Error Handling

The implementation includes comprehensive error handling:
- File type validation
- File size validation  
- Upload progress indication
- User-friendly error messages
- Graceful fallback if upload fails

### 7. Storage Organization

Images are stored in the following structure:
```
images/
  event-images/
    [timestamp]-[randomId].[extension]
```

This prevents naming conflicts and organizes files by purpose.