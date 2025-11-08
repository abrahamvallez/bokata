# E-commerce Platform for Handmade Crafts

## Project Overview

Build an online marketplace where artisans can sell handmade crafts and customers can discover and purchase unique products.

## Domain Context

E-commerce, Artisan marketplace, Handmade goods

## User Requirements

### For Customers:
- Browse products by category (jewelry, home decor, clothing, etc.)
- Search for products by keyword or tags
- View product details with images, descriptions, and pricing
- Add products to shopping cart
- Update cart quantities
- Remove items from cart
- Complete checkout process
- Enter shipping information
- Select payment method
- Review order summary
- Complete payment
- Receive order confirmation
- Track order status
- View order history

### For Artisans:
- Create seller profile
- Add products to catalog
- Upload product images
- Set pricing and inventory
- Manage orders
- Update order status

## Business Objectives

- Launch MVP in 3 months
- Focus on customer experience first (seller features can be v2)
- Need early validation with real users
- Start with web platform (mobile later)

## Technical Constraints

- **Frontend:** React or Next.js
- **Backend:** Node.js + Express or Next.js API routes
- **Database:** PostgreSQL (via Supabase)
- **Payments:** Stripe integration (can start with dummy data)
- **Images:** Cloud storage (S3 or Supabase Storage)
- **Auth:** Supabase Auth
- **Deployment:** Vercel

## Project Constraints

- **Timeline:** 3 months to MVP launch
- **Team:** 2 developers
- **Budget:** Limited, prefer open-source/low-cost solutions
- **Scope:** Start with customer-facing features only
- **Success Criteria:**
  - Users can complete full purchase flow
  - Basic product catalog works
  - Payment processing is secure
  - Site is responsive and fast

## Priority

Speed to market is critical. We need to validate the concept with real users ASAP. Focus on:
1. Core shopping experience (browse → cart → checkout)
2. Minimal but functional product catalog
3. Secure payment processing
4. Simple, clean UX

Defer for later:
- Advanced search/filters
- Seller dashboard (can add products manually at first)
- Reviews and ratings
- Wishlist
- Mobile apps
