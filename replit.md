# CLAW VERSE

A persuasion-based AI game where words are bets, built on Solana.

## Project Structure

- **frontend/**: React + Vite application with Solana wallet integration
- **backend/**: Express.js API server with Socket.io for real-time updates
- **contracts/**: Solana smart contracts (Anchor framework)

## Running the Application

The project runs with two workflows:
- **Frontend**: `cd frontend && npm run dev` (port 5000)
- **Backend**: `cd backend && npm start` (port 3000)

The frontend proxies API requests to the backend via Vite's proxy configuration.

## Environment Variables

### Backend (requires configuration)
- `MONGODB_URI`: MongoDB connection string (optional - runs in demo mode without it)
- `GROQ_API_KEY`: Groq AI API key for game AI
- `GEMINI_API_KEY`: Google Gemini API key (fallback)
- `PRIZE_SEED_PHRASE`: The secret seed phrase for the game prize
- `INITIAL_JACKPOT`: Initial jackpot amount to display (default: 100)
- `MIN_ATTEMPTS`: Minimum attempts before AI can yield (default: 500)

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Solana Wallet Adapter
- **Backend**: Express.js, Socket.io, Mongoose
- **AI**: Groq, Google Gemini (via AI SDK)
- **Blockchain**: Solana, Anchor framework
