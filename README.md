# Arctic Command Center

Build a modern, high-tech 2D Interactive Digital Twin Dashboard for remote management of Indian Antarctic Research Stations (Bharati & Maitri) for Ministry of Earth Sciences (MoES).

🎨 Government Light Theme Color Palette

1. Primary Brand & Header Colors (NIC / MoES Deep Navy)

Header / Primary Navy: #002A54 (Deep Navy Blue - Used for Top Navbar, Header, and Primary Branding)

Sub-Header / Brand Accent: #1E40AF (Royal Navy Blue - Active tabs, primary buttons, selected room borders)

Emblem / Accent Gold: #FF9933 / #D97706 (Saffron Gold - Highlights, badge borders, notification counts)

2. Canvas & Surface Backgrounds (Clean Light Gray & White)

Main Background (App Canvas): #F4F6F9 (Off-white / Light Grey - Background behind blueprint canvas)

Card & Panel Background: #FFFFFF (Pure White - Left sidebar, right inspector panel, bottom log)

Card Border / CAD Grid Lines: #D1D5DB or #E2E8F0 (Light Slate Border - Blueprint grid lines & panel dividers)

Blueprint Overlay Mask: rgba(0, 42, 84, 0.05) (Subtle Navy Tint over CAD image)

3. Typography & Icons (High Contrast Text)

Primary Text: #0F172A (Dark Slate Charcoal - Headings, titles, room names)

Secondary Text / Labels: #475569 (Muted Slate - Coordinates, units, grid IDs)

Disabled / Inactive Text: #94A3B8 (Light Muted Gray)

4. Operational Status Colors (Official Telemetry & Room Highlights)

Normal / Operational (Green): #15803D (Forest Green - Room SVG fill: rgba(21, 128, 61, 0.15))

Caution / Warning (Amber/Saffron): #D97706 (Deep Saffron - Room SVG fill: rgba(217, 119, 6, 0.20))

Critical Alert (Red): #DC2626 (National Red - Room SVG fill: rgba(220, 38, 38, 0.25))

Active Selected Room (Cyan/Blue): #0284C7 (Ocean Blue - Room SVG fill: rgba(2, 132, 199, 0.30))

💻 Quick CSS Variables Copy-Paste Block

css

:root {

  /* Government Light Theme Palette */

  --gov-navy-header: #002a54;

  --gov-navy-primary: #1e40af;

  --gov-saffron-accent: #d97706;

  

  --gov-bg-main: #f4f6f9;

  --gov-bg-card: #ffffff;

  --gov-border: #e2e8f0;

  

  --gov-text-primary: #0f172a;

  --gov-text-secondary: #475569;

  

  /* Telemetry Status Colors */

  --gov-status-normal: #15803d;

  --gov-status-warning: #d97706;

  --gov-status-critical: #dc2626;

  --gov-status-active: #0284c7;

}

🌼 Tailwind CSS Config snippet (if using Tailwind):

javascript

theme: {

  extend: {

    colors: {

      govNavy: {

        900: '#002A54',

        700: '#1E40AF',

      },

      govBg: '#F4F6F9',

      govBorder: '#E2E8F0',

      govSaffron: '#D97706',

    }

  }

}

2:51 PMAYOUT STRUCTURE (4-PANEL DASHBOARD):

1. TOP HEADER BAR:

   - Left: MoES & NCPOR Logo, Station Switcher Dropdown [Bharati Station (Larsemann Hills) | Maitri Station (Schirmacher Oasis)].

   - Center: Live Status Ticker (e.g., "Outside Temp: -28°C | Wind: 42 knots SW | Solar Radiation: Low").

   - Right: Real-time UTC/IST Antarctic Time Clock, Satellite Connection Status Badge ("VSAT-1 ONLINE | Bandwidth: 15.4 Mbps | Latency: 640ms"), Emergency Alert Bell with badge count.

2. LEFT CONTROL & NAVIGATION SIDEBAR (Collapsible, ~250px):

   - View Mode Switcher:

     * "Floor Plan (Top-Down)" [Primary View]

     * "Vertical Cross-Section (Side Cut)" [Elevations View]

     * "Subsystem Grid Matrix"

   - Level Selector (for Bharati Station):

     * Level 3: Terrace & Observatory

     * Level 2: Living & Command Zone (Active)

     * Level 1: Technical & Utility Zone

   - Subsystem Filter Toggle Buttons:

     * [x] Power & CHP Generators

     * [x] HVAC & Heating

     * [x] Fire & Safety

     * [x] Crew Occupancy

     * [x] Water & Desalination

3. CENTER MAIN INTERACTIVE CANVAS:

   - Primary View: Displays the blueprint image overlay (Image 3: Top-Down Floor Plan of Level 2) with a smooth zoom/pan controls (Zoom In, Zoom Out, Reset Pan).

   - Interactive Room Layers: SVG overlay paths mapped over key blueprint zones:

     * Dining Hall (Grid 1-4)

     * Kitchen & Pantry (Grid 4-7)

     * Multipurpose Hall (Grid 13-17)

     * Electrical / HVAC Room (Grid 12-13)

     * Common Workspace & Recreation Room (Grid 17-21)

     * Residential Rooms 1 to 34

   - Visual Feedback: Rooms pulse green (normal), yellow (warning), or red (critical alert). Hovering over a room shows a quick tooltip with temperature, humidity, and occupancy. Clicking a room opens the Right Telemetry Panel.

   - View Toggle Switch: Option to swap background image to Image 2 (Longitudinal Section) to view the vertical 3-floor stack on stilts.

4. RIGHT ROOM INSPECTOR & TELEMETRY PANEL (320px):

   - Header: Selected Room Name (e.g., "ELECTRICAL / HVAC ROOM - Grid 12-13").

   - Live Telemetry Gauges:

     * Temperature (°C) with target threshold slider.

     * Airflow (CFM) & HVAC status.

     * Smoke/CO2 Level (PPM).

     * Power Consumption (kW).

     * Occupant count & active crew list.

   - Historical Trend Line Chart (Recharts): 24-hour temperature and energy consumption graph.

   - Remote Control Triggers: "Override Heating (+1°C)", "Toggle Exhaust Fan", "Lock/Unlock Door", "Silence Alarm".

5. BOTTOM EVENT LOG & ALARM CONSOLE (Resizable drawer):

   - Filterable stream of real-time telemetry events:

     * [02:14:10 UTC] [INFO] Level 2 Kitchen: Stove power cycle completed.

     * [02:12:05 UTC] [WARN] Level 1 Power House: CHP Genset 2 temperature threshold > 85°C.

     * [02:00:00 UTC] [SUCCESS] VSAT Telemetry packet synced to NCPOR Goa Server.

Make all components fully responsive, interactive with dummy state hooks, micro-animations, and simulated live telemetry data updating every 3 seconds.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0fb70d51-2a4b-47c9-be1e-94bb3f7a5e9f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
