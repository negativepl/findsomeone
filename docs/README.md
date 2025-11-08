# FindSomeone Documentation

Welcome to the FindSomeone project documentation.

## Documentation Structure

### Architecture
- [Project Structure](./architecture/PROJECT_STRUCTURE.md) - Detailed project structure and code organization

### AI & Search
- [AI Features](./ai/) - AI features and semantic search documentation
  - Semantic Search (pgvector + OpenAI embeddings)
  - AI Navigator - chatbot assistant
  - Content moderation with Hugging Face
  - Content bot for automated listing generation

### Compliance & Legal
- [Compliance](./compliance/) - Legal compliance and content moderation guidelines

### Setup & Configuration
- [Setup Guides](./setup/) - Configuration and implementation guides
  - Rate limiting setup
  - Search optimization
  - Implementation guides

### Tests & Analysis
- [Tests](./tests/) - Test reports and analysis
  - Chatbot analysis and testing

### UX/UI Design System
- [UX/UI Documentation](./ux-ui/) - Complete design system and component guidelines
  - Color palette and theming
  - Typography and spacing
  - Component patterns
  - Dark mode support

## Quick Links

### For Developers
- [Main README](../README.md) - Project overview and getting started
- [Project Structure](../PROJECT_STRUCTURE.md) - Complete directory structure and database schema
- [LICENSE](../LICENSE) - Non-Commercial MIT License

### Getting Started
1. Read the [Main README](../README.md) for project overview
2. Review the [Project Structure](../PROJECT_STRUCTURE.md) for architecture
3. Check the [Setup Guides](./setup/) for configuration

## File Naming Conventions

- `PROJECT_*` - Architecture and structure documentation
- `TEST_*` - Test reports and analysis
- `*_GUIDE` - Step-by-step implementation guides
- `*_SETUP` - Configuration and setup documentation

## Technology Stack

The project uses:
- **Next.js 16** - App Router, Server Components, Server Actions
- **Supabase** - PostgreSQL, Auth, Realtime, Storage
- **OpenAI** - GPT (chatbot), text-embedding-3-small (semantic search)
- **Hugging Face** - Content moderation
- **pgvector** - Vector similarity search
- **Framer Motion** - UI animations
- **shadcn/ui** - UI components

## Contributing

For contribution guidelines, see the [main README](../README.md).

---

**Last Updated:** November 8, 2025
