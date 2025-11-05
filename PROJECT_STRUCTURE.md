# FindSomeone Project Structure

## Overview

FindSomeone is a Next.js 16 application using the App Router, TypeScript, and Supabase as the backend.

## Directory Structure

```
findsomeone/
├── app/                           # Next.js 16 App Router
│   ├── (auth)/                   # Auth routing group
│   │   ├── login/               # Login page
│   │   └── signup/              # Signup page
│   ├── about/                   # About page
│   ├── admin/                   # Admin panel
│   │   ├── audit-logs/         # Admin action logs
│   │   ├── categories/         # Category management
│   │   ├── chat-assistant/     # AI chat management
│   │   ├── content-bot/        # AI content generator
│   │   ├── embeddings/        # AI embeddings management
│   │   ├── moderation/        # Post moderation
│   │   ├── reports/           # User reports
│   │   ├── synonyms/          # AI synonym generator
│   │   └── users/             # User management
│   ├── api/                    # API Routes
│   │   ├── admin/             # Admin endpoints
│   │   ├── ai-chat/           # AI Navigator Bot
│   │   ├── posts/             # Post endpoints
│   │   └── users/             # User endpoints
│   ├── banned/                 # Banned users page
│   ├── category/               # Category browsing
│   │   └── [...slug]/         # Dynamic category pages
│   ├── contact/                # Contact form
│   ├── dashboard/              # User dashboard
│   │   ├── favorites/         # Favorite listings
│   │   ├── messages/          # Messaging system
│   │   ├── my-posts/          # User listings management
│   │   ├── profile/           # User profile
│   │   └── settings/          # User settings
│   ├── faq/                    # Frequently asked questions
│   ├── how-it-works/           # How it works page
│   ├── install/                # PWA installation guide
│   ├── posts/                  # Browse listings
│   │   └── [id]/              # Listing details
│   ├── privacy/                # Privacy policy
│   ├── profile/                # Public user profiles
│   │   └── [userId]/          # User profile page
│   └── terms/                  # Terms of service
│
├── components/                 # React Components
│   ├── admin/                 # Admin panel components
│   │   ├── AIChatSettings.tsx
│   │   ├── AuditLogs.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── EmbeddingManager.tsx
│   │   ├── MessageReports.tsx
│   │   ├── ModerationQueue.tsx
│   │   ├── SynonymGenerator.tsx
│   │   └── UserManagement.tsx
│   ├── chat/                  # AI Navigator Bot components
│   │   ├── AIChatButton.tsx
│   │   └── AIChatInterface.tsx
│   ├── ui/                    # UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (other shadcn components)
│   ├── Footer.tsx             # Footer with GitHub badge
│   ├── Logo.tsx               # Application logo
│   ├── MobileDock.tsx         # Mobile navigation dock
│   ├── Navbar.tsx             # Main navigation
│   ├── NavbarWithHide.tsx     # Auto-hiding navigation
│   └── PostCard.tsx           # Listing card component
│
├── lib/                        # Libraries and utilities
│   ├── actions/               # Server Actions
│   │   ├── admin.ts          # Admin actions
│   │   ├── messages.ts       # Message actions
│   │   ├── posts.ts          # Post actions
│   │   └── search.ts         # AI search engine
│   ├── supabase/             # Supabase clients
│   │   ├── client.ts         # Client for Client Components
│   │   ├── middleware.ts     # Client for middleware
│   │   └── server.ts         # Client for Server Components
│   ├── types/                # TypeScript types
│   │   └── database.ts       # Supabase table types
│   ├── admin.ts              # Admin helper functions
│   └── utils.ts              # Utility functions
│
├── contexts/                  # React Context providers
│
├── supabase/                  # Supabase configuration
│   └── migrations/           # SQL migrations
│       ├── 20250111120000_*.sql  # Database migrations
│       └── ...
│
├── public/                    # Static files
│   ├── icons/                # PWA icons
│   ├── images/               # Images
│   └── manifest.json         # PWA manifest
│
├── docs/                      # Documentation
│   ├── ai/                   # AI features documentation
│   ├── architecture/         # Architecture documentation
│   ├── compliance/           # Legal and moderation docs
│   ├── setup/                # Setup guides
│   └── tests/                # Test reports
│
├── scripts/                   # Utility scripts
│   ├── tests/                # Test scripts
│   └── utils/                # Diagnostic tools
│
├── proxy.ts                   # Proxy (middleware successor)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Core Modules

### 1. Authentication & Users
- **Location:** `app/(auth)/`, `lib/supabase/`
- **Features:** Login, registration, OAuth (Google), session management
- **Technologies:** Supabase Auth, cookies, Row Level Security

### 2. Posts (Listings)
- **Location:** `app/posts/`, `app/dashboard/my-posts/`, `lib/actions/posts.ts`
- **Features:** Create, edit, delete, display listings
- **Technologies:** Supabase Storage (images), pgvector (AI embeddings)

### 3. AI Search
- **Location:** `lib/actions/search.ts`, `app/api/ai-chat/`
- **Features:**
  - Semantic search (OpenAI embeddings)
  - Hybrid search (60% semantic + 40% full-text)
  - AI Navigator Bot (chatbot)
  - Smart suggestions
- **Technologies:** OpenAI, pgvector, Hugging Face

### 4. Messaging System
- **Location:** `app/dashboard/messages/`, `lib/actions/messages.ts`
- **Features:**
  - Real-time private messages
  - Online/offline presence indicators
  - Message reporting system
- **Technologies:** Supabase Realtime

### 5. Admin Panel
- **Location:** `app/admin/`, `components/admin/`
- **Features:**
  - Post moderation (with Hugging Face AI)
  - Category management
  - User management and bans
  - Audit logs
  - AI synonym generator
  - Embedding management
  - AI chat configuration
- **Technologies:** Supabase RLS, Server Actions

### 6. AI Navigator Bot
- **Location:** `app/api/ai-chat/`, `components/chat/`
- **Features:**
  - Chatbot helping find listings
  - Natural conversation with users
  - Integration with semantic search
- **Technologies:** OpenAI GPT-4o mini, streaming responses

## Database (Supabase)

### Main Tables

#### `profiles`
User profiles (extends auth.users)
- Fields: full_name, bio, phone, city, avatar_url, rating, is_banned
- RLS: Users can only edit their own profiles

#### `posts`
User listings
- Fields: title, description, city, price_min, price_max, images[], embedding (vector)
- Indexes: HNSW (semantic), GIN (full-text), trigram (typo-tolerance)
- RLS: Public read, edit only by owner

#### `categories`
Listing categories
- Fields: name, slug, description, icon (Lucide), sort_order
- RLS: Public read, admin-only edit

#### `messages`
Private messages
- Fields: sender_id, receiver_id, post_id, content, read, reported
- RLS: Access only for sender and receiver
- Realtime: Subscriptions for live updates

#### `favorites`
Favorite listings
- Fields: user_id, post_id
- RLS: Users see only their favorites

#### `reviews`
User ratings and reviews
- Fields: reviewer_id, reviewee_id, post_id, rating (1-5), comment
- RLS: Public read, authenticated users can add

#### `search_analytics`
Search analytics
- Fields: user_id, query, results_count, clicked_post_id, ip_address
- Features: Rate limiting, trending queries

#### `synonyms`
Search synonyms (AI-generated)
- Fields: term, synonym, status (pending/approved/rejected), generated_by_ai
- RLS: Admin manages

#### `category_synonyms`
Category-specific synonyms
- Fields: category_id, term, synonym, status
- RLS: Admin manages

#### `admin_audit_logs`
Admin action logs
- Fields: admin_id, action_type, target_table, target_id, old_values, new_values
- RLS: Admin-only access
- Automatic cleanup after 2 years

#### `ai_chat_settings`
AI Navigator Bot settings
- Fields: enabled, model, system_prompt, max_tokens, temperature
- RLS: Admin manages, public read for enabled status

#### `ai_chat_conversations`
AI chatbot conversation history
- Fields: user_id, session_id, messages (JSONB), created_at
- RLS: Users access only their conversations

#### `site_content_embeddings`
Static site content embeddings for AI search
- Fields: content_type, title, content, url, embedding (vector)
- Used by AI Navigator to answer questions about the site

## PostgreSQL Functions

### Search
- `search_posts_hybrid()` - Hybrid search (semantic + full-text)
- Auto-generate embeddings when adding posts

### Moderation
- Automatic logging of admin actions
- Trigger to update user average rating

### Cleanup
- Automatic removal of old audit logs (>2 years)
- Supabase scheduler (Sundays at 2:00 AM)

## Key Technologies

### Frontend
- **Next.js 16** - App Router, Server Components, Server Actions
- **TypeScript** - Strong typing
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **React Hook Form + Zod** - Forms and validation

### Backend
- **Supabase** - PostgreSQL, Auth, Realtime, Storage
- **OpenAI** - Embeddings (text-embedding-3-small), GPT (chat)
- **Hugging Face** - Content moderation
- **pgvector** - Vector similarity search
- **Row Level Security** - Database-level security

### DevOps
- **Vercel** - Hosting and deployment
- **GitHub** - Version control
- **Resend** - Email delivery
- **Upstash** - Rate limiting

## Security

### Row Level Security (RLS)
All tables protected with RLS policies:
- Users see only their data
- Messages accessible only to participants
- Admin has full access (via security definer functions)

### Rate Limiting
- Search: 10 req/10s per IP
- API endpoints: Upstash Redis rate limiting

### Validation
- Zod schema for all forms
- Server-side validation in Server Actions
- XSS protection
- CSRF protection

## PWA (Progressive Web App)

- **Manifest:** `/public/manifest.json`
- **Service Worker:** Generated by `@ducanh2912/next-pwa`
- **Icons:** `/public/icons/`
- **Installation:** Instructions at `/install`

## AI Features

### 1. Semantic Search (pgvector)
```sql
-- Example: search_posts_hybrid()
SELECT * FROM search_posts_hybrid(
  query_text := 'plumber warsaw',
  similarity_threshold := 0.7,
  semantic_weight := 0.6,
  fulltext_weight := 0.4
)
```

### 2. AI Navigator Bot (OpenAI GPT)
- Model: GPT-4o mini (configurable in admin panel)
- Streaming responses
- Context-aware (conversation history)
- Integration with semantic search
- Site content search for FAQ answers

### 3. Content Moderation (Hugging Face)
- Automatic listing verification
- Spam and offensive content detection
- Status: pending → approved/rejected

### 4. Synonym Generator (OpenAI GPT)
- Modes: Trending, Popular, Custom
- Review & approve system
- Integration with full-text search

### 5. Content Bot (AI-Generated Listings)
- Bulk post generation for testing/demo
- Category-specific content
- Configurable quantity and parameters

## Deployment

### Production Requirements
- Node.js 20.9.0+
- PostgreSQL 15+ (Supabase)
- OpenAI API key
- Resend API key (email)

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
```

### Build
```bash
npm run build
npm run start
```

### Vercel Deployment
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Auto-deploy on every push

---

**Version:** 1.0.0
**Last Updated:** November 5, 2025
**Next.js:** 16.0.1
