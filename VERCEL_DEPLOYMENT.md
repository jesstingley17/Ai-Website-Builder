# Vercel Deployment Guide

## Required Environment Variables

To deploy this application to Vercel, you need to set the following environment variables in your Vercel project settings:

### 1. NEXT_PUBLIC_CONVEX_URL

This is your Convex deployment URL. To get it:

1. **First, install Convex CLI (if not already installed):**
   ```bash
   npm install -g convex
   ```

2. **Login to Convex:**
   ```bash
   npx convex login
   ```

3. **Initialize and deploy Convex:**
   ```bash
   cd Ai-Website-Builder
   npx convex dev
   ```
   This will:
   - Initialize Convex in your project (if not already done)
   - Create a development deployment
   - Give you a deployment URL that looks like: `https://your-project-name.convex.cloud`
   
4. **Deploy to production:**
   ```bash
   npx convex deploy --prod
   ```
   This creates a production deployment and gives you the production URL.

5. **If you already have a Convex deployment:**
   - The URL will look like: `https://your-project-name.convex.cloud`
   - You can find it in your Convex dashboard at https://dashboard.convex.dev
   - Or check your `.env.local` file if you have one locally

6. **Set it in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `NEXT_PUBLIC_CONVEX_URL` 
   - Value should be the full URL: `https://your-project-name.convex.cloud` (NOT just "YOUR-API-KEY" or a placeholder)

### 2. NEXT_PUBLIC_GEMINI_API_KEY

This is your Google Gemini API key:

1. **Get your API key:**
   - Visit https://ai.google.dev/
   - Sign in with your Google account
   - Create a new API key or use an existing one

2. **Set it in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `NEXT_PUBLIC_GEMINI_API_KEY` with your API key as the value

### 3. GITHUB_TOKEN (Optional but Recommended)

This is a GitHub personal access token for better API rate limits when using GitHub repository integration:

1. **Create a GitHub token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Ai-Website-Builder")
   - Select scope: `public_repo` (for public repositories) or `repo` (for private repos)
   - Click "Generate token" and copy it immediately

2. **Set it in Vercel (optional):**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `GITHUB_TOKEN` with your token as the value
   - **Note:** This is optional - the app works without it, but you'll have lower API rate limits (60 requests/hour vs 5000 with a token)

## Steps to Deploy

1. **Set up Convex (if not already done):**
   ```bash
   npx convex deploy
   ```
   This will create a production deployment and give you the deployment URL.

2. **Add environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Click on "Settings"
   - Click on "Environment Variables"
   - Add both variables:
     - `NEXT_PUBLIC_CONVEX_URL` = your Convex deployment URL
     - `NEXT_PUBLIC_GEMINI_API_KEY` = your Gemini API key

3. **Redeploy:**
   - After adding the environment variables, trigger a new deployment
   - You can do this by pushing a new commit or using "Redeploy" in the Vercel dashboard

## Troubleshooting

### Build fails with "No address provided to ConvexReactClient"
- Make sure `NEXT_PUBLIC_CONVEX_URL` is set in Vercel environment variables
- Ensure the URL is correct (should start with `https://` and end with `.convex.cloud`)

### Build fails with "Provided address was not an absolute URL"
- **This means the environment variable is set but contains an invalid value**
- Make sure you're using a REAL Convex deployment URL, not a placeholder like "YOUR-API-KEY"
- The URL must be a valid absolute URL like: `https://your-project-name.convex.cloud`
- Deploy Convex first using `npx convex deploy --prod` to get a real URL
- Double-check the value in Vercel environment variables - it should be a full URL starting with `https://`

### Build fails with API errors
- Make sure `NEXT_PUBLIC_GEMINI_API_KEY` is set correctly
- Verify your API key is valid at https://ai.google.dev/

### Environment variables not working
- Make sure the variable names are exactly as shown (case-sensitive)
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- After adding variables, trigger a new deployment
- **Important:** Never use placeholder values like "YOUR-API-KEY" - these will cause build failures

