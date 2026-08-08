# Rekha Patel Psychology - Clinical Psychology Practice Management System

## Overview

A production-grade full-stack application designed specifically for clinical psychologist Dr. Rekha Patel's practice. This system provides:

- **Professional Online Presence**: Beautiful, accessible website showcasing services and expertise
- **Online Booking System**: 24/7 appointment scheduling with real-time availability
- **Secure Payment Processing**: Integrated Stripe payments with automatic receipts
- **Admin Dashboard**: Comprehensive management interface for appointments, schedules, and patient data
- **Real-time Features**: Live updates for booking changes, payments, and notifications
- **Audit Trail**: Complete activity logging for compliance and security
- **On-Premise Deployment**: Docker-based deployment for data sovereignty and low latency

## Key Features

### For Patients
- Browse therapy services (Individual, Couples, Family, CBT, EMDR, Online)
- View real-time availability and book appointments instantly
- Secure online payments with multiple payment methods
- Patient portal to view, reschedule, or cancel appointments
- Automated appointment reminders via email and SMS
- Download payment receipts and appointment confirmations

### For Dr. Rekha Patel (Admin)
- Comprehensive dashboard with key metrics and analytics
- Complete appointment management (CRUD, filtering, search)
- Schedule management with recurring availability patterns
- Patient management with contact information and history
- Real-time notifications for new bookings, cancellations, and payments
- Financial reporting and revenue tracking
- Clinic settings management
- Complete audit trail of all system activities

### Technical Excellence
- **Modern Stack**: Next.js 14, TypeScript, TailwindCSS, Shadcn UI
- **Secure Authentication**: NextAuth.js v5 with multiple providers
- **Payments**: Stripe Integration with webhook handling
- **Real-time**: Socket.io for live updates
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker Compose with nginx reverse proxy
- **Testing**: Unit, integration, and E2E test suites
- **CI/CD**: GitHub Actions pipeline for automated testing and deployment
- **Accessibility**: WCAG 2.2 AA compliant
- **Security**: OWASP Top 10 protections, encryption, audit logging

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom design system
- **UI Components**: Shadcn UI (Radix UI primitives)
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Charts**: Recharts for analytics
- **Notifications**: Sonner toast system
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes with tRPC for type-safe endpoints
- **Authentication**: NextAuth.js v5 (Credentials, Google)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io server with Redis adapter
- **Payments**: Stripe API integration
- **Validation**: Zod schemas
- **Logging**: Winston (configured in production)
- **Caching**: Redis for Socket.io scaling

### DevOps & Infrastructure
- **Containerization**: Docker multi-stage builds
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx with SSL termination
- **CI/CD**: GitHub Actions with automated testing
- **Monitoring**: Health checks and logging
- **Backup**: Automated database backup strategies
- **Scaling**: Horizontal scaling ready for app and socket servers

### Security Features
- **Authentication**: JWT-based sessions with refresh token rotation
- **Authorization**: Role-based access control (Patient/Admin/Super Admin)
- **Encryption**: TLS 1.2+ for all communications
- **Data Protection**: Field-level encryption for sensitive data
- **Input Validation**: Comprehensive Zod validation on all endpoints
- **Rate Limiting**: Per-IP and per-endpoint rate limiting
- **Security Headers**: CSP, X-Frame-Options, XSS Protection, etc.
- **Audit Logging**: Complete activity tracking for compliance
- **Password Security**: bcrypt hashing with configurable rounds
- **Environment Secrets**: Never committed to repository

## Database Schema

The system uses a normalized PostgreSQL schema designed for a psychology practice:

### Core Entities
- **Users**: Patients, admins, and super admins with role-based permissions
- **Services**: Therapy offerings with pricing, duration, and categorization
- **Availability**: Practitioner schedules with recurring patterns
- **TimeSlots**: Individual bookable time intervals
- **Appointments**: Booked sessions with status tracking and notes
- **Payments**: Stripe-integrated payment records
- **Notifications**: Real-time alerts and communications
- **AuditLogs**: Complete system activity trail
- **ClinicSettings**: Practice configuration and preferences

### Key Relationships
- Patients → Appointments (one-to-many)
- Admins → Appointments (one-to-many, as practitioner)
- Services → Appointments (one-to-many)
- TimeSlots → Appointments (one-to-one)
- Appointments → Payments (one-to-one)
- Users → Notifications (one-to-many)
- Users → AuditLogs (one-to-many)

## API Endpoints

### Public Endpoints
- `GET /api/services` - List all active therapy services
- `GET /api/availability/slots?serviceId=&date=` - Get available time slots
- `POST /api/bookings` - Create new appointment booking
- `POST /api/payments/intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Protected Patient Endpoints
- `GET /api/patient/appointments` - List patient's appointments
- `PATCH /api/patient/appointments/:id` - Reschedule/cancel appointment
- `GET /api/patient/payments` - Payment history

### Protected Admin Endpoints
- `GET /api/admin/appointments` - List/filter all appointments
- `PATCH /api/admin/appointments/:id` - Update appointment status
- `GET /api/admin/availability` - Manage practitioner schedule
- `POST /api/admin/availability` - Create availability slot
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/patients` - List all patients
- `GET /api/admin/notifications` - Admin notifications

### Real-time Events (Socket.io)
- `appointment:created` - New booking request
- `appointment:updated` - Appointment status change
- `appointment:cancelled` - Appointment cancellation
- `slot:available` - Time slot opened for booking
- `slot:booked` - Time slot booked
- `notification:new` - New notification for user
- `admin:stats:updated` - Dashboard statistics update

## Deployment Instructions

### Prerequisites
- Docker Engine 20.10+
- Docker Compose v2+
- Node.js 20.x (for local development)
- PostgreSQL 15+ (if not using Docker)
- Stripe account (for payments)
- Domain name with SSL certificate (for production)

### Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-repo/rekha-patel-psychology.git
   cd rekha-patel-psychology
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Setup Database**
   ```bash
   # Using Docker (recommended)
   docker-compose up -d postgres redis
   
   # Or local PostgreSQL
   # createdb psychology_db
   
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Start Development Servers**
   ```bash
   # In one terminal
   npm run dev          # Next.js on http://localhost:3000
   
   # In another terminal
   npm run dev:socket   # Socket.io on http://localhost:3001
   ```

6. **Access Application**
   - Visit http://localhost:3000
   - Admin login: Use the seeded admin account (email: rekha@rekhapatel.com, password: demo123)

### Production Deployment

1. **Prepare Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Build and Deploy**
   ```bash
   # Pull latest code
   git pull origin main
   
   # Build images
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   
   # Start services
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   
   # Run migrations
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec app npx prisma migrate deploy
   
   # Seed initial data (if needed)
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec app npx prisma db seed
   ```

3. **Configure Nginx**
   - Ensure SSL certificates are in `/etc/nginx/ssl/`
   - Update nginx.conf with your domain
   - Reload nginx: `docker-compose exec nginx nginx -s reload`

4. **Monitor Health**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
   ```

## Testing

### Run Test Suite
```bash
# Unit tests
npm run test

# Unit tests with watch mode
npm run test:watch

# E2E tests (requires running services)
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint

# Generate Prisma client
npx prisma generate

# Database studio
npx prisma studio
```

### Test Coverage
- Unit tests for utility functions, validators, and helpers
- Integration tests for API endpoints
- E2E tests for critical user journeys (booking, payment, admin actions)
- Aim for >80% code coverage

## Configuration

### Environment Variables
See `.env.example` for all required variables. Key sections:

#### Database
```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

#### Authentication
```
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-plus-character-secret"
```

#### Stripe
```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### Email (Optional)
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Rekha Patel Psychology <noreply@rekhapatel.com>"
```

#### Socket.io
```
NEXT_PUBLIC_SOCKET_URL="https://yourdomain.com"
REDIS_URL="redis://localhost:6379"
```

#### Application
```
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
DOMAIN="yourdomain.com"
```

## Architecture

### High-Level Components
```
�┌─────────────────�┐    � ┌──────────────────�┐    � ┌──────────────────�┐
│   Web Browser   │    │   Web Browser    │    │   Web Browser    │
│ (Patient Portal)│    │  (Admin Dashboard│    │   (Mobile App)   │
�└─────────────────�┘    └──────────────────�┘    └──────────────────�┘
           │                       │                       │
           � ▼                       � ▼                       � ▼
    � ┌─────────────────────────────────────────────────────────────�┐
    │                    Next.js Application                      │
    │  (Handles SSR, API Routes, Authentication, Payments)        │
    └───────────────────────�┬─────────────────────────────────────�┘
                            │
    � ┌───────────────────────�▼─────────────────────────────────────�┐
    │                    Socket.io Server                         │
    │              (Real-time updates and notifications)         │
    └───────────────────────�┬─────────────────────────────────────�┘
                            │
    � ┌───────────────────────�▼─────────────────────────────────────�┐
    │                    PostgreSQL Database                      │
    │             (All persistent data with full ACID)           │
    └───────────────────────�┬─────────────────────────────────────�┘
                            │
    � ┌───────────────────────�▼─────────────────────────────────────�┐
    │                       Redis Cache                           │
    │         (For Socket.io scaling and session storage)         │
    └─────────────────────────────────────────────────────────────�┘
```

### Data Flow
1. **User Action**: Patient clicks "Book Appointment"
2. **Frontend**: Next.js validates form and sends API request
3. **API Route**: Next.js API endpoint processes request, validates with Zod
4. **Business Logic**: Prisma operations create/update database records
5. **Real-time**: Socket.io server emits events to connected clients
6. **Payment**: Stripe integration handles payment processing
7. **Webhooks**: Stripe webhook updates payment status and triggers notifications
8. **Notifications**: Email/SMS sent via configured providers
9. **Audit**: All actions logged to audit trail for compliance

## Security & Compliance

### HIPAA Considerations
While this system implements security best practices, users should consult with legal counsel to ensure full HIPAA compliance for their specific jurisdiction and use case.

### Data Protection
- **Encryption at Rest**: PostgreSQL transparent data encryption recommended
- **Encryption in Transit**: TLS 1.2+ enforced
- **Access Controls**: Role-based permissions with least privilege principle
- **Data Minimization**: Only necessary personal information collected
- **Retention Policies**: Configurable data retention for different data types
- **Right to be Forgotten**: GDPR/CCPA compliant data deletion procedures

### Audit Trail
All system actions are logged including:
- User logins/logouts
- Appointment creation/modification/cancellation
- Payment processing and refunds
- Schedule changes
- Settings modifications
- Data exports
- Failed access attempts

### Backup & Disaster Recovery
- Automated daily database backups
- Point-in-time recovery capabilities
- Geographic redundancy options
- Regular restore testing procedures

## Performance Optimization

### Frontend
- Code splitting and lazy loading
- Image optimization with Next.js Image component
- CSS purging with TailwindCSS
- Font optimization and preloading
- Service worker caching (planned)
- CDN integration for static assets

### Backend
- Database indexing on frequently queried fields
- Connection pooling with Prisma
- Query optimization and caching
- Pagination for large dataset queries
- Efficient real-time event distribution
- Horizontal scaling readiness

### Infrastructure
- Nginx caching for static assets
- Redis caching for Socket.io
- Database read replicas (planned)
- Load balancing for horizontal scaling
- CDN for global content delivery

## Accessibility (WCAG 2.2 AA)

The application follows WCAG 2.2 AA guidelines:

- **Semantic HTML**: Proper use of landmarks, headings, and labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and live regions
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Focus Management**: Visible focus indicators
- **Error Prevention**: Clear form validation and error messages
- **Consistent Navigation**: Predictable UI patterns
- **Text Scaling**: Supports browser text size adjustments
- **Alternative Text**: Descriptive alt text for meaningful images

## Internationalization

While currently English-focused, the architecture supports i18n:

- **Date/Time**: Uses date-fns with locale support
- **Currency**: Configurable per clinic settings
- **Text Externalization**: Ready for translation files
- **RTL Support**: CSS ready for right-to-left languages
- **Formatting**: Number and date formatting respects locale

## Extensibility

### Planned Features
- Video consultation integration (Zoom/WebRTC)
- Insurance billing and claims processing
- Outcome tracking and assessment tools
- Group therapy and workshop management
- Resource library and client education materials
- Referral tracking and marketing analytics
- Mobile application (React Native)
- Advanced analytics and reporting

### Integration Points
- **Webhooks**: Outbound webhooks for external systems
- **API**: RESTful API for third-party integrations
- **Authentication**: OAuth/OpenID Connect for SSO
- **Payments**: Alternative payment processors
- **Calendar**: Google Calendar/Outlook synchronization
- **Communication**: Twilio for SMS, SendGrid for email
- **Storage**: AWS S3 or similar for document storage

## Maintenance & Support

### Routine Tasks
- **Daily**: Check system logs and health metrics
- **Weekly**: Review audit trails and security alerts
- **Monthly**: Test backup and restore procedures
- **Quarterly**: Update dependencies and security patches
- **Annually**: Comprehensive security audit and penetration testing

### Update Procedures
1. Backup database and configuration
2. Pull latest code from repository
3. Run database migrations: `npx prisma migrate deploy`
4. Restart services: `docker-compose restart`
5. Verify functionality and check logs
6. Monitor for issues post-update

### Troubleshooting
- **Logs**: `docker-compose logs -f [service]`
- **Database**: `npx prisma studio` (development only)
- **Network**: `docker-compose exec app ping database`
- **Performance**: Monitor CPU/memory/disk usage
- **Payments**: Check Stripe dashboard and webhook logs
- **Real-time**: Verify Socket.io connections and events

## Licensing

This software is proprietary and confidential. It is the intellectual property of Rekha Patel Psychology Clinic and is licensed for use by the clinic only.

Unauthorized copying, distribution, or modification is strictly prohibited.

## Contact

For technical support or inquiries regarding this system:

**Rekha Patel Psychology Clinic**
���📧 info@rekhapatel.com
���📞 +91-80-1234-5678
���🌐 https://rekhapatel.com

---

*Built with �� ❤��️ for mental health professionals*
*Version 1.0.0 - © 2026 Rekha Patel Psychology Clinic. All rights reserved.*