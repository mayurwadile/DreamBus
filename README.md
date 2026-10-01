# DREAMBUS - Sleeper Bus Booking (React + Vite)

## Run locally
npm install
npm run dev        # http://localhost:5173

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. vercel.com -> Add New -> Project -> import the repo.
3. Framework: Vite (auto-detected). Build: npm run build. Output: dist. Click Deploy.
(or: npm i -g vercel && vercel --prod)

vercel.json already contains the SPA rewrite so /bus/1, /my-bookings etc. work on refresh.

## Checking the practicals
Open /practicals in the site - it links to every feature.
Flow: Register -> Login -> Home search (Mumbai -> Pune) -> View Seats -> select berths -> Pay & Confirm -> My Bookings -> Cancel (90% refund).
