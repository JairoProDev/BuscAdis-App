# Buscadis - Marketplace App

A modern classifieds and marketplace application built with Next.js, MongoDB, and TypeScript.

## Features

- Responsive design for mobile and desktop
- Publication listings by category
- Search functionality with filters
- User authentication
- Image uploads for publications
- WhatsApp integration for contacting sellers
- Sharing publications via social media

## Prerequisites

- Node.js 16.x or later
- MongoDB (Atlas or local)
- Git

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_DB=buscadis

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: AWS S3 for image uploads
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/buscadis.git
cd buscadis
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Database Setup

The application requires MongoDB collections for each category. You can seed the database with sample data:

```bash
node src/scripts/seed-publications.js
```

This will create the necessary collections and populate them with sample publications.

## Deployment

The application can be deployed to Vercel:

```bash
npm run build
vercel --prod
```

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. Check your MongoDB Atlas IP whitelist settings
2. Verify your connection string in the `.env.local` file
3. Ensure your MongoDB user has the proper permissions
4. Try increasing connection timeout settings

```js
// Example of extended timeout settings
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});
```

### API Error Responses

If you see API errors in the application:

1. Check the browser console for detailed error messages
2. Verify that your MongoDB collections exist and contain data
3. Look at the server logs for any backend errors
4. Try running the seeding script to populate the database

### Build Errors

For build errors:

1. Make sure all dependencies are installed: `npm install`
2. Clear the Next.js cache: `rm -rf .next`
3. Update Node.js to the latest LTS version
4. Verify your TypeScript configuration in `tsconfig.json`

## Project Structure

```
.
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages and layouts
│   ├── components/     # React components
│   ├── lib/            # Utility functions and configurations
│   │   ├── mongodb.ts  # MongoDB client configuration
│   │   └── ...
│   ├── scripts/        # Database scripts and tools
│   └── ...
├── .env.local          # Environment variables (create this)
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## License

MIT
