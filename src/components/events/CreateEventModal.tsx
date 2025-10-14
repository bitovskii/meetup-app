'use client';

import { useState, useRef } from 'react';
import { useEventMutations } from '@/hooks';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/lib/supabase';
import type { CreateEventData } from '@/types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: Readonly<CreateEventModalProps>) {
  const { createEvent, isLoading, error, clearError } = useEventMutations();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    time: '',
    place: '',
    image: '',
    group_id: undefined
  });

  // Generate time options with 15-minute intervals
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Get button text based on state
  const getButtonText = () => {
    if (uploadingImage) return 'Uploading...';
    if (isLoading) return 'Creating...';
    return 'Create';
  };

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      console.log('Attempting to upload:', { fileName, filePath, fileSize: file.size, fileType: file.type });

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        console.error('Error details:', {
          message: error.message
        });
        
        // Provide more specific error messages
        if (error.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket not configured. Please set up Supabase storage first.');
        } else if (error.message?.includes('Row Level Security')) {
          throw new Error('Authentication required for upload. Please sign in first.');
        } else if (error.message?.includes('not found')) {
          throw new Error('Storage bucket "images" does not exist. Please create it in Supabase.');
        }
        
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      console.log('Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification({
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
        type: 'error'
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle image file selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification({
        title: 'Invalid File',
        message: 'Please select an image file.',
        type: 'error'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        title: 'File Too Large',
        message: 'Please select an image smaller than 5MB.',
        type: 'error'
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format date from YYYY-MM-DD to DD.MM.YYYY
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title length
    if (formData.title.length > 30) {
      showNotification({
        title: 'Title Too Long',
        message: 'Event title must be 30 characters or less.',
        type: 'error'
      });
      return;
    }
    
    let imageUrl = formData.image;
    
    // Upload image if a file is selected
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        // Upload failed, error notification already shown
        return;
      }
      imageUrl = uploadedUrl;
    }
    
    // Create formatted data for submission
    const submissionData = {
      ...formData,
      image: imageUrl,
      date: formatDateForDisplay(formData.date), // Convert to DD.MM.YYYY format
      // Time is already in HH:MM format from select
    };
    
    const result = await createEvent(submissionData);
    if (result) {
      // Show success notification
      showNotification({
        title: 'Event Created!',
        message: `"${formData.title}" has been successfully created.`,
        type: 'success'
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        place: '',
        image: '',
        group_id: undefined
      });
      
      // Reset image state
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onSuccess();
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For title, enforce character limit
    if (name === 'title' && value.length > 30) {
      return; // Don't update if exceeding limit
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Event
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="title" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Event Title *
                </label>
                <span className={`text-xs ${formData.title.length > 25 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.title.length}/30
                </span>
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={30}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe your event"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time *
                </label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select time</option>
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.display}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="place" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="place"
                name="place"
                value={formData.place}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Event location"
              />
            </div>

            <div>
              <label htmlFor="event-image" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Image (optional)
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-2 relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* File Input */}
              <input
                ref={fileInputRef}
                id="event-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                disabled={isLoading || uploadingImage}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || uploadingImage}
              >
                {getButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}