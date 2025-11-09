# AI Image Stylist - Landing Page

Landing page website for AI Image Stylist application, built with React + Vite + TypeScript + Tailwind CSS v4.

## Features

- **Liquid Glass Beige Design** - Modern glassmorphism design matching the iOS app
- **Responsive Design** - Mobile-first approach, works on all devices
- **9 Pages** - Home, About, Privacy Policy, Terms of Service, Subscription Terms, Legal, Support, FAQ, Contact
- **Form Validation** - Contact and Support forms with react-hook-form + zod
- **SEO Optimized** - Meta tags and structured data with react-helmet-async
- **Smooth Animations** - Framer Motion animations throughout

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Helmet Async** - SEO meta tags

## Getting Started

### Prerequisites

- Node.js >= 20
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Project Structure

```
landing-page/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout/      # Navigation, Footer, Layout
│   │   ├── common/      # Glass components, Container, etc.
│   │   └── forms/       # ContactForm, SupportForm
│   ├── pages/           # Page components
│   │   ├── Home/        # Home page sections
│   │   ├── About/       # About page
│   │   ├── PrivacyPolicy/
│   │   ├── TermsOfService/
│   │   ├── SubscriptionTerms/
│   │   ├── Legal/
│   │   ├── Support/
│   │   ├── FAQ/
│   │   └── Contact/
│   ├── router/          # React Router configuration
│   └── assets/          # Images and static assets
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── vite.config.ts       # Vite configuration
```

## Design System

### Colors

- **Primary 1**: #F5E6D3 (Warm Linen)
- **Primary 2**: #D4C4B0 (Soft Taupe)
- **Accent 1**: #F4E4C1 (Champagne)
- **Accent 2**: #E8D5D0 (Dusty Rose)
- **Text Primary**: #4A3F35 (Dark Brown)
- **Text Secondary**: #7A6F5D (Soft Brown)

### Glass Effects

Glass effects are implemented using:
- `backdrop-filter: blur(20px)`
- Semi-transparent backgrounds (`rgba(245, 230, 211, 0.85)`)
- White borders with transparency
- Soft shadows

## Development

### Adding a New Page

1. Create a new page component in `src/pages/`
2. Add the route in `src/router/routes.tsx`
3. Add navigation link in `src/components/Layout/Navigation.tsx`
4. Add footer link in `src/components/Layout/Footer.tsx`

### Styling

- Use Tailwind CSS utility classes
- Use custom `.glass-card` and `.glass-button` classes for glass effects
- Follow the beige color palette from the design system

## Deployment

Build the project:

```bash
yarn build
```

The `dist/` folder contains the production build ready for deployment.

## License

Copyright © 2025 AI Image Stylist. All rights reserved.
