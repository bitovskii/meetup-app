# 🚀 Complete Supabase Authentication Setup - Step by Step

## Part 1: Database Schema Setup (5 minutes)

### Step 1: Run Database Schema
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vlacdhcdhhujnmginvgd
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste this complete schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
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

-- Create trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

5. Click **"Run"** button
6. ✅ You should see "Success. No rows returned" message

---

## Part 2: Google OAuth Setup (10 minutes)

### Step 2: Google Cloud Console Setup
1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing):
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: "Meetup App"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - If prompted, configure OAuth consent screen:
     - User Type: "External"
     - App name: "Meetup App"
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all steps
   
5. **Configure OAuth Client**:
   - Application type: "Web application"
   - Name: "Meetup App Web Client"
   - Authorized redirect URIs - Add these EXACTLY:
     ```
     https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
   - Click "Create"

6. **Copy your credentials** (you'll need these for Step 3):
   - Client ID: `something.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-something`

### Step 3: Supabase Authentication Configuration
1. Go back to **Supabase Dashboard**: https://supabase.com/dashboard/project/vlacdhcdhhujnmginvgd
2. Click **"Authentication"** in left sidebar
3. Click **"Providers"** tab
4. Find **"Google"** and click to expand it
5. **Configure Google Provider**:
   - Toggle **"Enable sign in with Google"** to ON
   - **Client ID**: Paste your Google Client ID from Step 2
   - **Client Secret**: Paste your Google Client Secret from Step 2
   - Click **"Save"**

6. **Configure URLs**:
   - Click **"Settings"** tab (still in Authentication)
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Add these lines:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/**
     ```
   - Click **"Save"**

---

## Part 3: Test Authentication (2 minutes)

### Step 4: Test the Setup
1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Click the **"Sign In"** button (green button in top-right)
4. Modal should appear (now properly centered!)
5. Click **"Continue with Google"**
6. Complete Google authentication
7. You should be redirected back with your avatar showing!

---

## 🚨 Troubleshooting

### If "Sign In" button doesn't work:
- Check browser console for errors
- Verify Google Client ID/Secret are entered correctly in Supabase
- Make sure redirect URLs match exactly (no trailing slashes)

### If modal is still positioned wrong:
- Hard refresh the page (Ctrl+F5)
- Clear browser cache

### If Google OAuth fails:
- Check that Google+ API is enabled
- Verify OAuth consent screen is configured
- Make sure redirect URLs include both localhost and Supabase URLs

### If user profile isn't created:
- Check Supabase SQL logs for trigger errors
- Verify the database schema was created successfully

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ "Sign In" button opens centered modal
- ✅ "Continue with Google" redirects to Google
- ✅ After Google auth, you see your avatar in navigation
- ✅ Event/Group cards show "RSVP"/"Join" instead of "Sign in to..."
- ✅ Profile page at `/profile` shows your Google info

---

**Need help?** Follow each step carefully and let me know if you encounter any issues!