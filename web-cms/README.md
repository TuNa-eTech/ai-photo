# Web CMS - AI Photo Admin Interface

Professional admin interface for managing AI image templates and testing image generation capabilities.

## Features

- 📊 **Dashboard**: Overview with stats and recent templates
- 🎨 **Templates Management**: Full CRUD with filtering, search, and pagination
- 🖼️ **Template Detail**: Comprehensive view with image generator testing
- 🤖 **Image Generator**: Test AI generation with file upload or URL paste
- 📸 **Side-by-side Comparison**: View original and processed images
- ✏️ **Create/Edit Forms**: Tabbed interface with prompt editor and character counters
- 🎯 **Professional UI**: Material-UI v7 with custom theme (Indigo + Teal)
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔐 **Firebase Auth**: Secure authentication with JWT tokens

## Tech Stack

- **Framework**: Vite 7 + React 19
- **Language**: TypeScript 5.9
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Query v5
- **Routing**: React Router v7
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Prerequisites

- Node.js 20+ (recommended: 20.11.0)
- Yarn 1.x
- Backend API running on `http://localhost:8080` (or configure VITE_API_BASE_URL)
- Firebase project with Auth enabled

## Getting Started

### 1. Install Dependencies

```bash
cd web-cms
yarn install
```

### 2. Configure Environment

Create `.env.local` file:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# Firebase Configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development Server

```bash
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Login

Use your Firebase credentials to login. If you don't have an account, create one via Firebase Console or enable email/password auth in Firebase.

## Available Scripts

### Development

```bash
yarn dev          # Start dev server (http://localhost:5173)
yarn build        # Build for production (output: dist/)
yarn preview      # Preview production build
yarn lint         # Run ESLint
```

### Testing

```bash
yarn test         # Run unit tests with Vitest
yarn test:ui      # Run tests with UI
yarn test:coverage # Run tests with coverage report
```

## Project Structure

```
web-cms/
├── src/
│   ├── api/                    # API client layer
│   │   ├── client.ts          # Axios client with interceptors
│   │   ├── templates.ts       # Templates API
│   │   └── images.ts          # Image processing API
│   ├── auth/                   # Authentication
│   │   ├── AuthContext.tsx    # Firebase auth context
│   │   └── hooks/useAuth.ts   # Auth hook
│   ├── components/             # UI components
│   │   ├── common/            # Shared components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   └── templates/         # Template components
│   ├── pages/                  # Page components
│   │   ├── Dashboard/
│   │   ├── Templates/
│   │   └── Login/
│   ├── router/
│   │   └── routes.tsx         # Route configuration
│   ├── theme/
│   │   └── theme.ts           # MUI theme
│   ├── types/                  # TypeScript types
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── public/                     # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Key Features Guide

### Dashboard

- View total templates, published count, drafts, and total usage
- Quick access to recent templates
- Navigate to templates list or create new template

### Templates List

- **Search**: Find templates by name or slug
- **Filters**: Filter by status (draft/published/archived), visibility (public/private), tags, and sort options
- **Actions**: Create, edit, delete, publish/unpublish, view details
- **Pagination**: Navigate through large template lists

### Template Detail

**Left Column - Template Info:**
- Thumbnail display
- Name, description, status, visibility, tags
- Usage statistics and dates
- AI Configuration (prompt, negative prompt, model info)
- Metadata (slug, ID, timestamps)
- Edit button for quick updates

**Right Column - Image Generator:**
- **Upload File**: Select image from computer (validates type and size)
- **Paste URL**: Enter direct image URL
- **Preview**: See image before generating
- **Generate**: Process image with template's AI settings
- **Result**: Side-by-side comparison (original vs processed)
- **Actions**: Download result or compare full-size images

### Create/Edit Template

Tabbed interface with 4 sections:

1. **Basic Info**: Name, slug, description
2. **AI Prompts**: 
   - Prompt (max 2000 characters)
   - Negative prompt (max 1000 characters)
   - Model provider (Gemini, OpenAI, Midjourney, Stable Diffusion)
   - Model name/version
3. **Media**: Thumbnail upload with preview and drag & drop
4. **Settings**: Status, visibility, tags

## API Integration

### Endpoints Used

```typescript
// Templates
GET    /v1/admin/templates           # List templates
GET    /v1/admin/templates/:slug     # Get single template
POST   /v1/admin/templates           # Create template
PUT    /v1/admin/templates/:slug     # Update template
DELETE /v1/admin/templates/:slug     # Delete template
POST   /v1/admin/templates/:slug/publish    # Publish
POST   /v1/admin/templates/:slug/unpublish  # Unpublish

// Images
POST   /v1/images/process            # Process image with AI
```

### Response Format (Envelope)

All API responses follow envelope format:

```typescript
// Success
{
  data: T,           // Response data
  meta?: {           // Optional metadata
    total?: number,
    page?: number,
    limit?: number
  }
}

// Error
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Theme Customization

Edit `src/theme/theme.ts` to customize colors, typography, spacing, etc.

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#3f51b5' },   // Indigo
    secondary: { main: '#009688' },  // Teal
    // ... more colors
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    // ... typography settings
  },
  // ... more theme options
})
```

## Authentication

Web CMS uses Firebase Authentication with email/password:

1. User enters credentials on login page
2. Firebase returns ID token
3. Token stored in auth context
4. API client injects token in all requests (Authorization: Bearer <token>)
5. Backend validates token with Firebase Admin SDK

## Development Tips

### Hot Reload

Vite provides instant hot module replacement (HMR). Save any file and see changes immediately.

### TypeScript

All components and functions are fully typed. VS Code will provide autocomplete and type checking.

### React Query DevTools

React Query DevTools are automatically enabled in development mode. Open the panel to inspect queries and cache.

### Debugging

1. Use browser DevTools (F12)
2. Check Network tab for API calls
3. Check Console for errors
4. Use React DevTools extension

## Troubleshooting

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install

# Clear Vite cache
rm -rf node_modules/.vite
```

### API Connection Issues

1. Verify backend is running on correct port
2. Check VITE_API_BASE_URL in .env.local
3. Verify CORS is enabled on backend
4. Check browser console for CORS errors

### Authentication Issues

1. Verify Firebase config in .env.local
2. Check Firebase Console for enabled auth methods
3. Verify backend has correct Firebase Admin SDK config
4. Clear browser cache and cookies

### Image Processing Timeout

- Default timeout is 30 seconds
- For longer processing, increase timeout in `src/api/client.ts`:

```typescript
timeout: 60000, // 60 seconds
```

## Production Deployment

### Build

```bash
yarn build
```

Output will be in `dist/` directory.

### Deploy

Deploy `dist/` folder to your hosting provider:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod`
- **AWS S3 + CloudFront**: Upload to S3 bucket
- **Docker**: Use provided Dockerfile (see `../docker/docker-compose.yml`)

### Environment Variables

Set production environment variables in your hosting provider's dashboard.

## Performance

- **Bundle Size**: ~886 kB (minified + gzipped: ~260 kB)
- **First Load**: < 2s on fast 3G
- **TTI (Time to Interactive)**: < 3s

### Optimization Tips

1. **Code Splitting**: Use React.lazy() for route-based splitting
2. **Image Optimization**: Use WebP format for thumbnails
3. **Caching**: Configure CDN cache headers
4. **Compression**: Enable Brotli/Gzip on server

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run linter: `yarn lint`
4. Build and verify: `yarn build && yarn preview`
5. Commit with clear message
6. Push and create pull request

## License

Private project - not for public distribution.

## Support

For issues or questions:
- Check `.documents/` directory for detailed documentation
- Review `.implementation_plan/` for feature implementation details
- Contact project maintainer

## Related Documentation

- [Web CMS Architecture](./../.documents/web-cms/architecture.md)
- [UI/UX Redesign Summary](./../.implementation_plan/ui-ux-redesign-summary.md)
- [Template Detail Page](./../.implementation_plan/template-detail-page-summary.md)
- [Backend API Documentation](./../.documents/api/)
