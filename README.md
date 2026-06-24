# ?? Kisan-AgriPulse (??????-??????????)
> **One Unified AI Hub For India's Farmers** — Designed for rural connectivity, eliminating app fatigue by combining land registries, weather alerts, and predictive market intelligence into a single interface.

## ?? Key Features Built-in
- ?? **AgriStack & MeeBhoomi Integration:** Real-time state land registry sync (Adangal & 1B Records).
- ?? **Kisan AI Mitra:** A multilingual (Telugu, Hindi, English) voice-ready LLM copilot for tenant legalities (CCRC) and crop diagnostics.
- ?? **Predictive MSP Rate Watch:** Live indicators mapped with e-NAM, central procurement portals, and regional Mandis.
- ? **Optimized for Rural Use:** Low-bandwidth operational layout with 45% dark ambient active mode for field visibility.

## ?? Project Structure
- `src/components/` - Interactive dashboards like `FarmerIdentityCard.tsx` and `LiveWallpaperCard.tsx`.
- `server.ts` - Backend service integrating database crawls and state registry logic.
- `metadata.json` - Configuration and state definitions for the unified interface.

## ?? Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **AI/Data:** Conversational Agentic API, IMD Weather Feed Integration

## ??? How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd kisan-agripulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file based on `.env.example`.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
