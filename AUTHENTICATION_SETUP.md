# Supabase Authentication Setup Guide

## 🚀 Complete Setup Instructions

### 1. Database Schema Setup

Copy and run this SQL in your Supabase SQL Editor:

```sql
-- Supabase Database Schema for Meetup App
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User Profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  visited_events UUID[] DEFAULT '{}',
  joined_groups UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  place VARCHAR(255) NOT NULL,
  members INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  members INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation (automatically create profile when user signs up)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample data (your existing events and groups data)
-- [Include your existing INSERT statements here]
```

### 2. Google OAuth Configuration

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing)
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Meetup App"
   - Authorized redirect URIs:
     ```
     https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```

5. **Copy your credentials**:
   - Client ID: `your-google-client-id`
   - Client Secret: `your-google-client-secret`

### 3. Supabase Authentication Configuration

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/vlacdhcdhhujnmginvgd
2. **Navigate to Authentication > Providers**
3. **Enable Google Provider**:
   - Toggle "Enable sign in with Google"
   - Enter your Google Client ID
   - Enter your Google Client Secret
   - Save configuration

4. **Configure Site URL**:
   - Go to Authentication > Settings
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: 
     ```
     http://localhost:3000/auth/callback
     https://your-production-domain.com/auth/callback
     ```

### 4. Test the Authentication

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the flow**:
   - Click "Sign In" button in navigation
   - Choose "Continue with Google"
   - Complete Google OAuth flow
   - You should be redirected back to your app as authenticated user

### 5. Verify Database Integration

After successful authentication:
- Check that a user profile was automatically created in `user_profiles` table
- Verify that user data (name, email, avatar) is populated correctly
- Test the profile page functionality

## 🎯 Features Now Available

✅ **Google Authentication**: One-click sign in with Google
✅ **Automatic Profile Creation**: User profiles created automatically on first login
✅ **Protected Features**: Different UI for authenticated vs. non-authenticated users
✅ **User Profile Management**: Edit profile, add interests, view statistics
✅ **Secure Database**: Row Level Security policies implemented

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid redirect URL"**: 
   - Ensure redirect URLs match exactly in Google Console and Supabase
   - Check for trailing slashes

2. **"User profile not created"**:
   - Verify the trigger function was created successfully
   - Check Supabase logs for any errors

3. **"Authentication not working"**:
   - Verify environment variables are set correctly
   - Check browser console for any errors

### Debug Steps:

1. Check Supabase logs in Dashboard > Logs
2. Verify Google OAuth configuration in Google Console
3. Test authentication in Supabase Auth > Users section
4. Check browser network tab for failed requests

## 🚀 Next Steps

After setup is complete, you can:
1. Add RSVP functionality for events
2. Implement group joining/leaving
3. Add real-time features with Supabase Realtime
4. Create event creation flow for authenticated users
5. Add push notifications for upcoming events

Your authentication system is now ready for production! 🎉