# CeylonVoyage | Sri Lanka Tourism Ecosystem

A professional tourism gateway platform for Sri Lanka, featuring interactive maps, role-based dashboards, and real-time service booking.

## Features
- **Interactive Explore Map:** Discover verified cabs, rentals, hotels, and attractions.
- **Role-Based Access:** 
  - **Tourists:** Browse, search, and book services.
  - **Providers:** List and manage tourism services.
  - **Admins:** Moderate listings, manage users, and run ad campaigns.
- **Real-time Updates:** Powered by Firebase for instant data synchronization.
- **Modern UI:** Responsive design built with Tailwind CSS and Poppins typography.

## Tech Stack
- **Frontend:** Vanilla JS + Vite
- **Styling:** Tailwind CSS (v4)
- **Map Engine:** Leaflet.js
- **Backend/DB/Auth:** Firebase (Firestore & Authentication)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Firebase configuration keys:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment
To build for production:
```bash
npm run build
```
The output will be in the `dist/` directory, ready to be hosted on GitHub Pages, Vercel, or Firebase Hosting.

## License
MIT
