# 🚛 CargaSafe - IoT Cargo Monitoring Platform

[![Angular](https://img.shields.io/badge/Angular-20.3.3-DD0031?style=flat&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Real-time cold chain monitoring system for cargo transportation built with Angular 20 and Domain-Driven Design architecture. Tracks vehicle fleets, monitors sensor data (temperature, movement, humidity), and manages alerts to ensure cargo integrity during transit.

---

## 📋 Table of Contents

- [Purpose](#-purpose)
- [Technologies](#-technologies)
- [Technical Features](#-technical-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Responsive Breakpoints](#-responsive-breakpoints)
- [Internationalization (i18n)](#-internationalization-i18n)

---

## 🎯 Purpose

CargaSafe is an enterprise-grade web application designed to monitor and manage refrigerated cargo transportation through IoT sensors. The platform enables logistics companies to:

- **Monitor cargo conditions** in real-time (temperature, humidity, movement)
- **Track fleet vehicles** and their associated IoT devices
- **Manage alerts** for temperature violations, excessive vibrations, and door openings
- **Analyze incidents** through interactive dashboards and monthly reports
- **Manage subscriptions** with tiered pricing plans for scalability

---

## 🛠️ Technologies

### **Core Framework**
- **Angular 20.3.3** - Standalone Components Architecture
- **TypeScript 5.6** - Type-safe development
- **RxJS 7.8** - Reactive programming

### **UI/UX**
- **Angular Material 18** - Material Design components
- **NGX Charts 20** - Data visualization and charting
- **CSS3** - Custom responsive styling

### **Architecture & Patterns**
- **Domain-Driven Design (DDD)** - Tactical patterns implementation
- **Clean Architecture** - Layered separation of concerns
- **Repository Pattern** - Data access abstraction
- **SOLID Principles** - Maintainable and scalable codebase

### **Development Tools**
- **JSON Server** - Mock REST API for development
- **ESBuild** - Fast bundling and build optimization
- **Jasmine/Karma** - Unit testing framework

---

## ⚡ Technical Features

### **Architecture Highlights**
- ✅ **Domain-Driven Design** with bounded contexts (Dashboard, Fleet, Alerts, Subscriptions)
- ✅ **Rich Domain Models** with business logic encapsulation
- ✅ **Aggregate Roots** for transactional consistency
- ✅ **Value Objects** for immutable domain concepts
- ✅ **Use Cases** for application orchestration
- ✅ **Repository Interfaces** with HTTP implementations

### **Application Features**
- 📊 **Real-time Dashboard** with KPI metrics and incident charts
- 🚛 **Fleet Management** (vehicles and IoT devices CRUD)
- 🚨 **Alert System** with filtering, sorting, and resolution workflows
- 📈 **Analytics** with monthly incident reports and data visualization
- 💳 **Subscription Management** with multiple pricing tiers
- 🔐 **Authentication** with login, registration, and password recovery

### **Code Quality**
- 🧩 **Standalone Components** (Angular 20 modern approach)
- 🎨 **Reactive Forms** with validation
- 🔄 **Observable-based** state management
- 📦 **Lazy Loading** for optimized bundle size
- 🧪 **Unit Tests** with Jasmine/Karma

---

## 📁 Project Structure

```
carga-safe/
├── src/
│   ├── app/
│   │   ├── dashboard/                 # Dashboard Bounded Context
│   │   │   ├── domain/
│   │   │   │   └── entities/         # Domain entities (Trip, Alert)
│   │   │   ├── application/
│   │   │   │   └── services/         # Use cases and orchestration
│   │   │   ├── infrastructure/       # (To be implemented: HTTP repos)
│   │   │   └── presentation/
│   │   │       ├── pages/            # Routed pages (dashboard, trip-detail)
│   │   │       └── components/       # Reusable UI components
│   │   │
│   │   ├── fleet/                     # Fleet Management Bounded Context
│   │   │   └── presentation/
│   │   │       ├── pages/            # Vehicle/Device management
│   │   │       └── components/       # Forms and tables
│   │   │
│   │   ├── alerts/                    # Alerts Bounded Context
│   │   │   └── presentation/
│   │   │       ├── pages/            # Alerts page
│   │   │       └── components/       # Alert table
│   │   │
│   │   ├── subscription/              # Subscription Bounded Context
│   │   ├── iam/                       # Identity & Access Management
│   │   └── shared/
│   │       ├── domain/               # Shared domain concepts
│   │       ├── infrastructure/       # Base API services
│   │       └── presentation/         # Layout and shared components
│   │
│   ├── assets/                        # Static resources
│   │   ├── i18n/                     # Translation files (future)
│   │   ├── icons/                    # SVG icons
│   │   └── images/                   # Images
│   │
│   └── environment/                   # Environment configurations
│
├── server/
│   └── db.json                       # JSON Server mock database
│
└── public/                            # Public assets
```

---

## 🚀 Installation

### **Prerequisites**
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Angular CLI** (optional, for global commands)

### **Clone the Repository**
```bash
git clone https://github.com/Los-Parkers-IoT/iot-solutions-development-cargasafe-frontend.git
cd iot-solutions-development-cargasafe-frontend/carga-safe
```

### **Install Dependencies**
```bash
npm install
```

---

## ▶️ Running the Application

### **1. Start the Mock API Server**
```bash
npm run db:server
```
- Runs on `http://localhost:3000`
- Provides REST endpoints for trips, alerts, vehicles, devices, etc.

### **2. Start the Development Server**
```bash
npm start
```
- Runs on `http://localhost:4200`
- Auto-reloads on file changes

### **3. Access the Application**
Open your browser and navigate to:
```
http://localhost:4200
```

**Default Login Credentials:**
- Email: `admin@mail.com`
- Password: `admin`

---

## 📱 Responsive Breakpoints

The application is fully responsive and adapts to the following breakpoints:

| Breakpoint | Width | Target Devices |
|------------|-------|----------------|
| **Mobile** | < 768px | Smartphones |
| **Tablet** | 768px - 1024px | Tablets, small laptops |
| **Desktop** | > 1024px | Desktops, large screens |

### **Responsive Features**
- ✅ Collapsible sidebar navigation on mobile
- ✅ Adaptive grid layouts for cards and tables
- ✅ Touch-friendly UI components
- ✅ Optimized chart rendering for small screens

---

## 🌐 Internationalization (i18n)

### **Current Status**
The application is currently **available in English only**.

### **Future Support**
The project structure includes an `assets/i18n/` directory prepared for multi-language support using:
- **@ngx-translate/core** (to be integrated)
- Planned languages: English (en), Spanish (es)

### **Translation Structure** (Planned)
```
assets/i18n/
├── en.json    # English translations
└── es.json    # Spanish translations
```

To enable i18n in the future, install the required package:
```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (port 4200) |
| `npm run db:server` | Start JSON Server mock API (port 3000) |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run watch` | Build in watch mode |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                      │
│  (Pages, Components, View Models)                   │
└───────────────────┬─────────────────────────────────┘
                    │ Uses
                    ▼
┌─────────────────────────────────────────────────────┐
│                  APPLICATION                        │
│  (Use Cases, DTOs, Orchestration)                   │
└───────────────────┬─────────────────────────────────┘
                    │ Uses
                    ▼
┌─────────────────────────────────────────────────────┐
│                    DOMAIN                           │
│  (Entities, Value Objects, Domain Services)         │
└───────────────────┬─────────────────────────────────┘
                    │ Implemented by
                    ▼
┌─────────────────────────────────────────────────────┐
│                INFRASTRUCTURE                       │
│  (HTTP Repositories, Mappers, External APIs)        │
└─────────────────────────────────────────────────────┘
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Team

**Los Parkers IoT** - Development Team

---

**Made with ❤️ using Angular 20 and Domain-Driven Design**
