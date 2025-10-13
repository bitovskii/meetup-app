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

-- Insert sample events data
INSERT INTO events (title, description, date, time, place, members, image) VALUES
('Tech Conference 2025', 'Annual technology conference featuring the latest innovations in AI, web development, and digital transformation.', 'January 15, 2025', '9:00 AM', 'San Francisco Convention Center', 234, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop&auto=format'),
('Startup Networking Night', 'Connect with fellow entrepreneurs, investors, and startup enthusiasts in a relaxed networking environment.', 'January 22, 2025', '6:30 PM', 'WeWork Downtown', 89, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=225&fit=crop&auto=format'),
('Photography Workshop', 'Learn advanced photography techniques from professional photographers. Bring your camera and creativity!', 'February 5, 2025', '2:00 PM', 'Golden Gate Park', 45, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=225&fit=crop&auto=format'),
('Book Club Discussion', 'Monthly book club meeting to discuss "The Future of Work" by bestselling author Sarah Johnson.', 'February 12, 2025', '7:00 PM', 'Central Library', 28, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop&auto=format'),
('Cooking Masterclass', 'Learn to cook authentic Italian cuisine with Chef Marco. All ingredients and equipment provided.', 'February 18, 2025', '11:00 AM', 'Culinary Institute', 16, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop&auto=format'),
('Mindfulness Meditation', 'Weekly mindfulness and meditation session. Perfect for beginners and experienced practitioners.', 'February 25, 2025', '8:00 AM', 'Zen Garden Center', 52, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format'),
('AI & Machine Learning Summit', 'Deep dive into the latest AI technologies and their real-world applications across industries.', 'March 8, 2025', '10:00 AM', 'Tech Hub Auditorium', 187, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop&auto=format'),
('Hiking Adventure', 'Guided hiking trip through beautiful mountain trails. All skill levels welcome!', 'March 15, 2025', '7:00 AM', 'Mountain View Trailhead', 31, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop&auto=format'),
('Design Thinking Workshop', 'Interactive workshop on design thinking methodologies for product development and innovation.', 'March 22, 2025', '1:00 PM', 'Innovation Lab', 67, 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop&auto=format'),
('Music Production Meetup', 'Share your beats, get feedback, and collaborate with fellow music producers and artists.', 'March 29, 2025', '4:00 PM', 'Sound Studio Complex', 41, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop&auto=format');

-- Insert sample groups data
INSERT INTO groups (name, description, category, location, members, image) VALUES
('Tech Innovators', 'A community of technology enthusiasts, developers, and innovators sharing knowledge and building amazing projects together.', 'Technology', 'San Francisco, CA', 1247, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop&auto=format'),
('Creative Entrepreneurs', 'Connect with creative minds who are building businesses around their passions. Share ideas, get feedback, and grow together.', 'Business', 'New York, NY', 892, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop&auto=format'),
('Urban Photography Club', 'Capture the essence of city life through photography. Weekly photo walks, workshops, and portfolio reviews.', 'Photography', 'Chicago, IL', 567, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=225&fit=crop&auto=format'),
('Book Lovers Society', 'Monthly book discussions, author meetups, and literary events. From classics to contemporary fiction and beyond.', 'Literature', 'Boston, MA', 423, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=225&fit=crop&auto=format'),
('Foodie Adventures', 'Explore local restaurants, cooking classes, and food festivals. Share recipes and discover new cuisines together.', 'Food & Drink', 'Los Angeles, CA', 734, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop&auto=format'),
('Mindful Living', 'Practice mindfulness, meditation, and wellness together. Weekly sessions and wellness workshops for inner peace.', 'Wellness', 'Austin, TX', 312, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format'),
('AI & Future Tech', 'Exploring artificial intelligence, machine learning, and emerging technologies. For researchers and enthusiasts.', 'Technology', 'Seattle, WA', 1156, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop&auto=format'),
('Green Living Initiative', 'Committed to sustainable living and environmental action. Community gardens, clean-up events, and eco-workshops.', 'Environment', 'Portland, OR', 445, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop&auto=format');

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on events" 
  ON events FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access on groups" 
  ON groups FOR SELECT 
  USING (true);

-- Optional: Create policies for insert/update (you can customize these based on your auth needs)
CREATE POLICY "Allow public insert on events" 
  ON events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public insert on groups" 
  ON groups FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update on events" 
  ON events FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public update on groups" 
  ON groups FOR UPDATE 
  USING (true);

-- Create Telegram Authentication Tables
-- Auth tokens for telegram deep link authentication
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'expired', 'cancelled')),
  user_data JSONB,
  telegram_user_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for telegram users
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  user_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for auth_tokens
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public access to auth_tokens (needed for webhook)
CREATE POLICY "Allow public access to auth_tokens" ON auth_tokens
  FOR ALL USING (true);

-- Enable Row Level Security for user_sessions  
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public access to user_sessions (needed for webhook)
CREATE POLICY "Allow public access to user_sessions" ON user_sessions
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_status ON auth_tokens(status);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX idx_user_sessions_telegram_user_id ON user_sessions(telegram_user_id);