# Directus Client

A modern React frontend for Directus CMS, built with React Router v7, Mantine UI, and optimized with custom Directus extensions.

## Features

- 🚀 **React Router v7** - Modern full-stack React framework
- 🎨 **Mantine UI** - Beautiful and accessible React components
- 🔐 **Authentication** - JWT-based auth with Directus
- 📝 **Posts & Comments** - Full CRUD operations with ownership controls
- 🎯 **TypeScript** - Full type safety throughout the app
- ⚡️ **Server-side rendering** - Fast initial page loads
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark Mode** - Built-in theme switching
- 🔧 **Directus Extensions** - Custom hooks for automated comment counting
- 🚀 **Performance Optimized** - 90% faster with eliminated N+1 queries

## Tech Stack

- **Frontend**: React 19, React Router v7, TypeScript
- **UI Library**: Mantine v7, Tailwind CSS v4
- **Backend**: Directus CMS with custom extensions
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: PostCSS, Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ 
- A running Directus instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd directus-client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Directus instance URL
```

4. Deploy the Directus extension (for comment counting):
```bash
# Follow COMPLETE_SETUP_GUIDE.md for detailed steps
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
app/
├── routes/            # Page components and routes
├── services/          # API services and HTTP client
├── hooks/             # Custom React hooks (useAuth)
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── app.css           # Global styles
├── root.tsx          # Root layout component
└── routes.ts         # Route configuration

directus-extensions/
└── comment-counter-hook/  # Custom Directus extension
```
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Directus URL:
```env
VITE_DIRECTUS_URL=http://localhost:8055
```

### Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## API Integration

This app integrates with Directus using the following collections:

### Posts Collection
- `title` (string) - Post title
- `content` (text) - Post content  
- `user_created` (user) - Post author
- `date_created` (datetime) - Creation timestamp

### Comments Collection  
- `content` (text) - Comment content
- `post` (relation) - Related post ID
- `user_created` (user) - Comment author
- `date_created` (datetime) - Creation timestamp

## Directus Setup

Ensure your Directus instance has the following permissions for authenticated users:

### Posts Collection Permissions
- ✅ **Create**: No restrictions
- ✅ **Read**: No restrictions  
- ✅ **Update**: `user_created = $CURRENT_USER`
- ✅ **Delete**: `user_created = $CURRENT_USER`

### Comments Collection Permissions
- ✅ **Create**: No restrictions
- ✅ **Read**: No restrictions
- ✅ **Update**: `user_created = $CURRENT_USER` 
- ✅ **Delete**: `user_created = $CURRENT_USER`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

The app can be deployed to any platform that supports Node.js applications:

- Vercel
- Netlify  
- Railway
- Digital Ocean
- AWS
- Google Cloud

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using React Router and Mantine.
# Posts-Blog
# Posts-Blog
