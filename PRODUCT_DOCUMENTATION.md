# Multi-Tenant E-Commerce Platform - Product Documentation

## Executive Summary

This is a **cutting-edge, enterprise-grade multi-tenant e-commerce SaaS platform** built with Next.js 15 and React 19. The platform enables multiple businesses to run their online stores with extensive customization capabilities, comprehensive admin controls, and modern web technologies.

---

## 🎯 Target Audience

- **E-commerce businesses** looking for a white-label solution
- **Multi-brand retailers** needing separate storefronts
- **Georgian market businesses** requiring local payment gateway integration (TBC Bank, BOG)
- **Businesses** requiring FINA merchant integration
- **Startups** needing a fast time-to-market with enterprise features

---

## 🚀 Core Value Proposition

### For Business Owners
- **Zero infrastructure setup** - Deploy instantly with tenant configuration
- **Complete branding control** - Customize every visual aspect (logo, colors, fonts, layouts)
- **Multi-language support** - Reach Georgian and English-speaking customers
- **Integrated payments** - Accept payments via TBC Bank and Bank of Georgia
- **Powerful admin panel** - Manage products, orders, customers, and content
- **Real-time insights** - Analytics dashboard with key metrics
- **Mobile-ready** - PWA support with offline capabilities

### For Developers
- **Modern tech stack** - Next.js 15, React 19, TypeScript, Tailwind CSS
- **Server Components** - Optimal performance with RSC architecture
- **Type-safe** - Full TypeScript coverage with strict mode
- **Scalable architecture** - Multi-tenant system with tenant isolation
- **Extensive UI library** - HeroUI, Radix UI, shadcn/ui components
- **Production-ready** - Security headers, SEO optimization, performance tuning

---

## 🏗️ Technical Architecture

### Tech Stack

#### Frontend Core
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 19.1.1
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4.16

#### UI Components
- **Component Library**: HeroUI (v2.x)
- **Primitives**: Radix UI (Dialog, Dropdown, Popover, Select, Tabs, etc.)
- **Architecture**: shadcn/ui component patterns
- **Icons**: Lucide React, Tabler Icons, Heroicons
- **Animations**: Framer Motion 12.23.12

#### State Management
- **Global State**: Zustand 5.0.8
- **Context Providers**:
  - Cart Context (encrypted persistence)
  - Authentication Context
  - Tenant/Multi-tenancy Context
  - Product Comparison Context
  - Cart UI State Context

#### Backend Integration
- **Backend**: ASP.NET Core API
- **Authentication**: JWT with refresh tokens
- **Real-time**: SignalR for payment updates
- **Data Fetching**: Custom API client with auth

#### Performance & Optimization
- **Build Tool**: Turbopack (development)
- **Image Optimization**: Next.js Image component (AVIF, WebP)
- **Code Splitting**: Vendor, common, lib chunks
- **Caching**: ISR with 60-300s revalidation
- **Smooth Scrolling**: Lenis (optional)

#### Forms & Validation
- **Schema Validation**: Zod 4.1.11
- **Form Handling**: React Hook Form patterns

#### Rich Content
- **Rich Text Editor**: TipTap 3.0.9
- **HTML Sanitization**: isomorphic-dompurify

---

## 🎨 Multi-Tenancy System

### Tenant Resolution
- **Hostname-based routing** - Each tenant gets unique domain/subdomain
- **Configuration caching** - localStorage for fast load times
- **Backend synchronization** - Real-time config updates

### Customization Capabilities

#### Branding & Visual Identity
- **Logos**: Main logo, light mode variant, dark mode variant
- **Favicon**: Custom icon
- **Colors**:
  - Primary, surface, muted, accent colors
  - Separate light/dark mode palettes
  - Industry-specific presets (tech, fashion, beauty, food, home, B2B, cleaning)
- **Typography**:
  - Primary, secondary, heading fonts
  - Custom font sizes and weights
- **Theme Mode**: Light/dark mode with user toggle

#### Site Configuration
- **Identity**:
  - Site name, short name, description
  - Slogan/tagline (localized)
  - Site URL
- **Localization**:
  - Default locale: Georgian (ka) or English (en)
  - URL structure: `/{locale}/path`
  - Content negotiation
- **Currency**: GEL (Georgian Lari) with symbol

#### Business Information
- Contact email and phone (localized)
- Physical address with geo coordinates
- Opening hours
- VAT and registration numbers
- Legal business name
- Social media links (Twitter, Instagram, Facebook, YouTube, LinkedIn, TikTok, Pinterest)

#### SEO & Analytics
- **Meta Tags**: Keywords, author, robots directives
- **Open Graph**: Type, site name, locale, images
- **Twitter Cards**: Summary, creator, images
- **Site Verification**: Google, Bing, Yandex, Pinterest
- **Analytics Integration**:
  - Google Analytics 4 (GA4)
  - Google Tag Manager (GTM)
  - Facebook Pixel
  - Hotjar
  - Microsoft Clarity
- **Structured Data**: Organization, WebSite, Product, BreadcrumbList schemas

#### PWA Configuration
- Theme and background colors
- Display mode and orientation
- Start URL and scope
- App categories and shortcuts
- Manifest generation

#### Layout Templates
**Template 1: Traditional E-commerce**
- Category-focused navigation
- Classic navbar layout
- Product grid/carousel sections

**Template 2: Brand-Focused**
- Hero brand showcase
- Modern aesthetic
- Brand storytelling elements

#### Homepage Customization
**Configurable Sections** (drag-and-drop ordering):
1. **Hero Sections**:
   - Hero with category navigation (Template 1)
   - HeroBrand with brand focus (Template 2)

2. **Commercial Banners**:
   - Layout: Carousel or grid (1-5 columns)
   - Multiple banners with desktop/mobile images
   - Links, alt text, badges (localized)

3. **Product Rails**:
   - Custom titles and subtitles (localized)
   - Layout: Carousel or grid (2-6 columns)
   - Product limit configuration
   - Advanced filtering:
     - By category, brand, condition, stock status
     - New arrivals, liquidated, coming soon flags
     - Discount filter, price range
   - Sort options
   - "View all" link

4. **Custom HTML Sections**:
   - Full HTML/CSS support
   - Ideal for custom content blocks

#### Info Pages Customization
- **Pages**: Delivery, FAQ, Guarantee, Privacy Policy, Return Policy, Stores, Terms, About
- **Per-page Configuration**:
  - Title, description, keywords
  - Open Graph images
  - Indexing control
  - Custom HTML sections with CSS

#### Dynamic Pages
- Slug-based custom pages
- Sections: Product rails, banners, custom HTML
- Full metadata configuration
- SEO optimization

#### UI Preferences
- **Navbar Variant**: Template 1 or Template 2 style
- **Cart Variant**:
  - Dropdown (popover style)
  - Drawer (slide-in panel)
- **Animations**:
  - Fly-to-cart animation (enable/disable)
  - Smooth scrolling (enable/disable)

#### Merchant Types
- **FINA Merchant**:
  - Automatic product/category/brand synchronization
  - Stock validation
  - GitHub integration
- **CUSTOM Merchant**:
  - Manual product management
  - Standard features

---

## 🛍️ User-Facing Features

### Authentication & User Management

#### Authentication Methods
- **Email/Password**: Traditional signup/login
- **OAuth 2.0 Providers**:
  - Google Sign-In (with PKCE)
  - Facebook Login
- **Security**:
  - JWT tokens (access + refresh)
  - Automatic token refresh
  - 30-second expiry buffer
  - Secure cookie storage

#### User Flows
- Registration with email verification
- Login with remember me
- Password reset via email
- OAuth callback handling
- Session management

#### User Dashboard
- Profile management
- Order history
- Order tracking with status steps:
  - Pending → Paid → Processing → Shipped → Delivered
  - Cancellation and refund tracking
- Wishlist functionality
- Account settings

### Product Discovery & Catalog

#### Product Listing
- **Pagination**: 12 items per page
- **Sorting Options**:
  - Featured
  - Newest
  - Price (low to high / high to low)
  - Rating
  - Name (A-Z)

#### Advanced Filtering
- **Category**: Hierarchical navigation
- **Brand**: Multi-select
- **Price Range**: Min/max slider
- **Condition**: New, used, refurbished
- **Stock Status**: In stock, out of stock, coming soon
- **Dynamic Facets**: Custom attributes (size, color, material, etc.)
- **Filter Persistence**: URL-based state

#### Product Details
- **Images**: Multi-image gallery with zoom
- **Pricing**:
  - Regular price
  - Discount pricing
  - Savings calculation
- **Attributes**:
  - Stock status indicator
  - Condition badge
  - New arrival flag
  - Liquidation tag
- **Specifications**: Dynamic facet values
- **Related Products**: Similar items
- **Product Variants**: Product groups

#### Product Comparison
- Compare up to 4 products side-by-side
- Floating compare button
- Specification comparison table

### Shopping Cart & Checkout

#### Cart Features
- **UI Variants**:
  - Dropdown cart (quick view)
  - Drawer cart (detailed view)
- **Persistence**:
  - Encrypted localStorage (AES)
  - Cross-tab synchronization
- **Animations**:
  - Fly-to-cart effect (configurable)
  - Bounce animation on cart icon
- **Management**:
  - Quantity adjustment
  - Item removal
  - Stock validation (FINA merchants)
  - Real-time total calculation
- **Analytics**: Google Analytics 4 tracking

#### Checkout Process
1. **Cart Review**: Verify items and quantities
2. **Checkout Form**:
   - Shipping information
   - Contact details
   - Delivery notes
3. **Payment Selection**:
   - TBC Bank
   - Bank of Georgia (BOG)
4. **Payment Processing**:
   - Redirect to payment gateway
   - Real-time status updates (SignalR)
   - Success/failure handling
5. **Order Confirmation**:
   - Order summary
   - Tracking information

### Internationalization (i18n)

#### Supported Languages
- Georgian (ka) - Default
- English (en)

#### Implementation
- **URL Structure**: `/{locale}/path`
- **Content Negotiation**: Accept-Language header
- **Dictionary Files**: Centralized translations
- **Localized Content**:
  - Product descriptions
  - Category names
  - UI labels
  - Info pages
  - Meta tags

### Theme System

#### Dark Mode Support
- **Themes**: Light and dark modes
- **Toggle**: User-controlled switch in navbar
- **Persistence**: localStorage via next-themes
- **SSR-Safe**: No flash of incorrect theme
- **Customization**: Per-tenant color palettes

#### Industry Palettes
- Tech (blue/purple tones)
- Fashion (elegant neutrals)
- Beauty (soft pastels)
- Food (warm appetizing colors)
- Home (natural earth tones)
- B2B (professional grays/blues)
- Cleaning (fresh greens/blues)

### Navigation

#### Navbar Variants
- **Template 1**: Traditional layout with category dropdown
- **Template 2**: Modern brand-focused design
- **Features**:
  - Logo (theme-aware)
  - Category navigation
  - Search bar
  - User dropdown
  - Cart button with count badge
  - Language switcher
  - Theme toggle
  - Responsive mobile menu

#### Category Navigation
- Hierarchical category tree
- Drawer/dropdown UI
- Breadcrumb navigation on pages
- SEO-friendly URLs

### Content Pages

#### Info Pages
- About Us
- Delivery Information
- FAQ
- Guarantee Policy
- Privacy Policy
- Return Policy
- Store Locations (with maps)
- Terms and Conditions

#### Store Locator
- Interactive maps (Leaflet)
- Store markers with info
- Address and contact details
- Opening hours
- Get directions

### Performance Features

#### Image Optimization
- Next.js Image component
- AVIF and WebP formats
- Lazy loading
- Responsive sizes
- CDN integration (AWS S3)

#### Loading States
- Skeleton loaders
- Suspense boundaries
- Progressive rendering
- Smooth transitions

#### Smooth Scrolling
- Lenis smooth scroll (optional)
- Back to top button
- Anchor navigation

### PWA Support
- Installable app
- Offline capabilities
- App manifest
- Custom icons
- Splash screens

---

## 🔧 Admin Panel

### Admin Access
- **Authentication**: Admin token-based (separate from user auth)
- **Storage**: Secure cookie (`admin_token`)
- **Protection**: Middleware-protected routes
- **Login**: Admin login modal

### Dashboard Overview
- Key metrics and KPIs
- Recent orders
- Analytics charts (Recharts)
- Quick actions

### Product Management

#### Product CRUD
- **Create**: Add new products with form wizard
- **Read**: Product list with search and filters
- **Update**: Edit product details
- **Delete**: Remove products (with confirmation)

#### Product Features
- **Images**: Multiple images per product, drag-to-reorder
- **Pricing**: Regular and discount pricing
- **Stock**:
  - Stock status (in stock/out of stock/coming soon)
  - Stock validation for FINA merchants
- **Categories**: Assign single or multiple categories
- **Brands**: Link to brand
- **Facets**: Set specification values
- **Variants**: Product groups for size/color variations
- **Flags**:
  - New arrival
  - Liquidated
  - Coming soon
- **Conditions**: New, used, refurbished

### Category Management
- **Hierarchy**: Parent/child category structure
- **CRUD Operations**: Create, edit, delete categories
- **Images**: Category images for landing pages
- **Facets**: Assign relevant facets to categories
- **SEO**: Meta title, description, keywords

### Brand Management
- **Brand CRUD**: Create, edit, delete brands
- **Brand Logo**: Upload brand images
- **Brand Description**: Rich text editor

### Facet/Attribute Management
- **Custom Attributes**: Create product specifications
- **Facet Types**:
  - Dropdown
  - Checkbox list
  - Radio buttons
  - Color swatch
  - Size selector
- **Facet Values**:
  - Add/edit/delete values
  - Drag-and-drop ordering
  - Value preview
- **Display Types**: Visual preview of how facet displays

### Product Groups (Variants)
- **Group Creation**: Link related products
- **Variant Attributes**: Define variant dimensions (color, size, etc.)
- **Group Management**: Add/remove products from groups

### Order Management
- **Order List**:
  - Filterable by status, date, customer
  - Search by order ID
- **Order Details**:
  - Customer information
  - Product list with quantities
  - Pricing breakdown
  - Payment status
  - Shipping address
- **Status Updates**:
  - Pending → Paid → Processing → Shipped → Delivered
  - Cancelled, Refunded
- **Tracking**:
  - Add tracking numbers
  - Set estimated delivery dates
- **Actions**:
  - Print invoice
  - Cancel order
  - Process refund

### Customer Management
- **Customer List**: View all registered users
- **Customer Details**:
  - Contact information
  - Order history
  - Registration date
  - Account status
- **Actions**:
  - View customer orders
  - Contact customer

### Payment Records
- **Payment List**: All payment transactions
- **Payment Details**:
  - Order ID
  - Amount
  - Payment method (TBC/BOG)
  - Status
  - Transaction ID
  - Timestamp
- **Status Checking**: Verify payment status with gateway

### Shipping Management
- **Shipping Methods**: Define delivery options
- **Rates**: Set shipping costs
- **Zones**: Configure delivery areas

### Store Location Management
- **Store CRUD**: Add, edit, delete physical stores
- **Store Details**:
  - Name and address
  - Geo coordinates
  - Opening hours
  - Contact information
  - Store image
- **Map Integration**: Locations display on frontend map

### FAQ Management
- **FAQ CRUD**: Create, edit, delete FAQ entries
- **Organization**:
  - Categories for FAQs
  - Ordering
- **Rich Content**: HTML editor for answers

### Analytics
- **Dashboard Metrics**:
  - Revenue charts
  - Order trends
  - Top products
  - Customer insights
- **Date Ranges**: Filter by period
- **Export**: Data export capabilities

### FINA Sync (FINA Merchants Only)
- **Synchronization**:
  - Products from FINA system
  - Categories
  - Brands
- **Sync Panel**:
  - Manual sync trigger
  - Auto-sync scheduling
  - Sync status and logs
- **GitHub Integration**:
  - Tenant config via GitHub
  - Version control for configurations

### Admin UI Features
- **Sidebar Navigation**: Collapsible menu with icons
- **Dark Mode**: Theme toggle for admin
- **Responsive**: Mobile-friendly admin interface
- **Loading States**: Skeletons and spinners
- **Notifications**: Toast messages (Sonner)
- **Modals**: Confirmation dialogs for destructive actions
- **Drag & Drop**: dnd-kit for ordering (images, facets, sections)
- **Rich Text Editor**: TipTap for content pages

---

## 💳 Payment Integration

### Supported Payment Gateways

#### TBC Bank (Georgian Payment Gateway)
- **Payment Creation**: Generate payment URL
- **Payment Flow**:
  1. Create payment session
  2. Redirect to TBC payment page
  3. Customer completes payment
  4. Callback to result page
- **Features**:
  - Payment status checking
  - Payment cancellation
  - Real-time updates via SignalR
- **Currency**: GEL (Georgian Lari)

#### Bank of Georgia (BOG)
- **Payment Creation**: Similar flow to TBC
- **Features**:
  - Order-based payment tracking
  - Status verification
  - Cancellation support
  - SignalR notifications
- **Currency**: GEL

### Payment Features
- **Order Session**: Secure session management
- **Real-time Updates**: SignalR for instant status changes
- **Callback Handling**: Automatic success/failure processing
- **Payment Verification**: Double-check payment status with gateway
- **Error Handling**: User-friendly error messages
- **Analytics**: Payment tracking in GA4

---

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Short-lived access tokens
- **Refresh Tokens**: Long-lived renewal mechanism
- **Token Expiry**: 30-second safety buffer
- **CSRF Protection**: OAuth state parameters
- **Secure Storage**: HTTPOnly cookies for admin

### Data Security
- **Cart Encryption**: AES encryption for cart data
- **HTTPS Only**: Enforced secure connections
- **Environment Variables**: Sensitive config externalized

### HTTP Headers
- **Content Security Policy**: XSS protection
- **X-Frame-Options**: SAMEORIGIN (clickjacking protection)
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricted feature access

### Input Validation
- **Zod Schemas**: Server and client-side validation
- **HTML Sanitization**: DOMPurify for rich content
- **SQL Injection**: Parameterized queries (backend)
- **XSS Protection**: Content sanitization

---

## 📊 SEO & Analytics

### SEO Features

#### On-Page SEO
- **Meta Tags**: Title, description, keywords (localized)
- **Canonical URLs**: Prevent duplicate content
- **i18n Alternates**: hreflang tags for languages
- **Open Graph**: Rich social media previews
- **Twitter Cards**: Optimized Twitter sharing
- **Robots Meta**: Per-page indexing control

#### Structured Data (JSON-LD)
- **Organization**: Business information
- **WebSite**: Site search action
- **Product**: Product rich snippets
- **BreadcrumbList**: Navigation hierarchy
- **ItemList**: Product collections

#### Technical SEO
- **Sitemap**: Auto-generated XML sitemap
- **Robots.txt**: Crawl directives
- **Site Verification**: Google, Bing, Yandex, Pinterest
- **Dynamic OG Images**: Product images, category images, fallbacks
- **Performance**: Fast page loads (Core Web Vitals)

### Analytics Integration

#### Google Analytics 4 (GA4)
- **E-commerce Tracking**:
  - Product views
  - Add to cart events
  - Checkout events
  - Purchase events
  - Refund events
- **Custom Events**: User interactions
- **User Properties**: Segmentation

#### Google Tag Manager (GTM)
- **Tag Management**: Centralized tracking
- **Custom Tags**: Flexible implementation
- **Trigger Configuration**: Event-based tracking

#### Facebook Pixel
- **Event Tracking**: Standard and custom events
- **Conversion Tracking**: Purchase, lead, etc.
- **Audience Building**: Retargeting pixels

#### Hotjar
- **Heatmaps**: Click and scroll tracking
- **Session Recordings**: User behavior analysis
- **Feedback Polls**: User insights

#### Microsoft Clarity
- **Session Replays**: Visual user journey
- **Heatmaps**: Interaction tracking
- **Insights**: Rage clicks, dead clicks

---

## 🌐 Internationalization (i18n)

### Language Support
- **Georgian (ka)**: Default locale
- **English (en)**: Secondary locale

### Implementation
- **URL Structure**: `/{locale}/path`
- **Default Locale**: Georgian (hidden from URL for default locale)
- **Middleware**: Automatic locale detection
- **Accept-Language**: Browser language detection
- **Dictionary Files**: `dictionaries/en.json`, `dictionaries/ka.json`

### Localized Content
- **UI Labels**: All interface text
- **Product Data**: Names, descriptions
- **Categories**: Category names
- **Info Pages**: Delivery, FAQ, About, etc.
- **Meta Tags**: SEO content
- **Slogans**: Site taglines
- **Contact Info**: Phone, email

### SEO for i18n
- **hreflang Tags**: Language alternates
- **Localized URLs**: Language-specific paths
- **Open Graph Locale**: Social media localization
- **Structured Data**: Language-specific schema

---

## 🚀 Performance Optimization

### Build Optimizations
- **Turbopack**: Fast development builds
- **Code Splitting**: Vendor, common, lib chunks
- **Tree Shaking**: Eliminate unused code
- **Minification**: Compressed production builds
- **optimizePackageImports**: Reduce bundle size

### Runtime Optimizations
- **Image Optimization**:
  - Next.js Image component
  - AVIF, WebP formats
  - Responsive images
  - Lazy loading
- **Font Optimization**:
  - font-display: swap
  - Preloaded fonts
- **Resource Hints**:
  - Preconnect to APIs
  - DNS-prefetch for CDNs

### Caching Strategy
- **ISR**: Incremental Static Regeneration
  - 60s revalidation for product pages
  - 300s for category pages
  - 120s for homepage
- **localStorage Caching**: Tenant config
- **Browser Caching**: Static assets

### Loading Performance
- **Server Components**: Reduced JavaScript
- **Suspense Boundaries**: Progressive rendering
- **Skeleton Loaders**: Perceived performance
- **Code Splitting**: Lazy load routes

---

## 🎨 Design System

### Component Libraries
- **HeroUI**: Primary component library
- **Radix UI**: Headless primitives (accessibility)
- **shadcn/ui**: Component architecture patterns

### Design Tokens
- **Colors**: Brand, surface, muted, accent (light/dark)
- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent scale
- **Shadows**: Elevation system
- **Border Radius**: Rounding scale

### UI Patterns
- **Buttons**: Primary, secondary, ghost, link
- **Forms**: Input, select, textarea, checkbox, radio
- **Modals**: Dialog, drawer, popover
- **Feedback**: Toast, alert, badge
- **Navigation**: Navbar, sidebar, breadcrumbs, tabs
- **Data Display**: Card, table, list
- **Loading**: Skeleton, spinner, progress

### Responsive Design
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Mobile-first**: Progressive enhancement
- **Touch-friendly**: Adequate tap targets
- **Adaptive Layouts**: Grid and flexbox

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard access
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliance
- **Alt Text**: Image descriptions

---

## 🔌 API & Integrations

### Backend API (ASP.NET Core)
- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT bearer tokens
- **Endpoints**:
  - `/api/auth/*` - Authentication
  - `/api/products/*` - Product CRUD
  - `/api/categories/*` - Category CRUD
  - `/api/brands/*` - Brand CRUD
  - `/api/facets/*` - Facet CRUD
  - `/api/orders/*` - Order management
  - `/api/customers/*` - Customer management
  - `/api/stores/*` - Store locations
  - `/api/faqs/*` - FAQ management
  - `/api/sync/*` - FINA synchronization
  - `/api/tenant/*` - Tenant configuration

### Third-Party Integrations
- **Payment**: TBC Bank API, BOG API
- **Real-time**: SignalR (@microsoft/signalr)
- **Maps**: Leaflet + React Leaflet
- **OAuth**: Google OAuth 2.0, Facebook OAuth 2.0
- **Analytics**: GA4, GTM, Facebook Pixel, Hotjar, Clarity
- **Version Control**: GitHub API (@octokit/rest)
- **CDN**: AWS S3, custom image hosts

---

## 📱 Progressive Web App (PWA)

### PWA Features
- **Installable**: Add to home screen
- **Offline Support**: Service worker (if configured)
- **App Manifest**: Dynamic generation from tenant config
- **Icons**: Multiple sizes for devices
- **Splash Screens**: Branded loading screens
- **Theme Color**: Native UI integration
- **Display Mode**: Standalone app experience

### Configuration
- **Theme Color**: Per-tenant branding
- **Background Color**: Launch screen
- **Display**: standalone, fullscreen, minimal-ui
- **Orientation**: portrait, landscape
- **Start URL**: Homepage
- **Scope**: App boundaries
- **Categories**: shopping, business
- **Shortcuts**: Quick actions

---

## 🛠️ Developer Experience

### Development Tools
- **Hot Reload**: Turbopack fast refresh
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (implied)
- **Path Aliases**: `@/*` for clean imports

### Code Quality
- **Strict Mode**: TypeScript strict checks
- **Type Coverage**: Comprehensive types
- **Linting Rules**: Extended ESLint config
- **Best Practices**: Next.js recommended patterns

### Environment Configuration
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL` - Backend API base
  - `NEXT_PUBLIC_SITE_URL` - Frontend URL
  - OAuth client IDs (fetched from backend)
  - Analytics IDs (from tenant config)

### Debugging
- **Source Maps**: Production debugging
- **Error Boundaries**: Graceful error handling
- **Console Logging**: Development mode

---

## 📦 Deployment & Hosting

### Build Process
1. Install dependencies: `npm install`
2. Build: `npm run build` (or `npm run build:turbo` for Turbopack)
3. Start: `npm start`

### Environment Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Backend API**: ASP.NET Core running

### Production Considerations
- **Static Optimization**: Pages without dynamic data
- **ISR Pages**: Products, categories (revalidation configured)
- **CDN**: Leverage CDN for static assets
- **Image CDN**: AWS S3 or custom image host
- **Database**: Backend handles persistence

---

## 🎯 Use Cases

### Use Case 1: Fashion Retailer
- **Template**: Template 2 (brand-focused)
- **Features**:
  - Product variants (sizes, colors)
  - Brand showcase hero
  - Seasonal collections
  - Instagram integration
- **Customization**: Fashion color palette, elegant fonts

### Use Case 2: Electronics Store
- **Template**: Template 1 (traditional)
- **Features**:
  - Detailed product specifications (facets)
  - Product comparison
  - Tech support info pages
  - Warranty information
- **Customization**: Tech color palette, modern fonts

### Use Case 3: Multi-Brand Marketplace
- **Template**: Either (based on preference)
- **Features**:
  - Multiple brand management
  - Advanced filtering
  - Brand pages
  - Seller information
- **Customization**: Neutral palette, versatile layout

### Use Case 4: FINA Merchant
- **Template**: Either
- **Features**:
  - Automatic product sync from FINA
  - Stock validation
  - Real-time inventory updates
  - GitHub config management
- **Customization**: Industry-specific palette

---

## 🔮 Future Roadmap (Potential Enhancements)

### Suggested Features
- **Multi-currency Support**: Beyond GEL
- **Advanced Inventory**: Warehouse management, low stock alerts
- **Email Marketing**: Newsletter integration, abandoned cart emails
- **Loyalty Programs**: Points, rewards, referrals
- **Gift Cards**: Purchase and redemption
- **Subscriptions**: Recurring orders
- **Reviews & Ratings**: Customer feedback
- **Live Chat**: Customer support integration
- **Advanced Search**: Elasticsearch, faceted search
- **Mobile Apps**: React Native companion apps
- **B2B Features**: Bulk pricing, quotes, invoices
- **Marketplace Mode**: Multi-vendor support
- **Dropshipping**: Supplier integration

---

## 📞 Support & Resources

### Technical Support
- **Backend Issues**: ASP.NET Core team
- **Frontend Issues**: Next.js/React team
- **Payment Gateway**: TBC Bank, BOG support
- **Hosting**: Infrastructure team

### Documentation
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **HeroUI**: HeroUI documentation
- **Radix UI**: https://www.radix-ui.com

### Community
- **GitHub**: Repository issues and discussions
- **Discord**: Development community (if available)

---

## 🎓 Getting Started Guide

### For Business Owners
1. **Contact Sales**: Reach out for tenant setup
2. **Provide Branding**: Logo, colors, content
3. **Configure Store**: Use admin panel
4. **Add Products**: Upload catalog
5. **Configure Payments**: Set up TBC/BOG
6. **Go Live**: Launch your store

### For Developers
1. **Clone Repository**: Get the codebase
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Set API URL
4. **Run Development**: `npm run dev:turbo`
5. **Explore Admin**: Log in to admin panel
6. **Customize**: Adjust tenant config
7. **Build & Deploy**: Production deployment

---

## 📄 License & Legal

- **Platform**: Proprietary multi-tenant SaaS
- **Dependencies**: Open-source libraries (see package.json)
- **GDPR Compliance**: Privacy policy, data protection
- **Terms of Service**: User agreement
- **Payment Processing**: PCI compliance via TBC/BOG

---

## 📈 Key Metrics & KPIs

### Performance Metrics
- **Page Load Time**: < 2s (target)
- **Time to Interactive**: < 3s (target)
- **Lighthouse Score**: 90+ (target)
- **Core Web Vitals**: Pass all metrics

### Business Metrics
- **Conversion Rate**: Track checkout completion
- **Cart Abandonment**: Monitor and optimize
- **Average Order Value**: Upsell opportunities
- **Customer Lifetime Value**: Retention tracking

---

## 🏆 Competitive Advantages

1. **Multi-Tenant Architecture**: Lower costs, faster time-to-market
2. **Georgian Market Focus**: Local payment gateways, language support
3. **Extensive Customization**: White-label ready
4. **Modern Tech Stack**: Next.js 15, React 19 cutting-edge
5. **Comprehensive Admin**: No code changes needed for management
6. **FINA Integration**: Unique for Georgian market
7. **Performance Optimized**: Fast, SEO-friendly, accessible
8. **Enterprise-Ready**: Security, scalability, analytics

---

## 🎉 Conclusion

This multi-tenant e-commerce platform represents a **production-ready, enterprise-grade solution** for businesses looking to launch or scale their online presence. With **extensive customization, powerful admin controls, modern tech stack, and Georgian market specialization**, it's positioned as a leading choice for e-commerce in the region and beyond.

The platform's **flexibility** (two templates, configurable sections, dynamic pages), **performance** (Next.js 15 optimizations), **security** (JWT, encryption, headers), and **scalability** (multi-tenant architecture) make it suitable for businesses of all sizes—from startups to established enterprises.

Whether you're a **single-brand retailer, multi-brand marketplace, FINA merchant, or white-label provider**, this platform offers the tools and features necessary to succeed in the competitive e-commerce landscape.

---

**Ready to launch your store? Contact us to set up your tenant today!**
