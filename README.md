# FindSomeone

A modern local classifieds and services platform built with Next.js 16, TypeScript, and Supabase.

**Live Demo:** [findsomeone.app](https://findsomeone.app)

## Overview

FindSomeone is a web application for publishing and browsing local classified ads. The platform supports various listing types including vehicle sales, property rentals, job postings, equipment rentals, service offerings, and more. The project features advanced functionality including AI-powered moderation, semantic search, an intelligent chatbot assistant, and a modern, responsive UI.

## Key Features

### AI-Powered Search & Assistant
- **Semantic Search**: Vector-based search using OpenAI embeddings and pgvector
- **Chatbot Navigator**: Intelligent assistant helping users find listings through natural conversation
- **Hybrid Search**: Combined semantic (60%) and full-text (40%) search for optimal results
- **Smart Suggestions**: Context-aware search recommendations

### Real-time Communication
- Private messaging with Supabase Realtime
- Online/offline presence indicators
- Message reporting system
- Unread message counter

### Content Management
- AI-assisted listing creation and categorization
- Automatic content moderation using Hugging Face
- Image upload and compression
- Rich text editor with TipTap
- Category-based organization with hierarchical structure

### User Features
- User authentication (Email, OAuth)
- User profiles with ratings and reviews
- Favorite listings
- Listing statistics (views, phone clicks)
- Extended listing duration options

### Administration
- Moderation queue for pending listings
- Category management with AI-generated descriptions
- User management and ban system
- Comprehensive audit logs
- AI synonym generator for search optimization
- Embedding management

### Modern UX/UI
- Responsive mobile-first design
- Smooth animations with Framer Motion
- Dark/light theme support
- Mobile dock navigation with gestures
- PWA support for installable app experience
- Accessibility features

## Technology Stack

### Frontend
- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- Radix UI primitives
- Framer Motion
- React Hook Form + Zod

### Backend
- Supabase (PostgreSQL, Authentication, Realtime, Storage)
- OpenAI (GPT-4o mini, text-embedding-3-small)
- Hugging Face (content moderation)
- pgvector (vector similarity search)
- Row Level Security (RLS)

### Additional Services
- Resend (email delivery)
- Upstash (rate limiting)
- Vercel (hosting and deployment)

## Getting Started

### Prerequisites
- Node.js 20.9.0 or higher
- Supabase account (free tier available)
- OpenAI API key (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/negativepl/findsomeone.git
cd findsomeone

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (optional, for AI features)
OPENAI_API_KEY=sk-your-key

# Resend (optional, for emails)
RESEND_API_KEY=re-your-key
```

### Database Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Run migrations:
   - **For new installations**: Use consolidated migrations from `supabase/migrations_consolidated/` (4 files, ~30 seconds)
   - **For existing databases**: Use incremental migrations from `supabase/migrations/` (99 files, full history)
3. Configure authentication providers in the Supabase Dashboard
4. Enable pgvector extension in your database

See [supabase/MIGRATIONS_README.md](./supabase/MIGRATIONS_README.md) for detailed setup instructions.

## Project Structure

```
findsomeone/
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components
├── contexts/               # React Context providers
├── lib/                    # Utilities, actions, and Supabase clients
├── supabase/              # Database migrations and configuration
│   ├── migrations/         # 99 incremental migrations (full history)
│   ├── migrations_consolidated/  # 4 consolidated migrations (recommended for new setups)
│   ├── functions/          # Edge Functions (TypeScript) and SQL functions
│   ├── policies/           # Row Level Security policies
│   └── archive/           # Archived/deprecated files (see archive/README.md)
├── public/                # Static assets
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

## Database Schema

### Main Tables
- `profiles` - User profiles extending Supabase Auth
- `posts` - Classified listings with vector embeddings
- `categories` - Hierarchical category structure
- `messages` - Real-time private messages
- `favorites` - User favorites
- `reviews` - User ratings and reviews
- `admin_audit_logs` - Administrative action tracking

All tables are protected with Row Level Security (RLS) policies.

## Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Features Implementation

**Semantic Search**: Implemented using pgvector and OpenAI embeddings. See `lib/actions/search.ts` and database functions in migrations.

**Real-time Messaging**: Uses Supabase Realtime subscriptions. See `app/dashboard/messages/` for implementation.

**AI Chatbot**: Powered by OpenAI GPT with streaming responses. See `app/api/ai-chat/` for API routes.

**Content Moderation**: Automatic moderation using Hugging Face API. See `app/api/moderate/` for implementation.

## Deployment

The project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

The application will automatically deploy on every push to the main branch.

## Documentation

- [Project Structure](./PROJECT_STRUCTURE.md) - Detailed project organization
- [AI Features](./docs/ai/) - AI and semantic search documentation
- [Setup Guides](./docs/setup/) - Configuration and implementation guides
- [Compliance](./docs/compliance/) - Privacy and content moderation guidelines

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs by [opening an issue](https://github.com/negativepl/findsomeone/issues)
- Suggest features through discussions
- Ask questions in issues or discussions

## License

This project is licensed under a custom Non-Commercial MIT License. See [LICENSE](./LICENSE) for details.

For commercial use, please contact the author for licensing options.

## Author

**Marcin Baszewski**
- GitHub: [@negativepl](https://github.com/negativepl)
- Project: Portfolio - Modern local services platform

## Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting and deployment
- [OpenAI](https://openai.com) - AI capabilities
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Next.js](https://nextjs.org) - React framework

---

**Questions?** Open an issue or discussion on GitHub.
