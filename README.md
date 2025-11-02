# Merchkins Storefront

A modern, multi-tenant e-commerce platform built with Next.js 16, Convex, and Clerk. Merchkins enables organizations to create brand-aligned storefronts with comprehensive product management, order processing, payment integration, and customer communication features.

## 🎯 Overview

Merchkins is a full-featured e-commerce solution that combines the power of Next.js App Router with Convex's real-time backend and Clerk's authentication system. The platform supports multiple organizations, each with their own branded storefront, product catalog, and administrative dashboard.

### Key Capabilities

- **Multi-Tenant Architecture**: Organizations can create custom storefronts with unique branding
- **Product Management**: Full CRUD operations for products, variants, categories, and inventory
- **Shopping Experience**: Browse products, manage carts, and complete checkout flows
- **Payment Processing**: Integrated payment gateway via Xendit (supports e-wallets, virtual accounts, cards)
- **Order Management**: Complete order lifecycle tracking with status updates and payment reconciliation
- **Customer Communication**: Built-in chat system, messaging, announcements, and support tickets
- **Admin Dashboard**: Comprehensive analytics, user management, and organization settings
- **Super Admin Panel**: Platform-wide management for organizations, users, permissions, and logs

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **State Management**: Zustand for client state, TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Clerk (Next.js integration)
- **Theming**: next-themes for dark mode support

### Backend

- **Database & Backend**: Convex (real-time database with automatic API generation)
- **File Storage**: Cloudflare R2 (via @convex-dev/r2)
- **Authentication**: Clerk webhooks for user sync
- **Payment Processing**: Xendit API
- **Email Service**: Mailgun

### Development Tools

- **Package Manager**: Bun
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Type Safety**: TypeScript with strict mode

## 📁 Project Structure

```
merchkins-app/
├── app/                          # Next.js App Router pages
│   ├── (admin)/                  # Admin dashboard routes
│   │   ├── admin/                # Organization admin panel
│   │   └── super-admin/         # Platform super admin panel
│   ├── (main)/                   # Main application routes
│   │   ├── (auth)/              # Authentication pages
│   │   ├── c/[slug]/            # Category pages
│   │   ├── p/[slug]/            # Product detail pages
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout flow
│   │   ├── orders/              # Order management
│   │   ├── chats/               # Customer chat
│   │   └── account/             # User account
│   └── (storefront)/            # Organization storefronts
│       └── o/[orgSlug]/         # Organization-specific storefronts
├── src/
│   ├── features/                # Feature-based organization
│   │   ├── products/           # Product-related components
│   │   ├── cart/               # Cart functionality
│   │   ├── checkout/           # Checkout flow
│   │   ├── orders/             # Order management
│   │   ├── organizations/      # Organization features
│   │   ├── admin/              # Admin dashboard features
│   │   └── super-admin/        # Super admin features
│   ├── components/             # Shared UI components
│   ├── hooks/                   # Custom React hooks
│   └── stores/                  # Zustand stores
├── convex/                      # Convex backend
│   ├── models/                  # Database schema definitions
│   ├── products/               # Product domain logic
│   ├── orders/                 # Order domain logic
│   ├── payments/               # Payment processing
│   ├── carts/                  # Cart management
│   ├── organizations/          # Organization management
│   ├── users/                  # User management
│   ├── chats/                  # Chat functionality
│   ├── tickets/                # Support tickets
│   └── http.ts                 # HTTP endpoints (webhooks)
└── lib/                        # Shared utilities
    ├── mailgun.ts              # Email service integration
    └── utils.ts                # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18+ (recommended: latest LTS)
- **Bun**: Latest version ([install Bun](https://bun.sh))
- **Convex Account**: Sign up at [convex.dev](https://convex.dev)
- **Clerk Account**: Sign up at [clerk.com](https://clerk.com)
- **Xendit Account**: Sign up at [xendit.co](https://xendit.co) (for payments)
- **Mailgun Account**: Sign up at [mailgun.com](https://mailgun.com) (for emails)
- **Cloudflare R2**: Set up R2 bucket for file storage

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd merchkins-app
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Then fill in all required values in `.env.local` (see [Environment Variables](#environment-variables) section).

4. **Set up Convex**

   ```bash
   bunx convex dev
   ```

   This will:
   - Create a new Convex project (if needed)
   - Deploy your schema and functions
   - Provide you with `NEXT_PUBLIC_CONVEX_URL`

5. **Set up Clerk**
   - Create a new Clerk application
   - Configure webhook endpoint: `https://<your-convex-url>/clerk-webhook`
   - Copy your Clerk keys to `.env.local`
   - Configure webhook secret in Clerk dashboard

6. **Seed the database (optional)**
   ```bash
   bun run seed
   ```
   Note: Requires `SEED_SECRET` environment variable to be set.

### Development

Run the development server:

```bash
bun run dev
```

This starts both:

- Next.js frontend dev server (typically `http://localhost:3000`)
- Convex backend dev server

For frontend-only development:

```bash
bun run dev:frontend
```

For backend-only development:

```bash
bun run dev:backend
```

### Building for Production

```bash
bun run build
```

Then start the production server:

```bash
bun run start
```

## 🔐 Environment Variables

All environment variables are documented in `.env.example`. Copy this file to `.env.local` and fill in your values:

### Required Variables

| Variable                 | Description                       | Where to Get It                                         |
| ------------------------ | --------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL        | Generated by `convex dev`                               |
| `CLERK_PUBLISHABLE_KEY`  | Clerk public key                  | Clerk Dashboard → API Keys                              |
| `CLERK_SECRET_KEY`       | Clerk secret key                  | Clerk Dashboard → API Keys                              |
| `CLERK_WEBHOOK_SECRET`   | Clerk webhook signing secret      | Clerk Dashboard → Webhooks                              |
| `XENDIT_SECRET_KEY`      | Xendit API secret key             | Xendit Dashboard → API Keys                             |
| `XENDIT_CALLBACK_TOKEN`  | Xendit webhook verification token | Xendit Dashboard → Webhooks                             |
| `NEXT_PUBLIC_APP_URL`    | Your application's public URL     | Your deployment URL (e.g., `https://app.merchkins.com`) |
| `MAILGUN_API_KEY`        | Mailgun API key                   | Mailgun Dashboard → API Keys                            |
| `MAILGUN_DOMAIN`         | Your Mailgun sending domain       | Mailgun Dashboard → Domains                             |

### Optional Variables

| Variable                  | Description                 | Default                    |
| ------------------------- | --------------------------- | -------------------------- |
| `CLERK_JWT_ISSUER_DOMAIN` | Custom JWT issuer domain    | Clerk default              |
| `SEED_SECRET`             | Secret for database seeding | Not set (seeding disabled) |

See `.env.example` for a complete template with descriptions.

## 🌐 Public Routes

The following routes are accessible without authentication:

- `/` - Homepage/storefront
- `/c/[slug]` - Category pages
- `/p/[slug]` - Product detail pages
- `/search` - Product search
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/o/[orgSlug]` - Organization storefronts

All other routes require authentication.

## 📊 Features

### For Customers

- **Browse Products**: Browse by category, search, filter by price/rating
- **Shopping Cart**: Add items, manage quantities, save for later
- **Checkout**: Secure checkout with multiple payment methods
- **Order Tracking**: View order history and track shipments
- **Account Management**: Update profile and preferences
- **Customer Support**: Chat with support, submit tickets

### For Organization Admins

- **Product Management**: Create, edit, delete products with variants
- **Category Management**: Organize products with hierarchical categories
- **Order Management**: Process orders, update statuses, manage fulfillment
- **Analytics**: View sales, revenue, and product performance metrics
- **Payment Reconciliation**: Track payments and reconcile transactions
- **Team Management**: Invite and manage team members
- **Announcements**: Create and manage site-wide announcements

### For Super Admins

- **Organization Management**: Create, configure, and manage organizations
- **User Management**: Manage platform users and permissions
- **Permission System**: Configure role-based access control
- **System Logs**: View platform-wide activity logs
- **Platform Analytics**: Aggregate analytics across all organizations
- **Global Announcements**: Create platform-wide announcements

## 🔌 Integrations

### Clerk Authentication

Clerk handles user authentication and session management. Webhooks sync user data to Convex:

- User creation → Creates user record in Convex
- User updates → Updates user record in Convex
- User deletion → Soft-deletes user record in Convex

**Webhook Endpoint**: `https://<your-convex-url>/clerk-webhook`

### Xendit Payments

Xendit processes payments for orders. Supports:

- E-wallets (GCash, GrabPay, etc.)
- Virtual accounts
- Credit/debit cards
- QR codes

**Webhook Endpoint**: `https://<your-convex-url>/xendit-webhook`

### Mailgun Email Service

Mailgun sends transactional emails:

- Order confirmations
- Payment receipts
- Password resets
- Notifications

### Cloudflare R2 Storage

R2 stores product images and other files:

- Image uploads via presigned URLs
- Automatic metadata syncing
- CDN-enabled delivery

## 🗄️ Database Schema

The Convex schema includes the following main tables:

- **users**: User accounts and profiles
- **organizations**: Organization/tenant records
- **organizationMembers**: User-organization relationships
- **products**: Product catalog with variants
- **categories**: Product categorization
- **carts**: Shopping carts
- **cartItems**: Cart line items
- **orders**: Order records
- **orderItems**: Order line items
- **payments**: Payment transactions
- **reviews**: Product reviews and ratings
- **chats**: Chat rooms and messages
- **tickets**: Support tickets
- **announcements**: Site announcements
- **permissions**: Permission system
- **files**: File metadata
- **logs**: System activity logs

See `convex/schema.ts` and individual model files in `convex/models/` for detailed schemas.

## 🧪 Testing

Run linting:

```bash
bun run lint
```

## 📝 Code Style

This project follows:

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Consistent code formatting
- **Feature-based architecture**: Organized by domain/feature
- **Component composition**: Reusable, composable components

See `.cursorrules` for detailed coding standards.

## 🚢 Deployment

### Frontend Deployment

The app uses Next.js standalone output mode for efficient deployments. Build output is optimized for containerized deployments.

### Convex Deployment

Deploy Convex backend separately:

```bash
bunx convex deploy --prod
```

### Environment Setup

Ensure all environment variables are set in your deployment platform:

- **Docker**: Pass via environment or `.env` file
- **Other platforms**: Configure according to platform docs

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Xendit Documentation](https://docs.xendit.co)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
