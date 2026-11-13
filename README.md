<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-00d27a?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack"/>
  <img src="https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18"/>
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-Optimized-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Zero--Login-Frictionless-d4ff24?style=for-the-badge" alt="Zero-Login"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">⚡ Smart Attendance Calculator</h1>

<p align="center">
  <strong>ERP-Synced Attendance Intelligence, Exam Eligibility Forecaster & Recovery Planning Engine</strong><br/>
  <em>Built with the MERN Stack • High-Contrast Circular Radial HUD Design System • Zero Authentication Barrier</em>
</p>

---

## 🎯 Executive Overview & Real-World Impact

Across higher education institutions globally, over 25 million undergraduate and graduate students operate under mandatory attendance policies (commonly 75% to 85%) required to sit for final semester examinations. 

Legacy university ERP systems provide static, historical tabular data. They show raw numbers, but **fail to answer critical operational questions** that students confront weekly:
- *"I am at 65% in Operating Systems — exactly how many consecutive lectures must I attend without absence to become exam-eligible?"*
- *"Can I take leave tomorrow for a hackathon or medical emergency without dropping below 75%?"*
- *"How do 2-hour practical labs affect my aggregate compared to 1-hour theory lectures?"*

**Smart Attendance Calculator** bridges this gap. It transforms raw, fragmented institutional records into actionable, predictive intelligence through real-time mathematical simulation, instant 1-click clipboard parsing, and automated recovery scheduling — **with zero login friction and complete user privacy.**

---

## ✨ Core Engineering Features & Real-World Use Cases

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SMART ATTENDANCE CALCULATOR                       │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  ⚡ Zero-Login   │  📋 1-Click ERP  │  🎯 Recovery     │  🔮 What-If   │
│  Instant Access  │  Clipboard Parser│  Action Planner  │  Simulator    │
│  Private Storage │  Auto Theory/Lab │  Shortage Solver │  Risk Model   │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### 1. ⚡ Frictionless, Zero-Login Architecture
- **Instant Usability**: No registration walls, passwords, or personal credentials required. Users can open the URL and immediately access all features.
- **Privacy-First Data Isolation**: Data is stored securely and privately in browser `LocalStorage` with an optional offline-first mode, ensuring no personal tracking or academic credential exposure.

### 2. 📋 1-Click ERP Clipboard Ingestion Engine
- **Zero Manual Data Entry**: University students typically track 10 to 14 subjects per semester. Manual input is tedious and error-prone.
- **Intelligent Delimiter Parsing**: Students simply copy the raw table from any university student portal (`Ctrl+A`, `Ctrl+C`) and paste it into the parser.
- **Automated Theory vs. Lab Separation**: Automatically detects and separates **Theory Lectures** (1-hour weight) from **Practical Labs** (2-hour weight) via regex heuristic classification.

### 3. 🎯 Attendance Recovery Planner & Shortage Solver
- **Closed-Form Mathematical Solution**: Uses closed-form linear inequalities rather than brute force to compute the minimal consecutive sessions required to cross threshold:
  $$\text{Hours Needed} = \left\lceil \frac{\text{Target} \times T - A}{1 - \text{Target}} \right\rceil$$
- **Actionable Roadmap**: Generates explicit guidance (e.g., *"Attend next 16 consecutive lectures (16h) to reach 75.00%"*), allowing students to triage attendance deficits strategically.

### 4. 🔮 Interactive What-If Scenario Simulator
- **Dynamic Impact Forecasting**: Allows students to simulate hypothetical attendance decisions before making them.
- **Proactive Risk Management**: Test the effect of upcoming absences, sick leaves, medical leaves, or makeup classes on overall aggregate and subject-specific compliance.

### 5. 🎨 High-Contrast Circular Radial HUD Design System
- **Ergonomic Data Density**: Designed with a high-contrast dark cyberpunk HUD theme (`#030407` Midnight Black, `#1558C9` Electric Cobalt, `#D4FF24` Acid Lime).
- **SVG Radial Progress Meters**: Replaces boring rectangular progress bars with custom SVG circular gauges that dynamically render stroke offsets and risk color indicators (lime for safe, neon red for shortage).

---

## 🏗️ Technical Architecture & Stack

```
smart-attendance-calculator/
├── attendify-mern/
│   ├── client/                      # React 18 Single Page Application
│   │   ├── src/
│   │   │   ├── components/          # Radial gauges, HUD cards, navbar
│   │   │   ├── pages/               # Dashboard, ERPParser, RecoveryMode, WhatIf
│   │   │   ├── utils/               # erpEngine.js (Attendance math & parser)
│   │   │   └── api/                 # Axios configuration
│   │   └── vite.config.js           # Vite build pipeline
│   │
│   └── server/                      # Node.js + Express REST API
│       ├── models/                  # Mongoose schemas (User, Subject)
│       ├── routes/                  # Express RESTful endpoints
│       ├── middleware/              # Zero-login guest session & auth
│       └── tests/                   # Jest mathematical validation suite
```

| Layer | Technologies | Architectural Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Lucide Icons | Responsive SPA with reactive state and instant client-side rendering |
| **Styling** | Custom CSS3 Design System, SVG Radial Math | Zero-dependency high-contrast HUD optimized for rapid data visualization |
| **Backend** | Node.js, Express.js, Mongoose ODM | REST API with bulk import upserts and curriculum analytics |
| **Database** | MongoDB / MongoDB Atlas | Scalable document storage with compound indices `(userId, code)` |
| **Testing** | Jest | Mathematical unit testing verifying 34 edge cases and convergence formulas |

---

## 📊 Mathematical Precision & Test Verification

The core calculation engine is rigorously verified against standard university ERP rules via automated Jest tests:

```bash
PASS tests/ralphLoop.test.js
  Attendify Math Engine
    Ralph Loop: Percentage calculation matches ERP standards for all 12 subjects
      ✓ CRT: A=66, T=82 → 80.49% (2 ms)
      ✓ CS501: A=27, T=41 → 65.85%
      ✓ CS502: A=33, T=42 → 78.57%
      ✓ CS503: A=26, T=40 → 65%
      ✓ CS504: A=25, T=27 → 92.59%
      ✓ CS511: A=35, T=40 → 87.5%
      ✓ CS520: A=20, T=28 → 71.43%
      ✓ CS521: A=12, T=28 → 42.86%
      ✓ CS522: A=20, T=26 → 76.92%
      ✓ CS523: A=22, T=28 → 78.57%
      ✓ CS530: A=12, T=14 → 85.71%
      ✓ HU560: A=25, T=40 → 62.5%
    Hours needed calculation for shortage subjects
      ✓ CS501: hoursNeeded = 15
      ✓ CS503: hoursNeeded = 16
      ✓ CS520: hoursNeeded = 4
      ✓ CS521: hoursNeeded = 36
      ✓ HU560: hoursNeeded = 20
    Safe skip calculation for safe subjects
      ✓ CRT: 6 safe-skip hours → 3 lab sessions
      ✓ CS504: 6 safe-skip hours → 6 lecture sessions
      ✓ CS511: 6 safe-skip hours → 6 lecture sessions
      ✓ CS502: safe-skip hours for 78.57% subject
      ✓ Shortage subject returns 0 safe skips
    T=0 edge case returns 0% not NaN
      ✓ zero totalConducted returns 0% percentage
      ✓ hoursNeeded returns 0 when T=0
      ✓ safeSkips returns 0 when T=0
    Target criteria clamping between 50 and 95
      ✓ target at exactly 50 (lower bound) should be valid
      ✓ target at exactly 95 (upper bound) should be valid
      ✓ target at 75 (default) works correctly
      ✓ sessionsNeeded accounts for stepWeight correctly
    Ralph Loop converges for all shortage subjects
      ✓ there are exactly 5 shortage subjects
      ✓ all shortage subjects converge to >= 75% within 52 weeks
      ✓ Ralph Loop returns 0 weeks for subjects already at/above target
    Aggregate totals across all 12 subjects
      ✓ sum of attended and totalConducted, and overall percentage
      ✓ subject count is 12

Test Suites: 1 passed, 1 total
Tests:       34 passed, 34 total
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/dev1hardik/smart-attendance-calculator.git
cd smart-attendance-calculator
```

### 2. Launch Client (Instant Zero-Login Mode)
```bash
cd attendify-mern/client
npm install
npm run dev
```
Open **`http://localhost:5175/`** in your browser. All features work immediately out-of-the-box using local storage.

### 3. (Optional) Run Full-Stack Mode with Backend API
```bash
# In attendify-mern/server
cd attendify-mern/server
npm install
npm run dev

# Run unit tests
npm test
```

---

## 👨‍💻 Author & Maintainer

Developed by **Hardik Singhal**  
- **GitHub**: [@dev1hardik](https://github.com/dev1hardik)  
- **Project Repository**: [smart-attendance-calculator](https://github.com/dev1hardik/smart-attendance-calculator)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
