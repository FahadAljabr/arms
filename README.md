# 🚀 ARMS - Asset Readiness Management System

**Senior Project - Information Systems Department**  
**Prince Sultan University**

A comprehensive digital maintenance tracking system prototype for military and security vehicles and weapons, built with modern web technologies as a senior capstone project.

## 📋 Project Overview

**ARMS (Asset Readiness Management System)** is a full-stack web application prototype developed as an academic demonstration of modern software development practices. This senior project showcases how traditional paper-based maintenance logs can be replaced with a modern, efficient digital solution.

**🎓 Academic Context:**

- **University:** Prince Sultan University
- **Department:** Information Systems
- **Project Type:** Senior Capstone Project
- **Purpose:** Prototype demonstration of enterprise-level maintenance management system

**💡 Concept Demonstration:**
This project serves as a proof-of-concept for digital transformation in maintenance management, demonstrating real-world application of learned technologies and methodologies. The system provides real-time tracking, scheduling, and management of vehicle and weapon maintenance across different security sectors (Police, Traffic Police, Military Police).

### 🎯 Key Features

- **Digital Asset Registry** - Complete vehicle and weapon inventory management
- **Maintenance Tracking** - Log, schedule, and monitor maintenance activities
- **Real-time Dashboard** - Live statistics and maintenance alerts
- **Role-based Access Control** - Secure authentication with WorkOS integration
- **Dark/Light Mode** - Modern UI with theme switching
- **Mobile Responsive** - Optimized for field technicians on mobile devices
- **QR Code Integration** - Quick asset identification and access (Coming Soon)
- **AI-Powered Analytics** - Predictive maintenance and intelligent reporting (Coming Soon)

## 🛠️ Tech Stack

### **Frontend**

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with modern features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Modern utility-first CSS framework
- **[Shadcn UI](https://ui.shadcn.com/)** - High-quality component library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark/light mode support
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### **Backend**

- **[tRPC](https://trpc.io/)** - End-to-end type-safe APIs
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM for database operations
- **[NeonDB](https://neon.tech/)** - Serverless PostgreSQL database (Coming Soon)
- **[WorkOS](https://workos.com/)** - Enterprise authentication and user management

### **Development & Deployment**

- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform

### **Future Integrations**

- **[Google Gemini API](https://ai.google.dev/)** - AI-powered maintenance analysis (MVP 3)
- **[QR Code Libraries](https://github.com/soldair/node-qrcode)** - Asset identification system (MVP 2)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/FahadAljabr/arms.git
   cd arms
   ```

2. **Enable pnpm and install dependencies**

   ```bash
   corepack enable pnpm
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Configure your WorkOS and database credentials
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard page
│   ├── maintenance/             # Maintenance tracking page
│   ├── vehicles/                # Vehicle management page
│   ├── weapons/                 # Weapon management page
│   ├── login/                   # Authentication routes
│   ├── callback/                # WorkOS callback handling
│   └── layout.tsx               # Global layout with navigation
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── main-navigation.tsx      # Global navigation component
│   ├── theme-provider.tsx       # Dark mode theme provider
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── server/
│   ├── api/                     # tRPC API configuration
│   └── db/                      # Database schema and connection
├── styles/
│   └── globals.css              # Global styles with Tailwind CSS
└── trpc/                        # tRPC client configuration
```

## 🎯 Development Roadmap

### **MVP 1: Basic Digital Logbook** ✅ _UI Complete - Backend In Progress_

- ✅ Asset registration (vehicles/weapons)
- ✅ Maintenance record logging interface
- ✅ Historical record viewing
- ✅ Role-based authentication (WorkOS)
- 🟡 Database integration (NeonDB setup pending)
- 🟡 Backend CRUD operations (in progress)

### **MVP 2: Proactive Operations Center** 🟡 _Planned_

- Real-time dashboard with statistics
- Preventive maintenance scheduling
- Parts inventory management
- QR code generation for assets
- Mobile-optimized interface

### **MVP 3: Intelligent Readiness System** 🔴 _Future_

- AI-powered predictive maintenance
- Intelligent report analysis with Gemini AI
- Risk scoring and recommendations
- Natural language query interface

## 🔐 Authentication & Security

- **WorkOS Integration** - Enterprise-grade authentication
- **Role-based Access Control** - Maintenance Technicians vs Responsible Officers
- **Secure Session Management** - JWT tokens with proper expiration
- **Audit Trail Logging** - Complete activity tracking (Coming Soon)

## 🎨 UI/UX Features

- **Modern Design System** - Clean, professional interface
- **Dark/Light Mode** - User preference-based theming
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Accessibility** - WCAG compliant components
- **Interactive Components** - Rich forms, tables, and data visualization

## 📱 Mobile-First Approach

The system is designed with field technicians in mind:

- Touch-friendly interface for mobile devices
- QR code scanning capabilities (coming soon)
- Offline-capable data entry (future enhancement)
- Quick access to asset information

## 🤝 Contributing

This project follows modern development practices:

1. **Code Quality** - TypeScript strict mode, ESLint, Prettier
2. **Component Architecture** - Reusable Shadcn UI components
3. **Type Safety** - End-to-end type safety with tRPC
4. **Modern React Patterns** - Server Components, Suspense, Error Boundaries

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm typecheck        # TypeScript type checking
pnpm format:check     # Check Prettier formatting
pnpm format:write     # Apply Prettier formatting

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio
```

## 🌟 Key Technical Decisions

- **Next.js App Router** - Modern React architecture with server components
- **Shadcn UI** - Consistent, accessible component library
- **tRPC** - Type-safe API development without code generation
- **Drizzle ORM** - Lightweight, type-safe database operations
- **WorkOS** - Enterprise authentication without custom user management
- **Tailwind CSS v4** - Latest utility-first CSS framework

## 📄 License

**Open Source License (Copyleft)**

This project is released under an open source copyleft license. You are free to:

- ✅ Use this software for any purpose
- ✅ Study and modify the source code
- ✅ Distribute copies of the software
- ✅ Distribute modified versions

**⚠️ Copyleft Requirement:** If you use this software in your own projects, you must also make your project open source under the same license terms. This ensures that improvements and modifications remain available to the community.

## 🎓 Academic Project

This is a **senior capstone project** from Prince Sultan University's Information Systems program, designed to demonstrate:

- Modern full-stack web development practices
- Enterprise software architecture patterns
- Real-world problem-solving through technology
- Integration of multiple modern technologies and APIs

## 📞 Support & Contact

**Student Developer:** Fahad Aljabr
**Institution:** Prince Sultan University - Department of Computer & Information Sciences

For academic inquiries or technical questions about this prototype, please contact through university channels.

---

**Built with ❤️ at Prince Sultan University using the T3 Stack and modern web technologies**
