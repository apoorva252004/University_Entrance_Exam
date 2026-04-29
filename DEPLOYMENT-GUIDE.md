# RV University Entrance Examination System - Deployment & Reproducibility Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Installation Steps](#installation-steps)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Default Credentials](#default-credentials)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## System Overview

**Application Name:** RV University Entrance Examination System  
**Type:** Web Application  
**Architecture:** Full-stack Next.js with SQLite Database  
**Purpose:** Student registration, admin approval, and entrance examination management

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 20.20.0 or higher | JavaScript runtime |
| **npm** | 10.8.2 or higher | Package manager |
| **Git** | Latest | Version control |

### System Requirements

- **Operating System:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** Minimum 4GB (8GB recommended)
- **Disk Space:** 500MB free space
- **Browser:** Chrome 90+, Firefox 88+, Edge 90+, or Safari 14+

---

## Environment Setup

### 1. Install Node.js

**Windows:**
```bash
# Download from https://nodejs.org/
# Install the LTS version (20.x)
# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**macOS:**
```bash
# Using Homebrew
brew install node@20

# Verify installation
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd university-exam-system

# Or if you have the source code as a ZIP
unzip university-exam-system.zip
cd university-exam-system
```

---

## Installation Steps

### Step 1: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Next.js 16.2.3 (React framework)
# - React 19.2.4 (UI library)
# - Prisma 6.0.0 (Database ORM)
# - NextAuth 5.0.0 (Authentication)
# - bcrypt 6.0.0 (Password hashing)
# - TypeScript 5.x (Type safety)
# - Tailwind CSS 4.x (Styling)
# - Jest 30.3.0 (Testing)
```

**Expected Output:**
```
added 500+ packages in 30s
```

### Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Or on Windows
copy .env.example .env
```

**Edit `.env` file:**
```env
# Database (SQLite - no configuration needed)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

**Important:** For production, generate a secure secret:
```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Step 1: Generate Prisma Client

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Step 2: Run Database Migrations

```bash
npx prisma migrate deploy
```

**Expected Output:**
```
✔ Applied migrations:
  └─ 20260416094554_init_sqlite
  └─ 20260416190931_add_exam_model
  └─ 20260416193248_add_exam_mode_and_questions
  └─ [other migrations]
```

### Step 3: Seed the Database

```bash
npx prisma db seed
```

**Expected Output:**
```
Creating schools and programs...
Created 9 schools with 2 programs each
Creating admin user...
Created admin: admin@rvu.edu.in (username: admin)
Creating teachers...
Created 18 teachers (2 per school)
Database seed completed successfully!
Total: 9 schools, 18 teachers, 1 admin
```

**What Gets Seeded:**
- 1 Admin account
- 9 Schools (Computer Science, Business, Law, etc.)
- 18 Programs (2 per school)
- 18 Teachers (2 per school)

---

## Running the Application

### Development Mode

```bash
# Start the development server
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.2.3 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.x.x:3000

✓ Ready in 1.5s
```

**Access the application:**
- Open browser and go to: **http://localhost:3000**

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

**Expected Output:**
```
▲ Next.js 16.2.3
- Local:         http://localhost:3000

✓ Ready in 500ms
```

---

## Testing

### Run All Tests

```bash
# Run test suite
npm test
```

**Expected Output:**
```
Test Suites: 11 total
Tests:       150 total
Time:        2.5s

✓ All tests passed
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

---

## Default Credentials

### Admin Account

```
URL:      http://localhost:3000/login
Username: admin
Password: admin123
Role:     ADMIN
```

**Admin Capabilities:**
- View all students
- View all teachers
- Monitor system activity
- Access admin dashboard

### Teacher Accounts

All teachers have the password: `teacher123`

**School of Computer Science and Engineering:**
```
Username: socset1
Password: teacher123
```

**School of Business:**
```
Username: sobt1
Password: teacher123
```

**Full list of teacher usernames:**
- `solast1`, `solast2` (Liberal Arts)
- `sdit1`, `sdit2` (Design & Innovation)
- `sobt1`, `sobt2` (Business)
- `soeppt1`, `soeppt2` (Economics)
- `socset1`, `socset2` (Computer Science)
- `solt1`, `solt2` (Law)
- `sofmcat1`, `sofmcat2` (Film & Media)
- `scepst1`, `scepst2` (Continuing Education)
- `soahpt1`, `soahpt2` (Healthcare)

### Student Registration

Students must register at: **http://localhost:3000/signup**

**Registration Process:**
1. Fill in name, email, phone (optional)
2. Select schools and programs
3. System auto-generates username and password
4. **Save credentials** (shown only once!)
5. Login immediately with generated credentials

---

## Tools, Technologies & Environment

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.3 | React framework with SSR |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.2.3 | RESTful API endpoints |
| **Prisma** | 6.0.0 | Database ORM |
| **SQLite** | 3.x | Embedded database |
| **NextAuth.js** | 5.0.0-beta.31 | Authentication |
| **bcrypt** | 6.0.0 | Password hashing |

### Testing & Development

| Technology | Version | Purpose |
|------------|---------|---------|
| **Jest** | 30.3.0 | Testing framework |
| **ts-jest** | 29.4.9 | TypeScript support for Jest |
| **ESLint** | 9.x | Code linting |

### Runtime Environment

| Component | Version | Notes |
|-----------|---------|-------|
| **Node.js** | 20.20.0 | LTS version |
| **npm** | 10.8.2 | Package manager |
| **Operating System** | Windows/macOS/Linux | Cross-platform |

---

## Project Structure

```
university-exam-system/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/                # Login page
│   │   ├── signup/               # Registration page
│   │   └── change-password/      # Password change page
│   ├── admin/                    # Admin dashboard
│   ├── teacher/                  # Teacher dashboard
│   ├── student/                  # Student dashboard
│   └── api/                      # API routes
│       ├── auth/                 # NextAuth endpoints
│       ├── register/             # Student registration
│       ├── admin/                # Admin APIs
│       ├── teacher/              # Teacher APIs
│       └── student/              # Student APIs
├── components/                   # React components
│   ├── admin/                    # Admin components
│   ├── teacher/                  # Teacher components
│   ├── student/                  # Student components
│   └── auth/                     # Auth components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client
│   └── utils/                    # Helper functions
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   ├── seed.ts                   # Seed script
│   └── dev.db                    # SQLite database file
├── public/                       # Static assets
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.ts                # Next.js config
```

---

## Configuration Files

### 1. `.env` (Environment Variables)

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. `package.json` (Dependencies)

```json
{
  "name": "university-exam-system",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest"
  },
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "prisma": "^6.0.0",
    "next-auth": "^5.0.0-beta.31",
    "bcrypt": "^6.0.0"
  }
}
```

### 3. `prisma/schema.prisma` (Database Schema)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  username        String   @unique
  password        String
  phone           String?
  role            String
  status          String   @default("PENDING")
  isFirstLogin    Boolean  @default(true)
  selectedSchools String?
  assignedSchool  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ... other models
```

---

## Troubleshooting

### Issue 1: Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue 2: Database Connection Error

**Error:**
```
PrismaClientInitializationError: Can't reach database server
```

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset --force

# Reseed database
npx prisma db seed
```

### Issue 3: Module Not Found

**Error:**
```
Module not found: Can't resolve '@/lib/auth'
```

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or on Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue 4: NextAuth Configuration Error

**Error:**
```
[auth][error] Configuration error
```

**Solution:**
```bash
# Ensure NEXTAUTH_SECRET is set in .env
# Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
NEXTAUTH_SECRET="<generated-secret>"
```

---

## Production Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - NEXTAUTH_URL: https://your-domain.vercel.app
# - NEXTAUTH_SECRET: <your-secret>
# - DATABASE_URL: <production-database-url>
```

### Option 2: Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and Run:**
```bash
# Build image
docker build -t university-exam-system .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-secret" \
  university-exam-system
```

### Option 3: Traditional Server

```bash
# On the server
git clone <repository-url>
cd university-exam-system

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with production values

# Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Build application
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "exam-system" -- start
pm2 save
pm2 startup
```

---

## Database Migration (SQLite to PostgreSQL)

For production, consider migrating to PostgreSQL:

### 1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Update `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/exam_system"
```

### 3. Run migrations:

```bash
npx prisma migrate dev
npx prisma db seed
```

---

## Security Checklist

Before deploying to production:

- [ ] Change `NEXTAUTH_SECRET` to a strong random value
- [ ] Change default admin password
- [ ] Change default teacher passwords
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Review and update security headers
- [ ] Implement proper error handling (don't expose stack traces)

---

## Support & Contact

For issues or questions:
- **Email:** admissions@rvu.edu.in
- **Documentation:** See README.md
- **Issue Tracker:** <repository-issues-url>

---

## License

This project is proprietary software developed for RV University.

---

## Appendix: Quick Start Checklist

- [ ] Install Node.js 20.x
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate deploy`
- [ ] Run `npx prisma db seed`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Login with admin/admin123
- [ ] Test student registration

**Estimated Setup Time:** 10-15 minutes

---

**Last Updated:** April 2026  
**Version:** 1.0.0
