# 🚀 Supabase Setup Guide for Meetup App

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/sign up
2. Click "New Project"
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: `meetup-app` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest to your location
5. Click "Create new project"
6. Wait for the project to be set up (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xyzcompany.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## Step 3: Update Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the `database/schema.sql` file from your project
3. Copy all the SQL content and paste it into the Supabase SQL Editor
4. Click "Run" to execute the script

This will create:
- ✅ `events` table with sample data
- ✅ `groups` table with sample data
- ✅ Proper indexing and relationships
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates

## Step 5: Update Your React Components

The setup includes:
- ✅ Supabase client configuration (`src/lib/supabase.ts`)
- ✅ Custom React hooks (`src/hooks/useSupabase.ts`)
- ✅ TypeScript types for Events and Groups

## Step 6: Test the Connection

After completing the setup:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for any connection errors
3. Your app should now load data from Supabase instead of static arrays!

## Next Steps

Once connected, you can:

### 🎯 **Immediate Benefits:**
- Real-time data from your database
- Easy content management through Supabase dashboard
- Scalable data storage

### 🚀 **Future Enhancements:**
- User authentication and profiles
- Event RSVP functionality  
- Real-time updates with Supabase subscriptions
- Image upload to Supabase Storage
- Advanced search and filtering
- Event creation forms
- User-generated content

## 🔧 **Troubleshooting**

### Common Issues:

1. **Environment variables not loading:**
   - Restart your development server after updating `.env.local`
   - Make sure the file is in your project root directory

2. **Connection errors:**
   - Verify your Supabase URL and API key are correct
   - Check that your Supabase project is active and not paused

3. **Database errors:**
   - Ensure you've run the complete SQL schema script
   - Check that RLS policies are properly configured

4. **CORS issues:**
   - Supabase should handle CORS automatically for localhost
   - For production, add your domain to Supabase Auth settings

## 📞 **Need Help?**

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase dashboard shows the tables were created
3. Test the connection directly in Supabase's API docs section

---

**Ready to connect? Follow the steps above and your meetup app will be powered by Supabase! 🎉**