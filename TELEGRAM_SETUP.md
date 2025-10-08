# 🤖 Telegram Authentication Setup Guide

This guide will help you set up Telegram authentication for your Meetup app in under 10 minutes!

## 📋 Prerequisites

✅ Telegram account  
✅ Your meetup app running locally  
✅ Basic understanding of environment variables  

## 🔧 Step 1: Create Your Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a conversation** with BotFather and send `/start`
3. **Create a new bot** by sending `/newbot`
4. **Choose a name** for your bot (e.g., "Meetup Community Bot")
5. **Choose a username** for your bot (must end with "bot", e.g., "meetup_auth_bot")
6. **Save your bot token** - BotFather will give you a token like `6842736523:AAHJ8s9dHJKShd8HJK...`

## 🌐 Step 2: Configure Your Bot Domain

1. **In BotFather**, send `/setdomain`
2. **Select your bot** from the list
3. **Enter your domain**: `localhost:3000` (for development)
4. **For production**: Use your actual domain (e.g., `yourmeetup.com`)

## 🔑 Step 3: Configure Environment Variables

1. **Copy the example file**:
   ```bash
   copy .env.local.example .env.local
   ```

2. **Edit `.env.local`** and replace the placeholder values:
   ```env
   TELEGRAM_BOT_TOKEN=6842736523:AAHJ8s9dHJKShd8HJK_your_actual_token_here
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=meetup_auth_bot
   ```

## 🚀 Step 4: Test Your Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to**: `http://localhost:3000/auth`

3. **Click the Telegram login button** - you should see the blue Telegram widget

4. **Test authentication** by clicking the widget and authorizing in Telegram

## 🔒 Security Features

Your Telegram authentication includes:

✅ **Cryptographic verification** - Hash-based security  
✅ **Time-based validation** - Auth expires in 24 hours  
✅ **Real phone verification** - Telegram accounts require real phone numbers  
✅ **Bot prevention** - Leverages Telegram's anti-spam systems  

## 🎯 User Experience

**For your users:**
- ✅ **One-click authentication** - No forms to fill
- ✅ **No passwords** - Uses existing Telegram account  
- ✅ **Cross-platform** - Works on mobile and desktop
- ✅ **Instant profile** - Gets name and photo from Telegram

## 🐛 Troubleshooting

### "Failed to load Telegram widget"
- Check your bot username in `.env.local`
- Ensure your domain is set correctly in BotFather
- Verify you're using the correct bot token

### "Invalid authentication data"
- Check your bot token in `.env.local`
- Ensure the token matches the bot you configured
- Try restarting your development server

### "Authentication verification failed"
- Check that your API route is accessible at `/api/auth/telegram/verify`
- Verify your server-side bot token configuration
- Check browser console for detailed error messages

## 🔄 Next Steps

Once authentication is working:

1. **Add RSVP functionality** - Only authenticated users can RSVP
2. **Event creation** - Let users create their own events
3. **User profiles** - Show user information and RSVP history
4. **Notification system** - Send event reminders via Telegram bot

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure your bot domain is configured properly
4. Test with a fresh Telegram account if needed

**Your Telegram authentication is now ready! 🎉**