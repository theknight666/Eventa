# Eventa — India's Premium Event Discovery Platform

## Original Problem Statement
Build a world-class, ultra-premium event discovery platform for India that aggregates and showcases all major events (startup, business, tech, AI, finance, marketing, real estate, healthcare, sports, music/cultural festivals, networking, etc.) in one place. Apple/Airbnb/Stripe/Linear-inspired premium design with glassmorphism, smooth animations, dark mode, AI-powered discovery. Eventual: organizer portal, auth, AI aggregation crawlers, community, monetization, admin panel.

## Architecture
- **Frontend:** React 19 + Tailwind + Framer Motion + Lenis smooth scroll. Cabinet Grotesk (display) + Manrope (body). Custom ThemeContext (dark/light toggle), SavedContext (localStorage).
- **Backend:** FastAPI + MongoDB (Motor). All routes `/api` prefixed.
- **AI:** emergentintegrations → OpenAI `gpt-4o-mini` (Emergent LLM key) for event summaries + recommendation re-ranking (local scoring fallback).
- Seeds 24 rich Indian events on startup across 8+ cities & 15+ categories.

## User Personas
- **Professional/attendee:** discovers relevant conferences/meetups, saves events, gets AI picks.
- **Casual explorer:** browses categories, cities, trending & festival events.

## Core Requirements (static)
Premium discovery homepage, powerful search, advanced filtering, event detail pages, save events, AI recommendations & summaries, dark/light themes.

## Implemented (2026-06-03) — V1
- Premium animated hero with parallax + live counters; preloader; glass navbar.
- Trending carousel, animated Categories grid, Featured Cities bento.
- Discover section: search, category chips, sort, advanced filters (date/format/pricing/scale), clear-all, results count.
- Event cards with hover save/share; saved-count badge.
- Event detail: cinematic hero, about, speakers, schedule timeline, venue + maps, AI Highlight (generate), ticket card (register/save/share/add-to-calendar), related events.
- AI Picks section with interest chips → live AI re-ranked recommendations.
- Dark/light theme toggle (persisted). Backend AI summarize + recommendations endpoints.
- Tested: backend 22/22 pytest pass; all critical frontend flows pass.

## Backlog (prioritized)
- **P0:** Authentication (Email/JWT + Google), Organizer portal (create/edit/delete events, dashboard, analytics).
- **P1:** Real AI aggregation engine (crawlers/feeds, dedupe, auto-categorize), interactive India map, near-me/radius search, custom date range.
- **P2:** Community layer (discussions, reviews, ratings, networking/DM), monetization (featured/sponsored, premium organizer plans), Admin moderation panel, Elasticsearch search, real ticketing/payments (Stripe/Razorpay).

## Next Tasks
1. Add authentication (gather method choice).
2. Build organizer portal + dashboard.
3. Implement real event aggregation pipeline.
