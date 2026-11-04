<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-00d27a?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack"/>
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/React-v18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"/>
</p>

# 🎯 Attendify — Smart ERP-Synced Attendance Tracker

> **AI-Verified Criteria System with SKIT ERP Formula Engine, GSD Action Mode & Ralph Loop Recovery Optimizer**

A full-stack MERN application that parses SKIT ERP attendance data from clipboard, applies the **exact institutional formula**, and provides actionable recovery plans through an intelligent shortage-detection engine.

---

## 📋 Assignment Information

| Field | Detail |
|-------|--------|
| **Student** | Hardik Singhal |
| **Roll No.** | 24ESKIT059 |
| **Program** | B.Tech V Sem — Information Technology |
| **Institute** | Swami Keshvanand Institute of Technology (SKIT), Jaipur |
| **Course** | MERNSTACK (ITUL503) |
| **Faculty** | Praveen Kumar Yadav |

---

## ✨ Features & CO Mapping

### CO3 — Frontend UI & Routing
| # | Feature | Description |
|---|---------|-------------|
| 1 | 📋 ERP Clipboard Parser | Paste raw ERP table → structured JSON in one click |
| 2 | 🎯 GSD Action Mode | Shortage-only daily checklist for focused recovery |
| 3 | 🔮 What-If Simulator | Model "attend next N classes" scenarios |
| 4 | 📊 Dashboard Analytics | Visual attendance breakdown with progress bars |

### CO4 — Backend API & Mongoose
| # | Feature | Description |
|---|---------|-------------|
| 5 | 🔐 JWT Authentication | Secure signup/login with bcrypt + JWT tokens |
| 6 | 📦 Bulk Import | `bulkWrite` upserts for efficient ERP data sync |
| 7 | 📈 Aggregation Pipeline | Server-side stats computed via MongoDB aggregation |
| 8 | 🛡️ Data Validation | Mongoose schemas with strict type enforcement |

### CO5 — Integration & Optimization
| # | Feature | Description |
|---|---------|-------------|
| 9 | ⚡ Compound Indexing | `userId + code` index for O(log n) lookups |
| 10 | 🔄 Ralph Loop Optimizer | Iterative convergence algorithm for recovery plans |
| 11 | 🤖 CodeRabbit Audit | Automated security & data integrity verification |
| 12 | 🧮 SKIT ERP Formula Engine | Exact institutional percentage formula decoded from real data |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router DOM, Axios, Tailwind CSS |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs |
| **Database** | MongoDB (Atlas / Local) |
| **DevOps** | Concurrently, Nodemon, CodeRabbit, ESLint |

---

## 📁 Project Structure

```
attendify-mern/
├── .coderabbit.yaml          # CodeRabbit security & review rules
├── .gsd/
│   └── SPEC.md               # GSD atomic execution specification
├── .gitignore
├── package.json               # Root workspace config
├── README.md
│
├── server/                    # ─── Backend (Express + MongoDB) ───
│   ├── package.json
│   ├── server.js              # Entry point: DB connect + Express boot
│   ├── config/
│   │   └── db.js              # MongoDB connection with retry logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── models/
│   │   ├── User.js            # User schema (email, password hash)
│   │   └── Subject.js         # Subject schema (compound index)
│   ├── routes/
│   │   ├── auth.js            # POST /signup, POST /login
│   │   └── subjects.js        # CRUD + bulk-sync + aggregation
│   └── .env.example           # Environment template
│
└── client/                    # ─── Frontend (React + Vite) ───
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── main.jsx           # React entry point
        ├── App.jsx            # Router + layout
        ├── api/
        │   └── axios.js       # Axios instance with interceptors
        ├── context/
        │   └── AuthContext.jsx # JWT auth state management
        ├── components/
        │   ├── Navbar.jsx
        │   ├── SubjectCard.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx
        │   ├── ERPParser.jsx
        │   ├── GSDMode.jsx
        │   └── WhatIf.jsx
        └── utils/
            ├── erpFormula.js   # SKIT ERP percentage engine
            └── ralphLoop.js    # Recovery optimizer algorithm
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** ≥ 18.x
- **MongoDB** (local) or **MongoDB Atlas** account
- **npm** ≥ 9.x

### 1. Clone & Install

```bash
git clone <repository-url>
cd attendify-mern
npm install              # Install root devDependencies (concurrently)
npm run install-all      # Install server + client dependencies
```

### 2. Configure Environment

```bash
# Create server/.env from template
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendify
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
```

### 3. Run Development

```bash
# Start both server (port 5000) and client (port 5173)
npm run dev
```

Or run individually:
```bash
npm run server    # Backend only (nodemon)
npm run client    # Frontend only (Vite)
```

### 4. Build for Production

```bash
npm run build     # Creates client/dist
```

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| `POST` | `/api/auth/signup` | `{ name, email, password }` | `{ token, user }` | ❌ |
| `POST` | `/api/auth/login` | `{ email, password }` | `{ token, user }` | ❌ |
| `GET` | `/api/auth/me` | — | `{ user }` | 🔐 |

### Subjects (Protected — requires `Authorization: Bearer <token>`)

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `GET` | `/api/subjects` | — | `[subjects]` | Get all subjects for user |
| `POST` | `/api/subjects` | `{ name, code, attended, total, targetCriteria }` | `{ subject }` | Add one subject |
| `PUT` | `/api/subjects/:id` | `{ attended?, total?, targetCriteria? }` | `{ subject }` | Update subject |
| `DELETE` | `/api/subjects/:id` | — | `{ message }` | Delete subject |
| `POST` | `/api/subjects/bulk-sync` | `{ subjects: [...] }` | `{ result }` | Bulk upsert from ERP |
| `GET` | `/api/subjects/stats` | — | `{ aggregate }` | Aggregation pipeline stats |

---

## 🧮 ERP Formula Documentation

### SKIT ERP Attendance Percentage Formula

The formula was **reverse-engineered from real SKIT ERP data** across 12 subjects:

```
percentage = floor((attended / total) * 100)
```

### Key Observations
- ERP uses **integer floor** (not rounding) for display
- `total` includes **all scheduled classes** (lectures + tutorials + labs)
- Practical/lab hours count as **1 hour per slot** (not doubled)

### Recovery Formula (Ralph Loop)

```
required = ceil((targetCriteria * total - attended * 100) / (100 - targetCriteria))
```

The Ralph Loop iteratively recalculates as `total` increments with each attended class:

```
while currentPercentage < target:
    total++
    attended++
    recalculate percentage
    increment classesNeeded
```

### Verified Aggregate Data
| Metric | Value |
|--------|-------|
| Total Attended Hours | 323 |
| Total Scheduled Hours | 416 |
| Aggregate Percentage | 77.64% |
| Subjects Tracked | 12 |

---

## 📸 Screenshots

> Screenshots will be added after UI implementation

| Screen | Description |
|--------|-------------|
| Dashboard | Main attendance overview with progress bars |
| ERP Parser | Clipboard paste → structured import |
| GSD Mode | Shortage-only recovery checklist |
| What-If | Attendance scenario simulator |
| Login/Signup | JWT authentication flow |

---

## 🔒 Security

- **Passwords**: Hashed with `bcryptjs` (12 salt rounds)
- **Authentication**: JWT tokens with configurable expiry
- **Route Protection**: Middleware validates token on every protected route
- **Input Sanitization**: Mongoose schema validation prevents injection
- **No Password Leaks**: `select('-password')` on all user queries
- **CodeRabbit Rules**: Automated PR review for security violations

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Built with 💻 by Hardik Singhal (24ESKIT059)</b><br/>
  <i>SKIT Jaipur — B.Tech IT, V Semester</i><br/>
  <i>MERNSTACK (ITUL503) — Faculty: Praveen Kumar Yadav</i>
</p>
