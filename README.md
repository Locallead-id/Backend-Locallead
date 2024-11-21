# Backend Web Server

A backend web server for Capstone Project.

## Setup

### Prerequisites

- Node.js
- MySQL database

### Installation

1. Install dependencies

```bash
npm install
```

2. Create `.env` file in root directory

```env
PORT=3001
JWT_SECRET="your-jwt-secret"
FIREBASE_BUCKET="your-firebase-bucket"
API_URL="your-api-url"
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

3. Setup database

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start development server

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Run database seeders
