# Quick Start Guide - Enhanced AI Website Builder

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `@anthropic-ai/sdk` - For Claude AI
- `@google/generative-ai` - For Gemini AI
- `openai` - For GPT-4o and DALL-E 3
- `@supabase/supabase-js` - For backend provisioning

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your API keys:

```env
# Required
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# Optional but recommended for full features
ANTHROPIC_API_KEY=your_key_here      # For Claude planning
OPENAI_API_KEY=your_key_here         # For vision & assets
```

### 3. Get API Keys

#### Gemini (Required)
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Add to `NEXT_PUBLIC_GEMINI_API_KEY`

#### Anthropic (Optional - for planning)
- Go to [Anthropic Console](https://console.anthropic.com/)
- Create an API key
- Add to `ANTHROPIC_API_KEY`

#### OpenAI (Optional - for vision & assets)
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Create an API key
- Add to `OPENAI_API_KEY`

#### Convex (Required)
- Run `npx convex deploy` in your project
- Copy the deployment URL to `NEXT_PUBLIC_CONVEX_URL`

### 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your enhanced AI website builder!

## 🎯 Key Features to Try

### 1. Basic Code Generation
- Enter a prompt like "Create a todo app"
- Click "Generate Website"
- Watch as AI creates your code!

### 2. Vision Analysis
- Click "Vision Analysis" button
- Upload an image/screenshot
- Get AI-powered implementation guidance

### 3. Streaming Chat
- Click "Streaming Chat" button
- Type your question
- See real-time AI responses

### 4. Multi-Model Intelligence
The system automatically routes tasks:
- **Planning tasks** → Claude Opus/Sonnet
- **Quick edits** → Gemini Flash
- **Vision analysis** → GPT-4o
- **Asset generation** → DALL-E 3

## 📝 Example Prompts

### Simple Website
```
Create a modern landing page for a SaaS product with:
- Hero section with CTA
- Features grid (3 columns)
- Pricing cards
- Footer with links
```

### With Vision
1. Click "Vision Analysis"
2. Upload a design screenshot
3. Enter: "Build this design"
4. Get implementation guidance

### Complex App
```
Create a blog platform with:
- User authentication
- Post creation/editing
- Comments system
- Category filtering
- Search functionality
```

## 🔧 Troubleshooting

### "API key not configured" errors
- Check your `.env.local` file exists
- Verify API keys are correct
- Restart the dev server after adding keys

### Models not working
- The system will fallback to available models
- Check console for specific errors
- Ensure at least Gemini is configured

### Streaming not working
- Check browser console for errors
- Verify network connectivity
- Try refreshing the page

## 🎨 Customization

### Use Enhanced Components
Replace `Hero` with `EnhancedHero` in your pages:

```jsx
import EnhancedHero from '@/components/custom/EnhancedHero';

// Use in your page
<EnhancedHero />
```

### Add Vision Upload
```jsx
import VisionUpload from '@/components/custom/VisionUpload';

<VisionUpload
  onAnalysisComplete={(analysis) => console.log(analysis)}
  onError={(error) => console.error(error)}
/>
```

### Use Streaming Chat
```jsx
import StreamingChat from '@/components/custom/StreamingChat';

<StreamingChat
  onComplete={(content) => console.log(content)}
  onError={(error) => console.error(error)}
/>
```

## 📚 Next Steps

1. **Read [ENHANCEMENTS.md](./ENHANCEMENTS.md)** for detailed feature documentation
2. **Explore the API routes** in `/app/api/`
3. **Customize prompts** in `/data/EnhancedPrompts.jsx`
4. **Configure AI models** in `/lib/ai-orchestrator.js`

## 🆘 Need Help?

- Check the [ENHANCEMENTS.md](./ENHANCEMENTS.md) for detailed docs
- Review API route implementations
- Check console for error messages

---

**Happy Building! 🚀**

