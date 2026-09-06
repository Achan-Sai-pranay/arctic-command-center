# 🏔️ Arctic Command Center - 2D Digital Twin Dashboard

A modern, high-tech **2D Interactive Digital Twin Dashboard** for remote monitoring and management of Indian Antarctic Research Stations (**Bharati Station & Maitri Station**) built for the **Ministry of Earth Sciences (MoES)** and **NCPOR (National Centre for Polar and Ocean Research)**.

---

## 🛠️ Technology Stack

| Category | Technologies / Libraries |
| :--- | :--- |
| **Framework & Server** | [TanStack Start](https://tanstack.com/router/latest/docs/framework/react/overview) (SSR/CSR React Framework), [Nitro Engine](https://nitro.build/), [Vite 8](https://vitejs.dev/) |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) |
| **UI Library & Components** | [React 19](https://react.dev/), [Radix UI Primitives](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/), `tw-animate-css`, `class-variance-authority` (`cva`), `clsx`, `tailwind-merge` |
| **State Management & Querying** | [TanStack React Query v5](https://tanstack.com/query/latest), [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/) |
| **Data Visualization & Canvas** | [Recharts](https://recharts.org/) (24-hour telemetry trend line charts), Interactive SVG Overlay Blueprint Canvas (Zoom, Pan, Zone Mapping) |
| **Code Quality & Tooling** | ESLint 9, Prettier, Lovable connected integration |

---

## 🎨 Design & Palette System (MoES Government Light Theme)

The application adheres to the official MoES / NIC light theme palette:

* **Primary Navy Header**: `#002A54` *(Deep Navy for Navbar & MoES Branding)*
* **Sub-Header / Brand Accent**: `#1E40AF` *(Royal Navy Blue for active controls & buttons)*
* **National Accent / Gold**: `#D97706` / `#FF9933` *(Saffron Gold for alerts & badge highlights)*
* **Canvas & Card Surface**: `#F4F6F9` *(Off-white background)* / `#FFFFFF` *(Pure white panel cards)*
* **Operational Telemetry Statuses**:
  * 🟢 **Normal / Operational**: `#15803D` *(Forest Green)*
  * 🟡 **Caution / Warning**: `#D97706` *(Amber Saffron)*
  * 🔴 **Critical Alert**: `#DC2626` *(National Red)*
  * 🔵 **Active Zone Selected**: `#0284C7` *(Ocean Blue)*

---

## 🚀 Key Features & Implementation Highlights

### 1. 🌐 Top Navigation & Live Telemetry Header
* **Station Switcher**: Toggle between **Bharati Station** (Larsemann Hills, 69°24'S) and **Maitri Station** (Schirmacher Oasis, 70°45'S).
* **Live Weather Ticker**: Real-time outdoor ambient temperature (-28°C), SW wind speed (42 knots), and solar radiation telemetry.
* **Dual Time Clock & Link Status**: Real-time UTC/IST dual clocks, satellite connection bandwidth & latency monitor (`VSAT-1 ONLINE | 15.4 Mbps | 640ms`), and emergency alert notification counter.

### 2. 🎛️ Left Control & Navigation Panel
* **View Mode Switcher**:
  * *Top-Down Floor Plan* (Interactive 2D Blueprint view)
  * *Vertical Cross-Section* (Side-cut elevation stack)
  * *Subsystem Grid Matrix*
* **Level Selector**: Level 1 (Technical & Utility), Level 2 (Living & Command), Level 3 (Terrace & Observatory).
* **Subsystem Filter Toggles**: Interactive filtering for Power & CHP Generators, HVAC & Heating, Fire & Safety, Crew Occupancy, and Water & Desalination.

### 3. 🗺️ Interactive 2D Digital Twin Blueprint Canvas
* **High-Resolution CAD Overlays**: Floor plans (Level 2 Living & Command) and Vertical Cross-Sections (Longitudinal & Transverse side cuts).
* **Smooth Pan & Zoom Engine**: Interactive zoom in, zoom out, reset view controls, and dragging.
* **Interactive SVG Room Layers**: Clickable SVG zones for Dining Hall, Kitchen & Pantry, Multipurpose Hall, Electrical/HVAC Room, Recreation Area, and Residential Cabins (Rooms 1–34).
* **Dynamic Pulsing & Hover Tooltips**: Rooms pulse color according to live sensor health with instant hover tooltips showing ambient metrics.

### 4. 📊 Right Room Inspector & Telemetry Panel
* **Live Sensor Gauges**: Temperature (°C) target sliders, Airflow (CFM), CO2/Smoke (PPM), Power (kW), and Occupancy lists.
* **24-Hour Historical Trend Charts**: Powered by Recharts for real-time temperature and power consumption history.
* **Remote Override Actions**: Heating override (+1°C), Exhaust Fan toggle, Door Lock/Unlock, and Alarm Silencing triggers.

### 5. 📜 Bottom Real-Time Event Log Console
* **Stream of Telemetry Logs**: Filterable live stream of events, warnings, and system sync notifications stamped with UTC timestamps.
* **Simulated Telemetry Engine**: Powered by `twin-data.ts` to stream live updates every 3 seconds across all room sensors and station subsystems.

---

## 💻 Local Development Setup

### Prerequisites
* Node.js (v18+ recommended)
* npm or pnpm

### Running the App
```bash
# Clone the repository
git clone https://github.com/Achan-Sai-pranay/arctic-command-center.git
cd arctic-command-center

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Building for Production
```bash
# Verify TypeScript & build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🤝 Lovable Integration
This repository is connected with [Lovable](https://lovable.dev). Commits pushed to `main` automatically synchronize back to the Lovable editor.
