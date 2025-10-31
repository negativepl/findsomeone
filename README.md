# FindSomeone - Local Services Marketplace Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-AI-412991?style=for-the-badge&logo=openai&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT--NC-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Non--Commercial-orange?style=for-the-badge)

[🌐 Live Demo](https://findsomeone.app) • [📖 Documentation](./docs/README.md) • [📁 Project Structure](./PROJECT_STRUCTURE.md) • [📜 License](#-license--usage)

</div>

---

> **📢 Important**: This code is **free for non-commercial use** - you can modify and run it for personal/educational purposes.
> Commercial use requires a separate license. See [License & Usage](#-license--usage) for details.

A modern web application for publishing and browsing local service listings. Users can search for specialists (plumbers, electricians, etc.) or offer their services. The project features advanced AI capabilities, moderation system, and admin panel.

## 🌟 Key Features

### 🧠 AI-First Architecture
- **Semantic search** with OpenAI embeddings + pgvector
- **Hybrid search** (60% semantic + 40% full-text) with typo-tolerance
- **Smart suggestions** based on user behavior
- **AI-generated synonyms** for better search results

### ⚡ Real-time & Performance
- **Live messaging** with Supabase Realtime
- **Presence indicators** (online/offline status)
- **Optimistic updates** for better UX
- **Rate limiting** and abuse protection

### 🛡️ Enterprise-grade Security
- **Row Level Security (RLS)** for all tables
- **Admin audit logs** tracking all actions
- **Content moderation** with AI validation
- **Encrypted storage** for sensitive data

### 🎨 Modern UX
- **Framer Motion** animations
- **Mobile-first** responsive design
- **Gesture-based** mobile dock
- **Accessibility** (a11y) compliant

## 🎬 Demo & Key Features

> **Note**: The application is fully functional and production-ready.

### Main Features
- 🔍 **AI-powered Search** - Semantic search using OpenAI embeddings
- 💬 **Realtime Chat** - Live messaging with presence indicators
- ⭐ **Rating System** - User reviews and ratings
- 🛡️ **Admin Panel** - Comprehensive moderation and management
- 📱 **Fully Responsive** - Perfect on mobile and desktop
- 🎨 **Modern UI** - Beautiful animations and transitions (Framer Motion)

### Key Routes
- [`/`](https://findsomeone.app) - Landing page with hero section
- [`/dashboard`](https://findsomeone.app/dashboard) - Post listings with live search
- [`/dashboard/posts/new`](https://findsomeone.app/dashboard/posts/new) - Create a post
- [`/dashboard/messages`](https://findsomeone.app/dashboard/messages) - Messaging system
- [`/dashboard/favorites`](https://findsomeone.app/dashboard/favorites) - Favorite posts
- [`/dashboard/profile`](https://findsomeone.app/dashboard/profile) - User profile
- [`/admin`](https://findsomeone.app/admin) - Admin panel (requires permissions)

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI/ML**: OpenAI (GPT-5 nano, text-embedding-3-small), pgvector
- **Email**: Resend
- **Validation**: Zod, React Hook Form
- **UI Components**: Framer Motion, Radix UI, Sonner (toasts)
- **Security**: Row Level Security (RLS), Rate Limiting

## ✨ Features

### 🎯 Core Features
- ✅ **Authentication & Authorization**
  - Email/password and Google OAuth
  - Row Level Security (RLS) in database
  - Middleware for route protection
  - User profiles with avatars

- ✅ **Posts**
  - Create posts (seeking/offering)
  - Category system with icons
  - Edit and delete own posts
  - Multi-image upload (Supabase Storage)
  - Budget (min/max, type: hourly/fixed/negotiable)
  - Location (city, district)
  - View counter
  - Post detail view

- ✅ **User Dashboard**
  - Browse posts with filtering
  - My posts (active/inactive/archived)
  - Favorite posts
  - Private messaging system
  - Profile editing and settings

### 🤖 AI-powered Features
- ✅ **Semantic Search**
  - OpenAI text-embedding-3-small (1536 dimensions)
  - pgvector extension with HNSW index
  - Hybrid search (60% semantic + 40% full-text)
  - Typo-tolerance via trigrams

- ✅ **Smart Suggestions**
  - Personalized suggestions based on history
  - User preference analysis
  - Trending queries in favorite categories

- ✅ **AI Synonym Generator**
  - GPT-5 nano for search enhancement
  - 3 modes: Trending, Popular, Custom
  - Review & approve system in admin panel

- ✅ **Search Analytics**
  - Trending queries
  - Search history (last 90 days)
  - Rate limiting (10 req/10s per IP)

### 💬 Communication System
- ✅ **Private Messages**
  - Chat between users
  - Realtime updates (Supabase Realtime)
  - Presence indicators (online/offline)
  - Unread message counter
  - Conversation grouping
  - Message reporting

### ⭐ Rating & Review System
- ✅ **Reviews**
  - 1-5 star ratings
  - Text comments
  - Aggregated statistics (average rating, review count)
  - Display in user profile
  - Prevent duplicate reviews

### 🛡️ Admin Panel
- ✅ **Post Moderation**
  - AI validation on post creation
  - Status workflow (pending/checking/flagged/approved/rejected)
  - Bulk actions
  - Filtering and pagination
  - Audit trail

- ✅ **Message Moderation**
  - Review reported messages
  - Accept/reject reports
  - Ban users

- ✅ **Category Management**
  - CRUD operations
  - Icon system (Lucide Icons)
  - Slugs and sorting

- ✅ **User Management**
  - Banned users list
  - Ban/unban functionality
  - Ban reason tracking

- ✅ **AI Settings**
  - Embedding management
  - Vector regeneration
  - Synonym generator
  - Search analytics

- ✅ **Audit Logs**
  - History of all admin actions
  - Change tracking
  - IP and user agent logging

### 🎨 UI/UX
- ✅ **Responsive Design**
  - Mobile-first approach
  - Adaptive navigation
  - Mobile dock with gesture animations

- ✅ **Animations**
  - Scroll animations
  - Parallax effects
  - Floating elements
  - Geometric backgrounds
  - Smooth transitions (Framer Motion)

- ✅ **Landing Page**
  - Hero section with CTA
  - Value proposition section
  - Call-to-action sections
  - Footer with links

### 🔐 Security
- ✅ Row Level Security (RLS) policies
- ✅ Rate limiting on endpoints
- ✅ Input validation (Zod)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure file uploads (validation, size limits)

## 🔮 AI Features Details

This project uses advanced AI for better user experience:

### **1. Semantic Search**
```
Technology:
- OpenAI text-embedding-3-small (1536 dimensions)
- pgvector extension in PostgreSQL
- HNSW index for fast search
- Cosine similarity for vector comparison
```

**How it works:**
1. User enters query (e.g., "water installer")
2. OpenAI generates embedding for the query
3. PostgreSQL finds most similar embeddings in database
4. Returns posts even if they don't contain exact words

**Example:**
- Query: "water installer" → Finds: "plumber", "pipe fitter", "installation specialist"

### **2. Hybrid Search**
```typescript
// Search weights
semantic_weight: 60%  // Semantic meaning
fulltext_weight: 40%  // Exact match + synonyms
```

**Benefits:**
- ✅ Finds semantically similar results
- ✅ Handles typos (trigrams)
- ✅ Expands query with synonyms
- ✅ Fast (optimized indexes)

### **3. Smart Suggestions**
Personalized suggestions for each user:

**3 suggestion sources:**
1. **Behavioral** - Search history (90 days)
2. **Semantic** - Similarity to preferences
3. **Trending** - Popular in favorite categories

### **4. AI Synonym Generator**
```
Model: GPT-5 nano
Access: /admin/synonyms
Modes: Trending | Popular | Custom
```

**Workflow:**
1. Admin selects generation mode
2. AI suggests synonyms for popular phrases
3. Admin accepts/rejects suggestions
4. Approved synonyms enhance search

### **AI Setup**

Detailed guide: [SEMANTIC_SEARCH_SETUP.md](./SEMANTIC_SEARCH_SETUP.md)

**Quick Start:**
```bash
# 1. Add API key
echo "OPENAI_API_KEY=sk-..." >> .env.local

# 2. Run migrations (if not already done)
# Files in: supabase/migrations/20250111120000_*.sql

# 3. Generate embeddings via admin panel
# Visit: /admin/embeddings
# Click: "Generate Embeddings for All Posts"
```

**Operating costs:**
- Embedding 1000 posts: ~$0.01
- 10,000 searches/month: ~$0.30
- **Total:** ~$0.35/month for small project

**Performance:**
- Search latency: <100ms
- Accuracy: ~85% semantic match
- Typo tolerance: 2-3 characters

## 📜 License & Usage

### MIT License with Non-Commercial Clause

This project uses a **dual-license model**:

✅ **FREE for Non-Commercial Use:**
- ✅ Use, modify, and distribute for **personal projects**
- ✅ Run for **educational purposes** (learning, teaching)
- ✅ Fork and experiment for **skill development**
- ✅ Study the code for **portfolio review**
- ✅ Use in **non-profit organizations**

❌ **Commercial Use Requires License:**
- ❌ Running a similar service for profit
- ❌ Using in commercial products
- ❌ Charging users for access
- ❌ Deploying for business purposes

### Why is the code public?

This project is open-source to:
1. **Build trust** - Users can verify security and privacy
2. **Portfolio showcase** - Demonstrate technical skills
3. **Community learning** - Help developers learn modern web dev
4. **Transparency** - Open development process

### Get a Commercial License

Interested in commercial use? Contact me:
- **GitHub**: [@marcinbaszewski](https://github.com/marcinbaszewski)
- **Details**: See [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md)

**⚖️ Full License**: [LICENSE](./LICENSE)

---

## 🔧 For Developers: Running Locally

> **Note**: You can run this locally for **non-commercial purposes only** (learning, experimentation, portfolio review).

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key (optional, for AI features)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/marcinbaszewski/findsomeone.git
cd findsomeone

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (required for AI features)
OPENAI_API_KEY=sk-your-key

# Resend (optional, for email notifications)
RESEND_API_KEY=re-your-key
```

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations from `supabase/migrations/` in SQL Editor
3. Enable authentication providers in Supabase Dashboard

**Live Demo**: [https://findsomeone.app](https://findsomeone.app)

## 📁 Project Structure

```
findsomeone/
├── app/                            # Next.js 15 App Router
│   ├── page.tsx                    # Landing page
│   ├── login/                      # Login
│   ├── signup/                     # Registration
│   ├── dashboard/                  # User dashboard
│   │   ├── posts/                  # Post management
│   │   ├── messages/               # Messaging system
│   │   ├── favorites/              # Favorite posts
│   │   └── profile/                # Profile editing
│   └── admin/                      # Admin panel
│       ├── moderation/             # Post moderation
│       ├── reports/                # Message reports
│       ├── categories/             # Category management
│       ├── embeddings/             # AI embeddings
│       └── synonyms/               # AI synonym generator
│
├── components/                     # React components
│   ├── ui/                         # shadcn/ui components
│   ├── admin/                      # Admin components
│   ├── Navbar.tsx                  # Main navigation
│   └── LiveSearchBar.tsx           # AI-powered search
│
├── lib/                            # Libraries and utilities
│   ├── supabase/                   # Supabase clients
│   ├── actions/                    # Server Actions
│   │   ├── posts.ts                # Post actions
│   │   ├── messages.ts             # Message actions
│   │   └── search.ts               # AI search engine
│   └── types/
│       └── database.ts             # TypeScript types
│
├── supabase/                       # Supabase configuration
│   └── migrations/                 # SQL migrations
│
├── LICENSE                         # MIT + Non-Commercial
├── LICENSE-COMMERCIAL.md           # Commercial license info
└── README.md                       # This file
```

## 🗄️ Database Architecture

### Main Tables

#### **profiles**
- User profiles (extends auth.users)
- Fields: full_name, bio, phone, city, avatar_url, rating, total_reviews, verified, is_banned

#### **categories**
- Service categories with icons
- Fields: name, slug, description, icon, sort_order

#### **posts**
- User listings
- Fields: title, description, type (seeking/offering), city, district, price_*, images[], moderation_status, view_count, embedding (vector)
- Indexes: HNSW for semantic search, GIN for full-text, trigram for typo-tolerance

#### **messages**
- Private messages between users
- Fields: sender_id, receiver_id, post_id, content, read, reported, report_status
- Realtime subscription for live updates

#### **reviews**
- User ratings and reviews
- Fields: reviewer_id, reviewee_id, post_id, rating (1-5), comment
- Automatic average rating updates

#### **favorites**
- Saved favorite posts
- Fields: user_id, post_id
- Unique constraint on (user_id, post_id)

#### **search_analytics**
- Search analytics
- Fields: user_id, query, results_count, clicked_post_id, ip_address

#### **synonyms**
- Search synonyms (AI-generated)
- Fields: term, synonym, status (pending/approved/rejected), generated_by_ai

#### **admin_audit_logs**
- Admin action history
- Fields: admin_id, action_type, target_table, target_id, old_values, new_values, ip_address

### Row Level Security (RLS)
All tables have RLS policies:
- Users can read/edit only their own data
- Messages accessible only to sender/receiver
- Admin has full access via security definer functions
- Public read for posts (filtered by moderation_status)

### PostgreSQL Functions
- `get_reported_messages()` - Fetch reported messages with details
- `search_posts_hybrid()` - Hybrid search (semantic + full-text)
- Auto-update average ratings in triggers
- Auto-increment counters (view_count, total_reviews)

## 🚀 Deployment

Ready to deploy on **Vercel**:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

**Note**: Deployment for commercial purposes requires a commercial license.

## 📊 Project Metrics

- **Lines of Code**: ~15,000+
- **Components**: 45+
- **Pages**: 25+
- **Database Tables**: 12
- **API Routes/Actions**: 30+
- **Tech Stack**: 15+ technologies

## 🤝 Contributing

While **commercial use is restricted**, I welcome:

✅ **Bug reports** - Found an issue? Open an Issue
✅ **Feature suggestions** - Have an idea? Share in Discussions
✅ **Security reports** - Found a vulnerability? Contact privately
✅ **Questions** - Want to learn how something works? Ask!

❌ **Not accepting:**
- Pull requests (this is a solo project)
- Commercial use requests without proper licensing

### How to contribute:

1. **Bug reports**: [Open an Issue](https://github.com/marcinbaszewski/findsomeone/issues)
2. **Discussions**: Use GitHub Discussions
3. **Security**: Contact privately for security issues

## 👤 Author

**Marcin Baszewski**
- Portfolio project - Modern local services marketplace
- GitHub: [@marcinbaszewski](https://github.com/marcinbaszewski)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hosting and deployment
- [OpenAI](https://openai.com) - AI capabilities
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Next.js](https://nextjs.org) - React framework

---

**⭐ If you find this project helpful, please star it!**

**📧 Questions?** Open an issue or discussion on GitHub.

**💼 Commercial use?** See [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md)
