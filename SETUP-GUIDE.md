# Sapa Trenggalek - Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn
- Supabase account
- Google Gemini API key

### Installation

```bash
# Clone repository
git clone <repository-url>
cd sapa-trenggalek

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local dengan credentials Anda
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CRON_SECRET=your_cron_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

```bash
# Run database setup
node scripts/setup-database.js

# Setup vector database (optional)
node scripts/setup-vector-database.js
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Features Overview

### Admin Access

- URL: `/admin`
- Default login: Setup in Supabase auth

### Key Pages

- `/` - Main portal
- `/aspirasi` - Public aspirations
- `/hoax-checker` - Hoax detection
- `/search` - Vector search
- `/admin` - Admin dashboard

### API Endpoints

- `/api/news` - News data
- `/api/aspirasi` - Aspirations CRUD
- `/api/check-hoax` - Hoax detection
- `/api/search` - Vector search
- `/api/cron/*` - Automated tasks

## 🤖 Automation

### Cronjobs (GitHub Actions)

- **News Scraping**: Every 2 hours
- **Image Extraction**: Every 2 hours
- **Database Maintenance**: Daily
- **Trends Analysis**: Every 6 hours

### Manual Scripts

```bash
# Extract images from news
node scripts/extract-images-no-placeholder.js

# Test API endpoints
node scripts/test-api-endpoints.js

# Check database data
node scripts/check-entries-data.js
```

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL) with vector support
- **AI/ML**: Google Gemini API, Vector embeddings
- **Deployment**: Vercel with GitHub Actions

## 📞 Support

Untuk pertanyaan teknis, hubungi tim developer:

- [@brillianodhiya](https://www.linkedin.com/in/brilliano-dhiya-ulhaq-44b196194/)
- [@auliazulfa](https://www.linkedin.com/in/aulia-zulfaa-144b78259/)

---

**TitaniaLabs** - Volunteer project untuk membangun Trenggalek
