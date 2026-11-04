# ⚡ SMART ATTENDENDENCE CALCULATOR

> **Institutional ERP-Synced Attendance Intelligence & Criteria Optimization System**  
> *Built with MERN Stack • High-Contrast Circular Design System*

---

## 📋 Academic Project Profile

| Field | Detail |
|---|---|
| **Student** | **Hardik Singhal** |
| **Roll Number** | **24ESKIT059** |
| **Branch / Sem** | B.Tech V Semester — Information Technology |
| **Institute** | Swami Keshvanand Institute of Technology (SKIT), Jaipur |
| **Course** | MERNSTACK (ITUL503) |
| **Faculty Coordinator** | Praveen Kumar Yadav |

---

## 🎨 Theme & Geometry Specifications
- **Theme Palette:**
  - 🌌 **Midnight Black:** `#030407` (Deep background & surfaces)
  - ⚡ **Electric Cobalt Blue:** `#1558C9` (Glows, borders, and badges)
  - 🧪 **Acid Lime:** `#D4FF24` (High-contrast criteria clears, accents, and action states)
- **Geometry:**
  - **Zero Rectangles:** Replaced traditional rectangular cards and bars with pure **Circular Radial SVG Meters**, circular stat bubbles, and pill-capsule controls (`border-radius: 9999px`).

---

## ✨ Key Capabilities

### 1. 🌐 Dual Attendance Criteria Engine
- **Aggregate Attendance Mode:** Evaluates overall institutional compliance across all combined conducted hours ($\frac{\text{Total Attended}}{\text{Total Conducted}} \ge \text{Target Criteria}$). Shows aggregate buffer/shortage hours across the entire college curriculum.
- **Subject-Wise Mode:** Enforces independent criteria compliance on every individual course.
- **Dynamic Target Criteria:** Select or toggle between **75%** (Standard), **80%** (Safe Buffer), or **85%** (Honors).

### 2. 🔬 Automatic Theory Lecture vs. Practical Lab Separation
- Automatically parses and categorizes raw institutional data into **Theory Lectures** (1h step weight) and **Practical Labs** (2h step weight).
- Independent breakdown panels showing separate lecture aggregate and lab aggregate statistics.

### 3. 📋 Real-Time ERP Clipboard Parser
- Copy raw attendance tables directly from the college student portal and paste to auto-parse, structure, and categorize all rows.

### 4. 🔮 What-If Simulator
- Interactive slider modeling to predict the mathematical impact of attending, missing, or earning makeup hours before taking decisions.

### 5. 🎯 Recovery Mode & Action Planner
- Isolates courses currently under the required threshold and computes the minimal consecutive sessions needed to clear criteria.

---

## 📊 Verified SKIT Institutional Data Points
The calculation engine has been verified against real SKIT ERP attendance records:
- **12 SKIT Courses** (CRT, ITUL501, ITUL502, ITUL503, ITUL504, ITUL511, ITUP520, ITUP521, ITUP522, ITUP523, ITUT530, MEUL560.2)
- **Institutional Aggregate:** Attended ($A$) = **323 hrs**, Conducted ($T$) = **416 hrs** $\rightarrow$ **77.64%** (Criteria Cleared).

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js ≥ 18.x
- npm ≥ 9.x

### 2. Clone & Install
```bash
git clone https://github.com/dev1hardik/smart-attendance-calculator.git
cd smart-attendance-calculator/attendify-mern/client
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5175/`** in your browser.

---

## 📄 License
This project is developed for academic evaluation under the MERN Stack curriculum at SKIT Jaipur.
