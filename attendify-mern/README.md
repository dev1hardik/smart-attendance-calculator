<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-00d27a?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack"/>
  <img src="https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18"/>
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Zero--Login-Frictionless-d4ff24?style=for-the-badge" alt="Zero-Login"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"/>
</p>

# ⚡ Smart Attendance Calculator

> **ERP-Synced Attendance Intelligence, Exam Eligibility Forecaster & Recovery Planning Engine**  
> *Full-Stack MERN Application — High-Contrast Circular Radial HUD Design System — Zero Login Required*

A developer-built web application that solves a real operational problem university students face: **figuring out exactly how many more classes you need to attend — and which ones — before you are safely above the threshold required to sit for final semester examinations.**

---

## 🎯 Why This Exists (Real-World Use Cases)

Universities worldwide enforce a mandatory minimum attendance percentage (typically 75% to 85%) for students to qualify for final exams. Legacy student portals only display raw historical numbers, leaving crucial operational questions unanswered:

- **Am I actually at risk of debarment?** (Aggregate buffer vs. critical subject-wise shortages)
- **How many consecutive classes must I attend to recover back above the cutoff?** (Closed-form mathematical computation)
- **Can I safely take leave tomorrow for a hackathon, conference, or illness?** (What-If predictive modeling)
- **Which subjects are dragging my aggregate down the most?** (Theory vs. Lab weighted triage)

This system solves all of these scenarios in real-time — directly from clipboard-pasted university ERP data, with zero manual entry and zero login barrier.

---

## ✨ Core Feature Highlights

### 1. ⚡ Frictionless, Zero-Login Access
- **Instant Usability**: No registration walls, passwords, or personal credentials required. Open the application and begin tracking immediately.
- **Privacy-First**: Attendance records are preserved locally in browser `LocalStorage`, eliminating exposure of academic credentials.

### 2. 📋 1-Click ERP Clipboard Ingestion Engine
- **Zero Manual Typing**: Copy the raw attendance table directly from any student portal (`Ctrl+A`, `Ctrl+C`) and paste it into the parser.
- **Heuristic Separation**: Automatically categorizes courses into **Theory Lectures** (1-hour weight) and **Practical Labs** (2-hour weight) with instant regex classification.

### 3. 🎯 Attendance Recovery Planner & Shortage Solver
- Isolates every subject currently under the threshold.
- Computes the minimal consecutive sessions needed to clear compliance using the mathematical formula:
  $$\text{Hours Needed} = \left\lceil \frac{\text{Target} \times T - A}{1 - \text{Target}} \right\rceil$$
- Produces explicit guidance (e.g., *"Attend next 16 consecutive lectures (16h) to reach 75.00%"*).

### 4. 🔮 Interactive What-If Scenario Simulator
- Test hypothetical attendance decisions before making them.
- Dynamically models the impact of attending extra sessions or taking prospective leaves on both aggregate and subject-specific standing.

### 5. 🎨 High-Contrast Circular Radial HUD
- Dark cyberpunk aesthetic (`#030407` Midnight Black, `#1558C9` Electric Cobalt Blue, `#D4FF24` Acid Lime).
- Custom SVG circular radial meters replace traditional bar charts for quick visual scanning of risk status.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Axios, Lucide Icons |
| **Styling** | Custom CSS3 Circular HUD Design System |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB / MongoDB Atlas |
| **Testing** | Jest (34 Unit Tests verifying mathematical formulas & edge cases) |

---

## 🚀 Quick Start Guide

### Client Setup (Instant Zero-Login Mode)
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5175/` in your browser.

### Server Setup (Optional Backend API)
```bash
cd server
npm install
npm run dev

# Run unit tests
npm test
```

---

## 👨‍💻 Author & License
- **Lead Developer**: Hardik Singhal ([@dev1hardik](https://github.com/dev1hardik))
- **License**: MIT Open Source
