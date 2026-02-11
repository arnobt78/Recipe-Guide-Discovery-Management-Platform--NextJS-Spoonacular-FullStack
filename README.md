# Recipe Guide, Discovery & Management Platform - Next.js, PostgreSQL, Redis, Spoonacular API, Contentful CMS FullStack Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Spoonacular API](https://img.shields.io/badge/Spoonacular-API-22C55E)](https://spoonacular.com/food-api)

A modern full-stack recipe discovery and management platform built with **Next.js 15**, **React 18**, **TypeScript**, **PostgreSQL**, and the **Spoonacular API**. Search, save, and manage recipes with favourites, collections, meal planning, shopping lists, AI-powered analysis, blog (Contentful), and business insights. Built for learning and production use.

- **Live Demo:** [https://recipe-smart.vercel.app/](https://recipe-smart.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [Project Walkthrough](#project-walkthrough)
- [API Endpoints](#api-endpoints)
- [Routes](#routes)
- [Database Schema](#database-schema)
- [Components & Reusability](#components--reusability)
- [Hooks & Data Fetching](#hooks--data-fetching)
- [Keywords](#keywords)
- [Conclusion](#conclusion)

---

## Overview

**Recipe Guide** is an educational and production-ready full-stack application that demonstrates:

- **Next.js 15** App Router with server and client components
- **NextAuth v5** for authentication (Google OAuth + email/password via Credentials)
- **Prisma** + **PostgreSQL** (e.g. NeonDB) for user data, favourites, collections, meal plans, shopping lists, notes, images, and videos
- **Spoonacular API** for recipe search, details, autocomplete, and similar recipes
- **Unified API handler** at `/api/[...path]` that routes requests by path (recipes, collections, meal-plan, shopping-list, CMS, AI, weather, etc.)
- **Optional integrations:** Contentful (blog), Cloudinary (image uploads), Upstash Redis (caching), OpenRouter/Gemini/Groq/Hugging Face (AI), OpenWeather (weather-based suggestions), Resend/Brevo (email sharing), Sentry (errors), PostHog (analytics), QStash (scheduled jobs)

The app uses a **single-page experience** on the home route (`/`) with tab-based navigation: **Recipe Search**, **Favourites**, **Collections**, **Meal Plan**, and **Shopping List**. Recipe detail is a separate dynamic route `/recipe/[id]`. All auth-protected features require a logged-in user; logout clears session and redirects to the search tab without a full page refresh.

---

## Features

| Feature               | Description                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Recipe Search**     | Advanced search with filters (cuisine, diet, type, ingredients). Spoonacular API with optional API key rotation. |
| **Recipe Details**    | Full recipe info: instructions, ingredients, nutrition, taste, wine pairing, similar recipes.                    |
| **Favourites**        | Save and manage favourite recipes (auth required).                                                               |
| **Collections**       | Create custom recipe collections with custom ordering (auth required).                                           |
| **Meal Planning**     | Weekly meal planner with breakfast, lunch, dinner, snack slots (auth required).                                  |
| **Shopping List**     | Auto-generated shopping lists from selected recipes (auth required).                                             |
| **Recipe Notes**      | Personal notes and ratings per recipe (auth required).                                                           |
| **Recipe Images**     | User-uploaded images per recipe (Cloudinary, auth required).                                                     |
| **Recipe Videos**     | User-added videos (YouTube, etc.) per recipe (auth required).                                                    |
| **AI Features**       | Recipe analysis, recommendations, modifications, weather-based suggestions (optional API keys).                  |
| **Blog**              | Contentful CMS–powered blog list and post pages.                                                                 |
| **Business Insights** | Platform statistics, AI predictions, trends (auth required).                                                     |
| **API Status**        | Real-time API endpoint health monitoring.                                                                        |
| **API Docs**          | Endpoint documentation grouped by category.                                                                      |
| **Filter Presets**    | Save and load search filter presets (auth required).                                                             |
| **Email Sharing**     | Share recipes via email (Resend or Brevo).                                                                       |

---

## Technology Stack

| Layer            | Technology                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| **Framework**    | Next.js 15 (App Router, Turbopack optional)                            |
| **UI**           | React 18, Tailwind CSS, ShadCN UI (Radix), Framer Motion, Lucide icons |
| **Language**     | TypeScript 5.7                                                         |
| **Database**     | PostgreSQL (e.g. NeonDB), Prisma ORM                                   |
| **Auth**         | NextAuth v5 (JWT, Google OAuth, Credentials provider)                  |
| **Recipe API**   | Spoonacular Food API                                                   |
| **Caching**      | Upstash Redis (optional)                                               |
| **CMS**          | Contentful                                                             |
| **Image Upload** | Cloudinary                                                             |
| **Monitoring**   | Sentry, PostHog                                                        |
| **Hosting**      | Vercel                                                                 |

---

## Project Structure

```text
recipe-spoonacular/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── [...path]/route.ts    # Unified API handler (recipes, collections, meal-plan, etc.)
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # NextAuth v5
│   │   │   ├── login/            # Credentials login
│   │   │   ├── signup/           # Credentials signup
│   │   │   └── signup-nextauth/  # NextAuth signup
│   │   ├── jobs/scheduled/       # QStash cron
│   │   └── test/redis/           # Redis test
│   ├── api-docs/page.tsx         # API documentation UI
│   ├── api-status/page.tsx      # API status dashboard
│   ├── blog/
│   │   ├── page.tsx              # Blog list
│   │   └── [slug]/page.tsx       # Blog post
│   ├── business-insights/page.tsx
│   ├── recipe/[id]/page.tsx      # Recipe detail page
│   ├── test-sentry/page.tsx      # Sentry test
│   ├── layout.tsx                # Root layout, metadata, providers
│   └── page.tsx                  # Home (search + tabs)
├── src/
│   ├── components/
│   │   ├── analysis/             # AI recipe analysis, nutrition, recommendations
│   │   ├── auth/                 # LoginDialog, RegisterDialog
│   │   ├── blog/                 # BlogPostCard, BlogPostList, BlogPostDetail
│   │   ├── collections/          # CollectionManager, CollectionCard, AddToCollectionDialog
│   │   ├── common/               # EmptyState, ErrorBoundary, ConfirmationDialog
│   │   ├── filters/              # AdvancedFilters, FilterPresets
│   │   ├── hero/                 # HeroSearchSection
│   │   ├── insights/            # BusinessInsightsDashboard
│   │   ├── layout/               # Navbar, Footer, TabNavigation, AppContent
│   │   ├── meal-planning/        # MealPlanner
│   │   ├── pages/                # HomePage, RecipePage, BlogPage, ApiDocsPage, etc.
│   │   ├── recipes/              # RecipeCard, RecipeDetailCard, RecipeImageGallery, RecipeNotes
│   │   ├── search/               # SearchInput, SearchResultsMetadata
│   │   ├── shopping/             # ShoppingListGenerator, ImageUploader
│   │   ├── skeletons/            # Loading skeletons for each section
│   │   ├── status/               # ApiStatusDashboard
│   │   ├── ui/                   # ShadCN primitives (Button, Card, Dialog, Tabs, etc.)
│   │   ├── videos/               # RecipeVideoPlayer
│   │   └── weather/              # WeatherBasedSuggestions, WeatherWidget
│   ├── config/upload-presets/   # Cloudinary upload presets
│   ├── context/                  # AuthContext, RecipeContext
│   ├── hooks/                    # useRecipes, useCollections, useMealPlan, useRecipeImages, etc.
│   ├── lib/                      # posthog, utils
│   ├── utils/                    # queryInvalidation, recipeScaling, imageUtils, etc.
│   ├── api.ts                    # Client-side API helpers (getApiUrl, getAuthHeaders, fetch wrappers)
│   ├── types.ts                  # Shared TypeScript types (Recipe, RecipeImage, TabType, etc.)
│   └── global.css
├── lib/                          # Server-side utilities
│   ├── api-key-tracker.ts        # Spoonacular API key rotation (API_KEY, API_KEY_2, ...)
│   ├── api-utils-nextjs.ts       # CORS, auth (JWT/session) for API routes
│   ├── prisma.ts                 # Prisma client singleton
│   ├── recipe-api.ts             # Spoonacular API calls
│   ├── redis-cache.ts            # Redis caching helpers
│   ├── redis.ts                  # Upstash Redis client
│   └── qstash.ts                 # QStash client for cron
├── prisma/
│   └── schema.prisma             # Database schema (User, FavouriteRecipes, RecipeCollection, etc.)
├── public/                       # Static assets (images, icons)
├── auth.ts                       # NextAuth v5 config (Google, Credentials)
├── instrumentation.ts           # Sentry instrumentation
├── next.config.js                # Next config (images remotePatterns, etc.)
├── .env.example                  # Example environment variables
└── README.md                     # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** or **pnpm**
- **PostgreSQL** database (e.g. [NeonDB](https://neon.tech/))
- **Spoonacular API key** (free tier: [spoonacular.com/food-api](https://spoonacular.com/food-api))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/arnobt78/recipe-spoonacular.git
cd recipe-spoonacular

# Install dependencies
npm install

# Copy environment file and fill in required values
cp .env.example .env.local

# Generate Prisma client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root. Use `.env.example` as a template. Next.js loads `.env.local` automatically; never commit it.

### Required (minimum to run)

```env
# Spoonacular API (required for recipe search and details)
API_KEY=your_spoonacular_api_key_here

# Optional: add more keys for rotation (reduces 402 errors on free tier)
# API_KEY_2=optional_second_key
# API_KEY_3=optional_third_key

# PostgreSQL connection string (required for auth and user data)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Authentication (NextAuth v5)

```env
# Required for NextAuth
AUTH_SECRET=your-secret-here
# Generate: openssl rand -base64 32

# App URL (used for callbacks and links)
AUTH_URL=http://localhost:3000
# Production: https://your-domain.com

# Google OAuth (optional; without these, only Credentials login works)
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
# Alternative names also supported: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

### Optional services

```env
# Redis (Upstash) – caching
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=your-token

# Contentful – blog
CMS_SPACE_ID=your-space-id
CMS_DELIVERY_TOKEN=your-delivery-token
CMS_ENVIRONMENT=master

# Cloudinary – recipe image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI (at least one for analysis/recommendations/modifications)
OPENROUTER_API_KEY=your-key
GOOGLE_GEMINI_API_KEY=your-key
GROQ_LLAMA_API_KEY=your-key
HUGGING_FACE_INFERENCE_API_KEY=your-key

# Weather – weather-based recipe suggestions
OPENWEATHER_API_KEY=your-key

# Email – recipe sharing (Resend or Brevo)
RESEND_TOKEN=your-token
BREVO_API_KEY=your-key
EMAIL_SENDER_ADDRESS=noreply@yourdomain.com

# Sentry – error tracking
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# PostHog – analytics
NEXT_PUBLIC_POSTHOG_KEY=your-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App URLs (metadata, links in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### How to obtain environment variables

| Variable                      | How to get it                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `API_KEY`                     | [Spoonacular](https://spoonacular.com/food-api) → Sign up → Dashboard → API Key                                                                                                                        |
| `DATABASE_URL`                | [Neon](https://neon.tech/) or any PostgreSQL host → Connection string (include `?sslmode=require` for Neon)                                                                                            |
| `AUTH_SECRET`                 | Run `openssl rand -base64 32` in terminal                                                                                                                                                              |
| `GOOGLE_ID` / `GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web app), set redirect URI to `http://localhost:3000/api/auth/callback/google` |
| `UPSTASH_REDIS_*`             | [Upstash](https://upstash.com/) → Create Redis database → Copy URL and token                                                                                                                           |
| `CMS_*`                       | [Contentful](https://www.contentful.com/) → Space Settings → API keys → Content delivery API token; Environment = master                                                                               |
| `CLOUDINARY_*`                | [Cloudinary](https://cloudinary.com/) → Dashboard → Account details                                                                                                                                    |
| `OPENROUTER_API_KEY`          | [OpenRouter](https://openrouter.ai/) → Keys                                                                                                                                                            |
| `GOOGLE_GEMINI_API_KEY`       | [Google AI Studio](https://aistudio.google.com/) → Get API key                                                                                                                                         |
| `OPENWEATHER_API_KEY`         | [OpenWeather](https://openweathermap.org/api) → Sign up → API key                                                                                                                                      |
| `RESEND_TOKEN`                | [Resend](https://resend.com/) → API Keys                                                                                                                                                               |
| `BREVO_API_KEY`               | [Brevo](https://www.brevo.com/) → SMTP & API → API Keys                                                                                                                                                |
| `SENTRY_DSN`                  | [Sentry](https://sentry.io/) → Create project → Client keys (DSN)                                                                                                                                      |
| `NEXT_PUBLIC_POSTHOG_*`       | [PostHog](https://posthog.com/) → Project Settings → Project API key and host                                                                                                                          |

---

## How to Run

| Command                   | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `npm run dev`             | Start dev server (Turbopack) at `http://localhost:3000` |
| `npm run dev:webpack`     | Start dev server with Webpack                           |
| `npm run build`           | Production build                                        |
| `npm run start`           | Run production server                                   |
| `npm run lint`            | Run ESLint                                              |
| `npm run prisma:generate` | Generate Prisma client                                  |
| `npm run prisma:push`     | Push Prisma schema to database (no migrations)          |
| `npm run prisma:studio`   | Open Prisma Studio (DB GUI)                             |

---

## Project Walkthrough

### 1. Home page (`/`)

- **Hero**: Search bar and optional advanced filters (cuisine, diet, type, etc.).
- **Tabs**: Recipe Search (default), Favourites, Collections, Meal Plan, Shopping List (auth-only tabs appear when logged in).
- **Search**: Requests go to `/api/recipes/search` (Spoonacular). Results show as cards with image, title, badges (vegan, gluten-free, etc.), scores, and favourite button.
- **URL**: Tab state is synced to query param `?tab=favourites` (etc.); `?tab=search` is omitted for a clean `/`.

### 2. Recipe detail (`/recipe/[id]`)

- **Data**: Fetched via `/api/recipes/[id]/information` (and related endpoints). Rendered by `RecipePage` and `RecipeDetailCard`.
- **Tabs**: Details (instructions, ingredients), Summary, Info (meta), Nutrition, Taste.
- **Actions**: Add to favourites, add to collection, add to meal plan, add to shopping list, share by email.
- **User content** (when authenticated): Notes, recipe images (upload via Cloudinary), recipe videos.

### 3. Blog (`/blog`, `/blog/[slug]`)

- **List**: From Contentful via `/api/cms/blog`. Each post links to `/blog/[slug]`.
- **Post**: Fetched via `/api/cms/blog/[slug]`. Rendered with `BlogPostDetail`.

### 4. Business insights (`/business-insights`)

- **Auth**: Required. Shows platform stats, popular recipes, AI-related metrics. Data from `/api/business-insights`.

### 5. API status (`/api-status`)

- **Dashboard**: Status of main API endpoints; auto-refresh (e.g. every 10 seconds).

### 6. API docs (`/api-docs`)

- **Reference**: Endpoints grouped by category (recipes, collections, meal-plan, etc.) with method, path, and parameters.

---

## API Endpoints

The app uses a **unified API handler** at `app/api/[...path]/route.ts`. The path array is derived from the URL: e.g. `/api/recipes/search` → `path = ["recipes", "search"]`. GET, POST, PUT, DELETE are handled in the same file.

### Recipes & search

| Method          | Path                        | Description                                                             |
| --------------- | --------------------------- | ----------------------------------------------------------------------- |
| GET             | `/api/recipes/search`       | Search recipes (query: searchTerm, page, filters). Proxies Spoonacular. |
| GET             | `/api/recipes/autocomplete` | Autocomplete suggestions.                                               |
| GET             | `/api/recipes/favourite`    | Current user's favourites (auth).                                       |
| POST            | `/api/recipes/favourite`    | Add favourite (auth).                                                   |
| DELETE          | `/api/recipes/favourite`    | Remove favourite (auth).                                                |
| GET             | `/api/recipes/images`       | Recipe images for a recipe (auth). Query: `recipeId`.                   |
| POST            | `/api/recipes/images`       | Add recipe image (auth). Body: recipeId, imageUrl, imageType.           |
| DELETE          | `/api/recipes/images`       | Delete recipe image (auth).                                             |
| GET             | `/api/recipes/notes`        | Recipe note (auth). Query: `recipeId`.                                  |
| POST/PUT/DELETE | `/api/recipes/notes`        | Create/update/delete note (auth).                                       |
| GET             | `/api/recipes/videos`       | Recipe videos (auth). Query: `recipeId`.                                |
| POST            | `/api/recipes/videos`       | Add video (auth).                                                       |
| DELETE          | `/api/recipes/videos`       | Delete video (auth).                                                    |

Spoonacular-backed proxy routes (e.g. recipe information, summary, similar) are typically called from the server-side recipe page or via the same handler with path like `recipes/[id]/information` (implementation may use internal fetch to Spoonacular).

### AI

| Method | Path                      | Description             |
| ------ | ------------------------- | ----------------------- |
| POST   | `/api/ai/search`          | AI-powered search.      |
| POST   | `/api/ai/recommendations` | Recipe recommendations. |
| POST   | `/api/ai/analysis`        | Recipe analysis.        |
| POST   | `/api/ai/modifications`   | Recipe modifications.   |

Require at least one of: `OPENROUTER_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `GROQ_LLAMA_API_KEY`, `HUGGING_FACE_INFERENCE_API_KEY`.

### Collections

| Method | Path                          | Description               |
| ------ | ----------------------------- | ------------------------- |
| GET    | `/api/collections`            | List collections (auth).  |
| GET    | `/api/collections/[id]`       | Get collection (auth).    |
| GET    | `/api/collections/[id]/items` | Collection items (auth).  |
| POST   | `/api/collections`            | Create collection (auth). |
| POST   | `/api/collections/[id]/items` | Add item (auth).          |
| PUT    | `/api/collections/[id]`       | Update collection (auth). |
| DELETE | `/api/collections/[id]`       | Delete collection (auth). |
| DELETE | `/api/collections/[id]/items` | Remove item (auth).       |

### Meal plan & shopping

| Method | Path                 | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| GET    | `/api/meal-plan`     | Get meal plan (auth). Query: e.g. weekStart. |
| POST   | `/api/meal-plan`     | Add/update meal plan (auth).                 |
| DELETE | `/api/meal-plan`     | Clear meal plan (auth).                      |
| GET    | `/api/shopping-list` | Get shopping list (auth).                    |
| POST   | `/api/shopping-list` | Create/update list (auth).                   |
| PUT    | `/api/shopping-list` | Update list (auth).                          |
| DELETE | `/api/shopping-list` | Delete list (auth).                          |

### Food & wine (Spoonacular)

| Method | Path                     | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/api/food/wine/dishes`  | Dishes for a wine.       |
| GET    | `/api/food/wine/pairing` | Wine pairing for a dish. |

### CMS & platform

| Method | Path                     | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/api/cms/blog`          | List blog posts (Contentful).  |
| GET    | `/api/cms/blog/[slug]`   | Single blog post (Contentful). |
| GET    | `/api/business-insights` | Platform statistics (auth).    |
| GET    | `/api/status`            | API health status.             |

### Other

| Method              | Path                       | Description                                     |
| ------------------- | -------------------------- | ----------------------------------------------- |
| POST                | `/api/upload`              | Image upload to Cloudinary.                     |
| POST                | `/api/weather/suggestions` | Weather-based recipe suggestions (OpenWeather). |
| POST                | `/api/email/share`         | Share recipe by email (Resend/Brevo).           |
| GET/POST/PUT/DELETE | `/api/filters/presets`     | Filter presets (auth).                          |

Auth is enforced via session/JWT in `lib/api-utils-nextjs.ts` (e.g. `requireAuth(request)`). Client-side calls use `src/api.ts` (getApiUrl, getAuthHeaders) so the same routes are hit with credentials.

---

## Routes

| Route                | Type    | Description                                                                      |
| -------------------- | ------- | -------------------------------------------------------------------------------- |
| `/`                  | Static  | Home: search + tabbed UI (search, favourites, collections, meal plan, shopping). |
| `/recipe/[id]`       | Dynamic | Recipe detail page.                                                              |
| `/blog`              | Static  | Blog list (Contentful).                                                          |
| `/blog/[slug]`       | Dynamic | Single blog post.                                                                |
| `/business-insights` | Static  | Analytics dashboard (auth).                                                      |
| `/api-status`        | Static  | API status dashboard.                                                            |
| `/api-docs`          | Static  | API documentation.                                                               |
| `/test-sentry`       | Static  | Sentry test page.                                                                |

---

## Database Schema

Key Prisma models (see `prisma/schema.prisma`):

| Model                | Purpose                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User**             | Auth user (id, email, name, picture, optional password). Relations: favourites, collections, notes, mealPlans, shoppingLists, recipeImages, filterPresets, recipeVideos. |
| **FavouriteRecipes** | User favourites (userId, recipeId). Unique per user+recipe.                                                                                                              |
| **RecipeCollection** | User-created collection (name, description, color).                                                                                                                      |
| **CollectionItem**   | Item in a collection (recipeId, recipeTitle, recipeImage, order).                                                                                                        |
| **RecipeNote**       | User note per recipe (content, rating, tags).                                                                                                                            |
| **MealPlan**         | Weekly plan (weekStart).                                                                                                                                                 |
| **MealPlanItem**     | Meal slot (recipeId, dayOfWeek, mealType, servings).                                                                                                                     |
| **ShoppingList**     | List (name, recipeIds, items JSON).                                                                                                                                      |
| **RecipeImage**      | User-uploaded image (imageUrl, imageType, caption).                                                                                                                      |
| **FilterPreset**     | Saved search filters (name, filters JSON).                                                                                                                               |
| **RecipeVideo**      | User-added video (e.g. YouTube URL).                                                                                                                                     |

All user-scoped tables use `userId` and cascade on user delete.

---

## Components & Reusability

Components are structured so they can be reused in this app or copied into others. They rely on `src/types.ts`, `src/api.ts`, and optionally context/hooks.

### Using a single component

**RecipeCard** – display a recipe with image, title, badges, favourite button:

```tsx
import RecipeCard from "@/components/recipes/RecipeCard";

<RecipeCard
  recipe={recipe}
  onFavouriteButtonClick={() => {}}
  isFavourite={false}
  onRecipeClick={(id) => router.push(`/recipe/${id}`)}
/>;
```

**SearchInput** – search bar with optional autocomplete:

```tsx
import SearchInput from "@/components/search/SearchInput";

<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  onSubmit={(term) => doSearch(term)}
  placeholder="Search recipes..."
/>;
```

**EmptyState** – empty list message:

```tsx
import EmptyState from "@/components/common/EmptyState";

<EmptyState
  message="No recipes yet"
  subtitle="Try searching or add from favourites."
/>;
```

### Architecture

- **Pages** (`src/components/pages/`): Full-page client components (HomePage, RecipePage, BlogPage, ApiDocsPage, BusinessInsightsPage, ApiStatusPage).
- **Feature components** (`src/components/recipes/`, `collections/`, `meal-planning/`, etc.): Feature-specific UI; often use hooks from `src/hooks/`.
- **UI** (`src/components/ui/`): ShadCN primitives (Button, Card, Dialog, Tabs, Input, etc.). Reusable in any project that uses Tailwind + Radix.
- **Skeletons** (`src/components/skeletons/`): Loading placeholders aligned with main components.

---

## Hooks & Data Fetching

Data fetching uses **TanStack Query (React Query)** with hooks in `src/hooks/`. The client calls `src/api.ts`, which uses `NEXT_PUBLIC_API_URL` and auth headers (session/JWT).

**Example: search and favourites**

```tsx
import { useSearchRecipes } from "@/hooks/useRecipes";
import { useIsFavourite } from "@/hooks/useIsFavourite";

const { data, isLoading, searchRecipes } = useSearchRecipes();
const { isFavourite, toggleFavourite } = useIsFavourite(recipeId);

// Search
searchRecipes("pasta", 1, { cuisine: "Italian" });

// Favourite
await toggleFavourite();
```

**Example: collections**

```tsx
import { useCollections, useCollectionDetail } from "@/hooks/useCollections";

const { collections, createCollection, isLoading } = useCollections();
const { collection, items } = useCollectionDetail(collectionId);
```

**Example: meal plan and shopping list**

```tsx
import { useMealPlan } from "@/hooks/useMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";

const { mealPlan, addToMealPlan, removeFromMealPlan } = useMealPlan();
const { shoppingList, addRecipes, clearList } = useShoppingList();
```

**Example: recipe images and notes**

```tsx
import { useRecipeImages, useAddRecipeImage } from "@/hooks/useRecipeImages";
import { useRecipeNotes } from "@/hooks/useRecipeNotes";

const { data: images } = useRecipeImages(recipeId, true);
const addImage = useAddRecipeImage();
const { note, saveNote } = useRecipeNotes(recipeId);
```

All auth-protected hooks depend on `useAuthCheck()` or session; when the user logs out, cache is cleared and these queries are disabled or refetched as needed.

---

## Keywords

`recipe app`, `Next.js`, `React`, `TypeScript`, `Spoonacular API`, `PostgreSQL`, `Prisma`, `NextAuth`, `full-stack`, `meal planning`, `shopping list`, `recipe collections`, `favourites`, `AI recipe`, `Contentful`, `Cloudinary`, `Tailwind CSS`, `ShadCN`, `Vercel`, `Redis`, `Sentry`, `recipe search`, `recipe management`, `educational project`

---

## Conclusion

Recipe Guide is a full-featured recipe platform that demonstrates:

- **Next.js 15** App Router with server and client components and a unified API route handler.
- **Prisma + PostgreSQL** for user data, favourites, collections, meal plans, shopping lists, notes, images, and videos.
- **NextAuth v5** for Google OAuth and Credentials (email/password) with session/JWT.
- **Spoonacular API** for recipe data, with optional multi-key rotation.
- **ShadCN UI + Tailwind** for a consistent, accessible UI.
- **React Query** for client-side caching and auth-aware data fetching.
- Optional integrations (Contentful, Cloudinary, Redis, AI, weather, email, Sentry, PostHog) for blog, uploads, caching, AI features, and monitoring.

You can use it as a reference for building similar apps, as a base to extend with new features, or as teaching material for full-stack Next.js and TypeScript.

---

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com/](https://www.arnobmahmud.com/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
