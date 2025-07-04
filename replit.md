# Employee Transportation Management System

## Overview

This is a full-stack employee transportation management system built with React, Node.js, Express, and PostgreSQL, specifically adapted for Astana, Kazakhstan. The application helps organizations manage employee transportation routes, vehicle assignments, and optimize route allocations using automated algorithms. The system provides comprehensive dashboards for managing employees, routes, vehicles, and generating detailed reports with Kazakh localization and authentic Astana geographic data.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **Development**: Hot reloading with Vite integration
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Connection**: Neon Database serverless connection
- **Schema**: Relational design with employees, routes, vehicles, and assignments tables

## Key Components

### Data Models
1. **Employees**: Personal information, addresses, coordinates, shift preferences, and route assignments
2. **Routes**: Route details, drivers, capacity, departure times, stops, and active status
3. **Vehicles**: Vehicle information, license plates, capacity, route assignments, and maintenance status
4. **Assignments**: Linking employees to routes with assignment metadata and type tracking

### Core Features
1. **Employee Management**: Add, edit, delete, and assign employees to routes
2. **Route Management**: Create and manage transportation routes with stop management
3. **Vehicle Management**: Track vehicles, maintenance status, and route assignments
4. **Assignment System**: Manual and automated employee-to-route assignment algorithms
5. **Interactive Mapping**: Leaflet.js integration for route visualization
6. **Reporting System**: Comprehensive reports with export capabilities (JSON, CSV, HTML)
7. **Dashboard Analytics**: Real-time statistics and performance metrics

### Assignment Algorithms
The system includes sophisticated assignment algorithms that consider:
- **Proximity Weight**: Distance between employee location and route stops
- **Capacity Weight**: Available seats on routes
- **Shift Weight**: Matching employee shift preferences with route times
- **Configurable Parameters**: Adjustable algorithm weights for optimization

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **API Layer**: Express.js routes handle CRUD operations and business logic
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Real-time Updates**: Query invalidation ensures UI stays synchronized
5. **File Operations**: Export utilities generate reports in multiple formats

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management
- **express**: Web application framework
- **connect-pg-simple**: PostgreSQL session store

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (configurable)
- **Hot Reload**: Enabled via Vite middleware
- **Database**: Requires DATABASE_URL environment variable

### Production Build
- **Frontend Build**: `vite build` creates optimized client bundle
- **Backend Build**: `esbuild` bundles server code for production
- **Static Assets**: Served from dist/public directory
- **Process**: Node.js serves both API and static files

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port Mapping**: Internal 5000 → External 80
- **Auto-scaling**: Configured for production deployment

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)

## Changelog
- June 27, 2025. Initial setup with in-memory storage
- June 27, 2025. Added PostgreSQL database with Drizzle ORM integration
- June 27, 2025. Complete Astana, Kazakhstan adaptation with local map coordinates, Kazakh employee names, authentic Astana locations and routes
- July 4, 2025. Implemented full multilingual support (Kazakh/Russian) with Zustand state management and comprehensive i18n system

## User Preferences

Preferred communication style: Simple, everyday language.