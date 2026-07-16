# SkillSwap - Peer Skill-Sharing Network

SkillSwap is a MERN-stack web application designed for students to trade academic and creative skills without exchanging money. For example, a computer science student can tutor a design student in Python, and in return, receive help with UI/UX design.

---

## 🚀 Key Features

1. **Secure Authentication**: Built with JWT auth and bcrypt password hashing.
2. **Skill-Matching Algorithm**: Automatically matches you with students who teach what you want to learn, identifying **Perfect Matches** (Double Coincidence of Wants).
3. **Quick Skill Finder**: Search widget on the dashboard to find skills and click to start a chat room instantly.
4. **Real-Time Chat**: Direct instant messaging powered by WebSockets (Socket.io) with typing status indicators.
5. **Calendar & Scheduling**: Propose swap sessions, set custom date/timings, and accept/decline invites.
6. **Peer Review System**: Submit star ratings (1-5) and comments after session completion to update peer average ratings.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS v4, Socket.io-client, Lucide Icons
*   **Backend**: Node.js, Express.js, Socket.io, JSON Web Tokens (JWT), BcryptJS
*   **Database**: MongoDB, Mongoose

---

## 💻 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed and running on your system.

### Step 1: Start the Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run database mock seeding script (optional):
   ```bash
   npm run seed
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Step 2: Start the Frontend App
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the dev client:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser!
