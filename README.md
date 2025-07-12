# Old Sparrow - Health Insurance AI Assistant

**Description:** Your intelligent health insurance advisor that helps you understand policies, compare coverage options, and make informed decisions about your health insurance needs.

## Features

### 🏥 Health Insurance Analysis

- **Policy Document Processing**: Upload and analyze insurance policy documents (PDF support)
- **Intelligent Q&A**: Ask questions about your health insurance coverage and get clear, personalized answers
- **Policy Comparison**: Compare multiple insurance policies side-by-side with detailed analysis

### 🤖 AI-Powered Assistant

- **Personalized Recommendations**: Get tailored insurance advice based on your age, city, and health profile
- **Expert Analysis**: Comprehensive policy analysis covering coverage, limitations, waiting periods, and more
- **Natural Conversation**: Chat with Old Sparrow, your friendly health insurance advisor

### 💬 Interactive Chat Interface

- **Real-time Conversations**: Seamless chat experience with instant responses
- **User Profiling**: Collects essential information (age, city, pre-existing conditions, gender) for personalized advice
- **Chat History**: Track your conversations and insurance research over time

### 📊 Policy Comparison & Analysis

- **Side-by-Side Comparison**: Compare multiple policies with detailed breakdowns
- **Coverage Analysis**: Understand sum assured, waiting periods, exclusions, and benefits
- **Cost Transparency**: Clear explanations of premium structures and value propositions

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- A Convex account (free tier available)
- OpenRouter API access

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd old-sparrow
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
# Required Environment Variables
NEXT_PUBLIC_CONVEX_URL=https://your-convex-project-url.convex.cloud
CONVEX_SITE_URL=https://your-convex-project-url.convex.site
OPENROUTER_API_KEY=your-openrouter-api-key

# Optional Environment Variables
DEFAULT_USER_CREDITS=100  # Default credits for new users
```

#### Getting Your API Keys

**Convex Setup:**

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Create a new project
3. Copy your deployment URL to `NEXT_PUBLIC_CONVEX_URL`
4. Copy your site URL to `CONVEX_SITE_URL`

**OpenRouter API Key:**

1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account and get your API key
3. Add it to `OPENROUTER_API_KEY`

**Google OAuth Setup (for authentication):**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
6. Configure OAuth consent screen
7. The app will handle OAuth through Convex Auth

8. Deploy your Convex backend:

```bash
npx convex dev
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### 1. User Onboarding

- Users sign in with Google OAuth
- Old Sparrow collects essential information (age, city, health status, gender)
- Each user gets default credits to start using the service

### 2. Policy Analysis

- Upload insurance policy documents (PDF format)
- Ask specific questions about coverage, benefits, exclusions
- Get detailed, easy-to-understand explanations

### 3. Policy Comparison

- Select multiple policies for comparison
- Receive side-by-side analysis with recommendations
- Understand which policy best fits your needs and budget

### 4. Ongoing Support

- Chat with Old Sparrow about insurance questions
- Get personalized advice based on your profile
- Track your insurance research and decisions

## Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with custom components
- **Icons**: Lucide React
- **State Management**: Zustand

### Backend

- **Database & Functions**: Convex (real-time database with serverless functions)
- **Authentication**: Convex Auth with Google OAuth
- **File Upload**: Uploadthing
- **PDF Processing**: Multiple PDF parsing libraries

### AI & LLM

- **LLM Provider**: OpenRouter (access to multiple AI models)
- **Primary Models**: Anthropic Claude, Google Gemini
- **AI SDK**: OpenAI SDK for chat completions

### Development & Deployment

- **Runtime**: React 19 with React Compiler
- **Analytics**: Vercel Analytics & Speed Insights
- **Hosting**: Vercel (recommended)
- **Package Manager**: Bun (preferred) or npm/yarn

## Project Structure

```
old-sparrow/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── chat/           # Chat interface
│   │   ├── login/          # Authentication
│   │   └── page.tsx        # Landing page
│   ├── components/         # Reusable UI components
│   ├── screens/            # Page-level components
│   ├── store/              # Zustand state management
│   └── lib/                # Utility functions
├── convex/                 # Convex backend
│   ├── auth.ts            # Authentication logic
│   ├── chats.ts           # Chat management
│   ├── coupon.ts          # Credits system
│   ├── generate.ts        # AI response generation
│   ├── pdfActions.ts      # PDF processing
│   └── schema.ts          # Database schema
└── public/                # Static assets
```

## Key Features Explained

### Credit System

- Users receive default credits upon signup
- Credits are consumed for AI interactions
- Coupon system for adding credits
- Usage tracking and management

### Policy Analysis Engine

- Processes insurance policy PDFs
- Extracts key information using AI
- Provides structured analysis and comparisons
- Supports multiple insurance providers

### Intelligent Chat

- Context-aware conversations
- Personalized advice based on user profile
- Maintains chat history
- Supports file uploads and analysis

## Contributing

We welcome contributions to Old Sparrow! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the existing code style and patterns
4. **Test thoroughly**: Ensure your changes work correctly
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes and their benefits

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Write clear, self-documenting code
- Test your changes thoroughly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/old-sparrow/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Old Sparrow** - Making health insurance simple and understandable for everyone.
