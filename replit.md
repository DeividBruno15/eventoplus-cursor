# Evento+ - SaaS Event Marketplace Platform

## Overview

Evento+ is a comprehensive SaaS marketplace platform that connects event organizers with service providers and venue owners. The platform operates with a three-tier subscription model for each user type (Prestadores, Contratantes, Anunciantes) and includes integrated payment processing, real-time chat, and a complete event management ecosystem.

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
- **Database**: PostgreSQL with Supabase serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Centralized schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations (npm run db:push)

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

## Design System & Branding

### Color Palette
- **Primary Color**: `#3C5BFA` (Blue) - Main brand color
- **Secondary Color**: `#FFA94D` (Orange) - Accent color  
- **Text Colors**: Black (`#000000`) for primary, Gray (`#4B5563`) for secondary
- **Theme Configuration**: Centralized in `/client/src/lib/theme.ts`

## External Dependencies

### Payment Processing
- **Stripe**: Handles subscription payments and customer management
- Environment variables: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`

### Database
- **Supabase**: Serverless PostgreSQL hosting with real-time features
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

### June 17, 2025 - Complete Platform Implementation with Advanced Features
- **Institutional Homepage Redesign**: Clean, modern design following Figma reference with proper section organization, pricing tables, FAQ, and service categories
- **Layout Architecture Fix**: Separated public routes (no sidebar) from protected routes (with sidebar) to eliminate topbar duplication
- **Core Marketplace Features**: Complete event creation, service provider listings, application system, and detailed event pages with real-time updates
- **Advanced Dashboard System**: Personalized dashboards for each user type (Contratantes, Prestadores, Anunciantes) with real-time metrics and user-specific actions
- **Real-time Chat System**: Full WebSocket-powered messaging with contact lists, message history, and real-time notifications
- **Service Provider Directory**: Searchable directory with advanced filtering by category, location, price range, and ratings
- **Event Management**: Complete CRUD for events with application tracking, approval/rejection system, and status management
- **Venue Management**: Full venue listing system for anunciantes with amenities, pricing, and availability management
- **Advanced Search & Filters**: Comprehensive search system with debounced queries, active filter management, and category-specific options
- **Analytics & Metrics**: Complete analytics dashboard for prestadores with performance charts, usage statistics, and growth insights
- **Review & Rating System**: Full review functionality with rating distribution, comment system, and review management
- **Notification Center**: Real-time notification system with unread counts, categorized notifications, and action routing
- **Subscription Management**: Complete Stripe-integrated subscription system with usage tracking, plan management, and billing history
- **Shopping Cart System**: Full cart functionality with item management, quantity updates, and checkout process
- **Digital Contracts**: Automated contract generation and management system with digital signatures
- **Two-Factor Authentication**: Complete 2FA implementation with QR codes, backup codes, and security management
- **API Documentation**: Public API with comprehensive documentation and testing interface
- **Database Schema**: Complete schema with all relationships, proper indexing, and data integrity
- **Dynamic Navigation**: User type-specific navigation with role-based menu items and access controls
- **Professional UI/UX**: Consistent design system with custom brand colors (#3C5BFA primary, #FFA94D secondary) and responsive layouts

### June 17, 2025 - Enhanced Authentication & Registration System
- **3-Step Registration Flow**: Complete redesign based on reference images with user type selection, personal/business data, and service type selection
- **Person Type Selection**: Added física/jurídica options for Contratantes and Anunciantes with appropriate field validation
- **CPF/CNPJ Validation**: Real-time validation with visual feedback and proper formatting masks
- **Password Strength Validation**: Visual strength indicator with Portuguese requirements ("Pelo menos 8 caracteres", "Pelo menos 1 letra maiúscula", "Pelo menos 1 número")
- **CEP Address System**: Complete integration with ViaCEP API for automatic address population with separate fields (Rua, Número, Bairro, Cidade, Estado)
- **Profile Image Upload**: Fixed saving and preview stretching issues with proper database persistence
- **Authentication Performance**: Optimized with user caching (5-minute TTL) for faster login/logout
- **Logout Redirect Fix**: Proper redirection to login page after logout
- **5-Niche Service Selection**: Prestadores select from 5 service categories (Entretenimento, Alimentação, Organização, Produção, Limpeza) with 33 specific services total
- **Custom Service Icons**: Implemented PNG icons matching brand colors for all service categories and replaced with custom Evento+ logo across the entire platform
- **Brand Logo Implementation**: Updated all components (header, footer, sidebar, authentication pages) to use the official Evento+ logo PNG image

### June 17, 2025 - Institutional Website Redesign & Mobile App Integration
- **Service Categories Redesign**: Updated "Tudo para seu evento perfeito" section with real service categories (Entretenimento, Alimentação, Organização, Produção, Limpeza) including custom PNG icons
- **User Profile Section**: Replaced "Como funciona" with "Encontre seu perfil na Evento+" featuring dedicated cards for each user type with direct registration links
- **Mobile App Integration**: Replaced hero section buttons with App Store/Google Play download image for mobile app promotion
- **Navigation Enhancement**: Added "Como funciona", "Quem somos", and "Contato" menu items with dedicated pages
- **Header Updates**: Changed "Começar grátis" button to "Cadastrar" for clearer call-to-action
- **CTA Section Redesign**: Replaced single "Começar gratuitamente" button with three specific registration buttons (Prestador, Contratante, Anunciante)
- **New Page Creation**: Complete pages for "Como funciona", "Quem somos", and "Contato" with comprehensive content and functional contact form
- **Consistent Branding**: Applied new Evento+ logo across all institutional pages and maintained brand color consistency
- **Responsive Design**: All new sections and pages fully responsive with proper mobile layouts

### June 17, 2025 - System-Wide Bug Fixes and UX Improvements
- **Critical Database Fix**: Resolved "pricing_model" column error preventing venue operations
- **Enhanced Address System**: Complete CEP integration with automatic field population (Rua, Número, Bairro, Cidade, Estado) for venue creation and user profiles
- **Currency Format Standardization**: Implemented Brazilian currency format (R$ 0,00) across all price fields in venues and events
- **Service Categories Update**: Updated event creation form to use the same 33 service types from registration (5 categories: Entretenimento, Alimentação, Organização, Produção, Limpeza)
- **Analytics for Advertisers**: Created dedicated analytics dashboard for anunciante user type with venue performance metrics and insights
- **Navigation Improvements**: Fixed duplicate icons by changing "Meus Eventos" to use CalendarDays icon, added notifications to all user type menus
- **Logo Size Optimization**: Reduced logo size across all components (header, sidebar, institutional pages) for better visual balance
- **Venue Creation Validation**: Enhanced form validation requiring CEP, número, and other essential fields
- **Automatic Location Population**: Venue location field automatically populated from CEP data for consistency

### June 17, 2025 - Critical Form and API Fixes
- **Venue Creation API Fix**: Resolved 400 errors in venue creation by implementing proper price field conversion and enhanced validation logging
- **Event Creation API Fix**: Fixed 400 errors in event creation with improved data processing and direct database insertion bypassing problematic schema validation
- **Logout Redirect Fix**: Corrected logout functionality to properly redirect to /auth/login using Wouter routing instead of window.location
- **Header Removal**: Removed duplicate header from "Meus eventos" page for contratante users for cleaner UI
- **Brazilian Currency Format**: Implemented R$ 0,00 format in event creation budget fields with proper comma-to-dot conversion
- **Automatic Budget Calculation**: Event total budget now automatically calculates from individual service budgets and displays in Brazilian format
- **CEP Fields Restructure**: Updated event creation form with proper CEP structure: CEP input with placeholder, separate Rua, Bairro fields below
- **File Upload Limits**: Increased server payload limits to 50MB for profile image uploads and media files
- **Database Schema Updates**: Added "number" field to venues table and updated form schemas to include street and neighborhood fields

### Implementation Summary
- **Frontend**: 15+ pages, 25+ components, complete user flows for all three user types
- **Backend**: Full API with authentication, WebSocket support, and data validation
- **Database**: Complete schema with relationships, proper indexing, and data integrity
- **Payment Integration**: Stripe subscription system with plan management and billing
- **Real-time Features**: WebSocket server for chat and notifications
- **Advanced Features**: Search, filtering, analytics, reviews, and subscription management

## User Preferences

Preferred communication style: Simple, everyday language.