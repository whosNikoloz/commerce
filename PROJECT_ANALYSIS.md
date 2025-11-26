# Project Analysis & Product Documentation

## Overview
This project is a high-performance, scalable, and feature-rich e-commerce platform built with the latest web technologies. It is designed to support multi-tenancy, internationalization, and real-time updates, making it suitable for modern digital commerce businesses. The platform includes a customer-facing storefront and a comprehensive admin dashboard for management.

## Technology Stack
-   **Framework:** Next.js 15 (App Router)
-   **Language:** TypeScript
-   **UI Library:** React 19, HeroUI, Radix UI, Tailwind CSS
-   **State Management:** Zustand
-   **Authentication:** Custom OAuth (Google, Facebook), NextAuth.js
-   **Real-time:** SignalR
-   **Maps:** Leaflet / React Leaflet
-   **Charts:** Recharts
-   **Editor:** Tiptap
-   **Animation:** Framer Motion
-   **Payments:** BOG (Bank of Georgia), TBC Bank

## Core Features

### 1. Storefront (User Experience)
The storefront is designed for speed, accessibility, and conversion.
-   **Dynamic Routing & Navigation:**
    -   Multi-language support (`[lang]` routing).
    -   Dynamic category and product pages.
    -   Customizable navigation bars.
-   **Product Discovery:**
    -   **Advanced Search:** Integrated search functionality.
    -   **Facetted Filtering:** Filter products by attributes (facets) dynamically.
    -   **Product Comparison:** Compare multiple products side-by-side.
    -   **Categories:** Hierarchical category browsing.
-   **Shopping Experience:**
    -   **Cart:** Real-time shopping cart synchronization.
    -   **Checkout:** Streamlined checkout process.
    -   **Wishlist:** Save products for later.
    -   **User Panel:** Manage orders, profile, and addresses.
-   **UI/UX:**
    -   **Dark Mode:** Built-in theme switching (Light/Dark).
    -   **Responsive Design:** Mobile-first approach.
    -   **Animations:** Smooth transitions using Framer Motion.

### 2. Admin Panel (Management)
A powerful dashboard for store administrators to control every aspect of the business.
-   **Dashboard:**
    -   Real-time analytics and overview.
    -   Sales charts and performance metrics.
-   **Catalog Management:**
    -   **Products:** Create, edit, and manage products with rich text descriptions (Tiptap).
    -   **Categories:** Manage category trees.
    -   **Brands:** Manage brand associations.
    -   **Facets:** Configure product filters and attributes.
    -   **Product Groups:** Group products for promotions or collections.
-   **Sales & Orders:**
    -   **Order Management:** View and process orders.
    -   **Customers:** Manage customer data and history.
    -   **Shipping:** Configure shipping methods and rates.
    -   **Payments:** Monitor payment transactions.
-   **Content & Configuration:**
    -   **FAQs:** Manage frequently asked questions.
    -   **Stores:** Multi-store management.
    -   **Sync:** Synchronization with external systems (Fina).
    -   **Image Cropping:** Built-in tool for product image optimization.

### 3. Technical Capabilities
-   **Multi-Tenancy:**
    -   Tenant resolution based on hostname (`getTenantByHost`).
    -   Tenant-specific configurations and fonts.
-   **Authentication & Security:**
    -   Secure OAuth flows for Google and Facebook.
    -   Role-based access control (Admin vs. User).
-   **Payments:**
    -   Integrated with major Georgian banks (BOG, TBC).
-   **SEO:**
    -   Dynamic metadata generation.
    -   Sitemap and Robots.txt support.
    -   OpenGraph image generation.

## API & Services
The application uses a service-oriented architecture to interact with backend data.
-   **Services:**
    -   `authService`: User authentication and session management.
    -   `productService`: Product catalog operations.
    -   `orderService`: Order processing and history.
    -   `paymentService`: Payment gateway integration.
    -   `syncService`: Data synchronization.
    -   `tenantService`: Tenant configuration.

## Conclusion
This platform offers a complete solution for launching a modern e-commerce business. It combines a beautiful, responsive frontend with a robust backend management system, all built on a scalable Next.js architecture.
