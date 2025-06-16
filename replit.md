# Event Management Platform

## Overview

This is a full-stack event management platform built with React, Express.js, and PostgreSQL. The platform connects three types of users: event organizers (contratante), service providers (prestador), and venue advertisers (anunciante). It facilitates event planning by allowing organizers to create events, service providers to apply for opportunities, and venue owners to advertise their spaces.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy using bcrypt
- **Session Management**: Express sessions with PostgreSQL store
- **API Structure**: RESTful endpoints with Express routers
- **WebSocket Support**: WebSocket server for real-time features
- **Development Server**: TSX for TypeScript execution

### Data Storage Solutions
- **Database**: PostgreSQL with Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Centralized schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### User Management
- Three user types: prestador (service provider), contratante (organizer), anunciante (venue advertiser)
- JWT-free authentication using traditional sessions
- User registration with role selection
- Password hashing with bcryptjs

### Event System
- Event creation and management for organizers
- Application system for service providers
- Event categories and budget management
- Status tracking (active, closed, cancelled)

### Service Provider Features
- Service catalog management
- Event application system with proposals and pricing
- Provider dashboard with application tracking

### Payment Integration
- Stripe integration for subscription management
- Multiple plan types (free, professional, premium)
- Customer and subscription tracking in database

### Real-time Features
- WebSocket server for live updates
- Chat messaging system (schema defined)
- Review and rating system (schema defined)

## Data Flow

1. **User Registration**: Users select their type and create accounts
2. **Event Creation**: Organizers create events with budgets and requirements
3. **Service Applications**: Providers browse events and submit proposals
4. **Application Management**: Organizers review and approve/reject applications
5. **Payment Processing**: Users upgrade to premium plans via Stripe
6. **Real-time Updates**: WebSocket connections provide live notifications

## External Dependencies

### Payment Processing
- **Stripe**: Handles subscription payments and customer management
- Environment variables: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- Environment variable: `DATABASE_URL`

### UI Components
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment
- **Error Handling**: Runtime error overlay for development

## Deployment Strategy

### Production Build
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server to `dist/index.js`
- Static files served by Express in production

### Environment Configuration
- Development: `npm run dev` runs both frontend and backend
- Production: `npm run start` serves built application
- Database migrations: `npm run db:push`

### Replit Configuration
- Autoscale deployment target
- PostgreSQL module for database
- Port 5000 mapped to external port 80

## Changelog

- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.