# SKILLSWAP — COMPLETE SYSTEM SPECIFICATION & AI KNOWLEDGE BASE

> **AI Instruction / Context Prompt:**  
> This file contains the complete, authoritative architecture, source code map, API documentation, database schemas, real-time protocols, and business logic of the **SkillSwap** project. Any LLM analyzing this document can answer any technical question, explain implementation details, suggest code improvements, debug errors, or write extensions for the codebase without requiring external context.

---

## 1. Executive Project Overview

* **Project Name:** SkillSwap
* **Category:** Peer-to-Peer Educational Skill-Sharing & Knowledge Barter Platform
* **Architecture:** Decoupled Full-Stack Web Application (Single Page Application + REST API + WebSocket Server)
* **Core Philosophy:** Direct skill barter (Double Coincidence of Wants). Eliminates financial barriers by enabling university students to exchange tutoring hours directly (e.g., teaching Python in exchange for learning UI/UX).
* **Target Audience:** College students, self-taught developers, language learners, and academic peers.
* **Core Capabilities:**
  * Reciprocal matchmaking algorithm scoring compatibility from 0% to 100%.
  * Unique 8-digit student UID generation for search & discovery.
  * Real-time bidirectional chat with typing indicators, presence tracking, and unread badges.
  * Session scheduling calendar with automated swap hours calculation.
  * Peer review & manual rating aggregation engine.
  * Email OTP account verification via Brevo API / Nodemailer.
  * Comprehensive Admin moderation suite (warnings, forgiveness, duration-based account blocks, chat auditing).
  * Day/Night mode accessible theme toggling.

---

## 2. Technology Stack & Dependencies

### Frontend (`/frontend`)
* **Core Framework:** React.js 18.2.0 (Functional Components, Hooks)
* **Build Tool & Bundler:** Vite 5.2.0
* **Styling & Design System:** Tailwind CSS v4.0 (Custom dark theme, glassmorphism, responsive utilities)
* **Icons:** `lucide-react`
* **Real-time Client:** `socket.io-client` (v4.7.5)
* **Hosting / Deployment:** Vercel (CI/CD connected to GitHub `main` branch)

### Backend (`/backend`)
* **Runtime Environment:** Node.js (v20+)
* **Application Framework:** Express.js (v4.19.2)
* **Real-time Server:** Socket.IO (v4.7.5)
* **Database & ODM:** MongoDB Atlas + Mongoose (v8.3.1)
* **Authentication & Security:** 
  * JSON Web Tokens (`jsonwebtoken` v9.0.2)
  * Password Hashing: `bcryptjs` (v2.4.3)
  * Cross-Origin Middleware: `cors` (v2.8.5)
* **Email & Notifications:** Brevo HTTP REST API & Nodemailer (v6.9.13)
* **Hosting / Deployment:** Render Web Service (Node.js environment)

---

## 3. Project File Tree & Path Map

```text
skillswap/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection with IPv4 DNS priority
│   ├── middleware/
│   │   └── auth.js               # JWT bearer token validation & admin authorization middleware
│   ├── models/
│   │   ├── Message.js            # Chat message schema (sender, receiver, content, read)
│   │   ├── Report.js             # User report schema for admin moderation
│   │   ├── Review.js             # Peer review & star rating schema
│   │   ├── Session.js            # Swap session scheduling schema (dates, skills, status)
│   │   └── User.js               # Student profile schema with 8-digit UID auto-generation hook
│   ├── routes/
│   │   ├── admin.js              # Admin endpoints (user management, warnings, blocks, chat audits)
│   │   ├── auth.js               # Registration, login, OTP verification, /me, and profile updates
│   │   ├── chats.js              # Conversation list, message history, unread count markers
│   │   ├── reports.js            # User violation report submission
│   │   ├── reviews.js            # Peer feedback submission and rating calculation
│   │   ├── sessions.js           # Session booking requests (propose, accept, reject, complete)
│   │   └── users.js              # User directory & reciprocal matchmaking algorithm
│   ├── socket/
│   │   └── socketHandler.js      # WebSocket events (rooms, messaging, typing status, presence)
│   ├── utils/
│   │   └── sendEmail.js          # Email OTP dispatcher using Brevo API / SMTP
│   ├── .env                      # Backend environment variables
│   ├── package.json              # Backend script commands & dependencies
│   └── server.js                 # Entry point: Express server, Socket.io initialization, UID migration
│
└── frontend/
    ├── public/                   # Static assets & favicon
    ├── src/
    │   ├── components/
    │   │   ├── ReviewModal.jsx   # Interactive modal to submit peer ratings & reviews
    │   │   └── Sidebar.jsx       # Persistent navigation bar, user avatar, and 8-digit UID badge
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Global user state, JWT handling, login/register methods
    │   │   └── SocketContext.jsx # Global WebSocket instance, presence tracking, notification hooks
    │   ├── pages/
    │   │   ├── AdminPanel.jsx    # Moderation console: warnings, time blocks, chat logs, reports
    │   │   ├── Chat.jsx          # Live messaging panel, conversation sidebar, typing banners
    │   │   ├── Dashboard.jsx     # Animated statistics, Quick Skill Finder search, active swaps
    │   │   ├── Explore.jsx       # Matchmaking cards, animated compatibility score bars, filters
    │   │   ├── Landing.jsx       # Public landing page with features overview & CTA buttons
    │   │   ├── Login.jsx         # Sign-in form with validation and OTP redirect
    │   │   ├── Profile.jsx       # UID display, name editor, skills tag manager, bio, reviews
    │   │   ├── Register.jsx      # Sign-up form with skills selection
    │   │   ├── Schedule.jsx      # Calendar interface for proposing and managing swap sessions
    │   │   └── VerifyOtp.jsx     # 6-digit OTP verification screen with countdown timer
    │   ├── App.jsx               # Single Page Application router & navigation coordinator
    │   ├── index.css             # Tailwind v4 directives, animations, and dark mode tokens
    │   └── main.jsx              # React DOM root render entry point
    ├── package.json              # Frontend dependencies & Vite scripts
    └── vite.config.js            # Vite build configuration
```

---

## 4. Environment Variables Configuration

### Backend (`/backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@pratikcluster.wd2y8qi.mongodb.net/skillswap?appName=PratikCluster
JWT_SECRET=supersecretkeyreplaceinproduction
CLIENT_URL=http://localhost:5173
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@skillswap.edu
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
# In production (Vercel):
# VITE_API_URL=https://skillswap-backend-yqtr.onrender.com/api
```

---

## 5. Database Architecture & Mongoose Schemas

### 5.1. User Schema (`backend/models/User.js`)
Stores student profiles, skills, authentication metadata, and administrative moderation states.

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto | Auto | MongoDB unique document identifier |
| `uid` | `String` | No (Auto) | Auto | Unique 8-digit student ID string (e.g. `"48291038"`) |
| `name` | `String` | Yes | — | Student display name |
| `email` | `String` | Yes | — | Unique institutional or personal email address |
| `password` | `String` | Yes | — | Bcrypt hashed password (`select: false`) |
| `skillsOffered` | `[String]` | No | `[]` | Array of skills the user can teach |
| `skillsNeeded` | `[String]` | No | `[]` | Array of skills the user wants to learn |
| `bio` | `String` | No | `""` | User summary description (max 300 characters in UI) |
| `avatar` | `String` | No | `""` | Avatar image URL (generated from `ui-avatars.com`) |
| `averageRating`| `Number` | No | `0` | Aggregated peer rating average (0.0 to 5.0) |
| `reviewCount` | `Number` | No | `0` | Total number of reviews received |
| `isAdmin` | `Boolean` | No | `false`| Administrative privileges flag |
| `warnings` | `[Object]` | No | `[]` | Array of `{ reason: String, date: Date }` |
| `isBlockedUntil`| `Date` | No | `null` | Timestamp until which the account is restricted |
| `blockReason` | `String` | No | `null` | Explanation for administrative block |
| `isVerified` | `Boolean` | No | `false`| Account email verification status |
| `otp` | `String` | No | `null` | 6-digit one-time password string |
| `otpExpiry` | `Date` | No | `null` | Expiration timestamp for active OTP (10 min) |
| `createdAt` | `Date` | No | `Date.now` | Account creation timestamp |

* **Pre-Save Hook:** Generates a random, collision-free 8-digit numerical string (`Math.floor(10000000 + Math.random() * 90000000)`) if `uid` does not exist.

---

### 5.2. Session Schema (`backend/models/Session.js`)
Tracks scheduled learning sessions, proposed dates, and completion status.

| Field | Type | Reference | Description |
| :--- | :--- | :--- | :--- |
| `sender` | `ObjectId` | `User` | User who proposed the swap session |
| `receiver` | `ObjectId` | `User` | Target partner receiving the proposal |
| `offeredSkill` | `String` | — | Skill the sender will teach |
| `receivedSkill`| `String` | — | Skill the sender wants to learn from receiver |
| `sessionDate` | `Date` | — | Scheduled date and time of the swap |
| `duration` | `Number` | — | Session duration in minutes (e.g. `60`, `120`) |
| `status` | `String` | Enum | `'pending'`, `'accepted'`, `'rejected'`, `'completed'` |
| `createdAt` | `Date` | — | Creation timestamp |

---

### 5.3. Message Schema (`backend/models/Message.js`)
Stores chat messages exchanged between users.

| Field | Type | Reference | Description |
| :--- | :--- | :--- | :--- |
| `sender` | `ObjectId` | `User` | Author of the chat message |
| `receiver` | `ObjectId` | `User` | Target recipient |
| `content` | `String` | — | Text content of the message |
| `read` | `Boolean` | — | Read receipt status (defaults to `false`) |
| `createdAt` | `Date` | — | Message dispatch timestamp |

---

### 5.4. Review Schema (`backend/models/Review.js`)
Records feedback and star ratings submitted after completed sessions.

| Field | Type | Reference | Description |
| :--- | :--- | :--- | :--- |
| `reviewer` | `ObjectId` | `User` | Student writing the review |
| `reviewee` | `ObjectId` | `User` | Student receiving the rating |
| `session` | `ObjectId` | `Session` | Reference to completed swap session |
| `rating` | `Number` | — | Star rating from `1` to `5` |
| `comment` | `String` | — | Qualitative review text |
| `createdAt` | `Date` | — | Submission timestamp |

---

### 5.5. Report Schema (`backend/models/Report.js`)
Stores moderation violation reports filed by students.

| Field | Type | Reference | Description |
| :--- | :--- | :--- | :--- |
| `reporter` | `ObjectId` | `User` | User filing the complaint |
| `reportedUser` | `ObjectId` | `User` | User accused of violation |
| `reason` | `String` | — | Explanation of offensive conduct or scam |
| `status` | `String` | Enum | `'pending'`, `'reviewed'`, `'resolved'` |
| `createdAt` | `Date` | — | Report submission timestamp |

---

## 6. Complete REST API Specification

### 6.1. Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
* **Access:** Public
* **Body:** `{ name, email, password, skillsOffered, skillsNeeded, bio }`
* **Action:** Hashes password via `bcrypt.genSalt(10)`, generates 8-digit UID and 6-digit OTP, sends verification email.
* **Response (201):** `{ _id, uid, name, email, avatar, averageRating, reviewCount, isAdmin, warnings, token }`

#### `POST /api/auth/login`
* **Access:** Public
* **Body:** `{ email, password }`
* **Action:** Verifies password. If `user.uid` is missing, auto-generates one. Returns JWT.
* **Response (200):** `{ _id, uid, name, email, skillsOffered, skillsNeeded, bio, avatar, averageRating, reviewCount, isAdmin, warnings, token }`
* **Error (401):** If unverified, returns `{ message: 'Please verify your email', isVerified: false, email }`

#### `POST /api/auth/verify-otp`
* **Access:** Public
* **Body:** `{ email, otp }`
* **Action:** Validates OTP string and expiration. Sets `isVerified = true`.
* **Response (200):** User object with `uid` and JWT token.

#### `POST /api/auth/resend-otp`
* **Access:** Public
* **Body:** `{ email }`
* **Action:** Generates new 6-digit OTP with 10-minute expiry and sends email.
* **Response (200):** `{ message: 'New verification code sent successfully.' }`

#### `GET /api/auth/me`
* **Access:** Private (`Bearer <JWT>`)
* **Action:** Fetches full authenticated user document.
* **Response (200):** Complete user profile including `uid`.

#### `PUT /api/auth/profile`
* **Access:** Private (`Bearer <JWT>`)
* **Body:** `{ name, bio, skillsOffered, skillsNeeded }`
* **Action:** Updates profile fields and regenerates avatar if name changed.
* **Response (200):** Updated user object including `uid`.

---

### 6.2. User & Matchmaking Routes (`/api/users`)

#### `GET /api/users`
* **Access:** Private
* **Action:** Returns all registered system users except the calling user (for directory search).
* **Response (200):** Array of User objects.

#### `GET /api/users/:id`
* **Access:** Private
* **Action:** Returns public profile of a specific user.
* **Response (200):** User object.

#### `GET /api/users/match/explore`
* **Access:** Private
* **Action:** Executes reciprocal matchmaking logic.
* **Match Logic:**
  * **Perfect Match (`matchType: 'perfect'`, `score: 100`):** User A teaches what User B wants AND User B teaches what User A wants.
  * **Gives Match (`matchType: 'gives'`, `score: 60`):** Target user teaches what calling user needs.
  * **Receives Match (`matchType: 'receives'`, `score: 40`):** Calling user teaches what target user needs.
* **Sort Order:** `score DESC`, then `averageRating DESC`.
* **Response (200):** `[ { user: { _id, uid, name, skillsOffered, skillsNeeded, ... }, givesToCurrent: [...], receivesFromCurrent: [...], matchType, score } ]`

---

### 6.3. Session Scheduling Routes (`/api/sessions`)

#### `GET /api/sessions`
* **Access:** Private
* **Action:** Returns all sessions where the caller is either `sender` or `receiver`, sorted by `sessionDate DESC`.
* **Response (200):** Array of populated Session objects.

#### `POST /api/sessions`
* **Access:** Private
* **Body:** `{ receiver, offeredSkill, receivedSkill, sessionDate, duration }`
* **Validation:** Blocks user if `isBlockedUntil > now()` or if `receiver === caller`.
* **Response (201):** Newly created Session object with status `'pending'`.

#### `PUT /api/sessions/:id/status`
* **Access:** Private
* **Body:** `{ status }` (Enum: `'accepted'`, `'rejected'`, `'completed'`)
* **Validation:** Caller must be a participant in the session.
* **Response (200):** Updated Session object.

---

### 6.4. Chat & Messaging Routes (`/api/chats`)

#### `GET /api/chats/conversations`
* **Access:** Private
* **Action:** Returns all distinct users with whom the caller has exchanged messages, the latest message, and unread message count.
* **Response (200):** `[ { partner: { _id, name, avatar, skillsOffered }, lastMessage: { content, createdAt }, unreadCount } ]`

#### `GET /api/chats/messages/:userId`
* **Access:** Private
* **Action:** Fetches full chronological message history between caller and target user. Automatically marks incoming messages as `read = true`.
* **Response (200):** Array of populated Message objects.

---

### 6.5. Reviews & Ratings Routes (`/api/reviews`)

#### `POST /api/reviews`
* **Access:** Private
* **Body:** `{ sessionId, rating, comment }`
* **Validation:** Session must be in `'completed'` status; caller must be a participant; duplicate reviews for the same session are blocked.
* **Side Effect:** Automatically recalculates and updates the target user's `averageRating` and `reviewCount` in MongoDB.
* **Response (201):** Created Review object.

#### `GET /api/reviews/user/:userId`
* **Access:** Private
* **Action:** Returns all reviews written by peers for a specific user.
* **Response (200):** Array of Review objects populated with reviewer details.

---

### 6.6. Reports Routes (`/api/reports`)

#### `POST /api/reports`
* **Access:** Private
* **Body:** `{ reportedUserId, reason }`
* **Validation:** Caller cannot report themselves.
* **Response (201):** `{ message: 'Report submitted successfully.', report }`

---

### 6.7. Admin Moderation Suite (`/api/admin`)
*All admin routes require `protect` and `adminProtect` (`req.user.isAdmin === true`).*

#### `GET /api/admin/users`
* Returns all system users with moderation flags, warning counts, and block dates.

#### `DELETE /api/admin/users/:id`
* Deletes user account and cascades deletion to their messages, sessions, reviews, and reports. Prevents deleting other admin accounts.

#### `POST /api/admin/users/:id/warning`
* **Body:** `{ reason }`
* Appends warning object `{ reason, date: Date.now() }` to user's `warnings` array.

#### `POST /api/admin/users/:id/warning/reduce`
* Pops/removes the latest warning from the user's warning history.

#### `POST /api/admin/users/:id/block`
* **Body:** `{ durationMinutes, reason }`
* Sets `isBlockedUntil = Date.now() + durationMinutes * 60000` and saves `blockReason`.
* Common preset durations: 60 min (1 Hr), 1440 min (1 Day), 10080 min (1 Week), 43200 min (1 Month), 15768000 min (Permanent - 30 Years).

#### `POST /api/admin/users/:id/unblock`
* Resets `isBlockedUntil = null` and `blockReason = null`.

#### `GET /api/admin/reports`
* Fetches all user reports with populated reporter and reported user details.

#### `PUT /api/admin/reports/:id/resolve`
* Marks report status as `'resolved'`.

#### `GET /api/admin/chats/conversations`
* Lists all active conversations across the platform for administrative safety auditing.

#### `GET /api/admin/chats/messages/:user1Id/:user2Id`
* Fetches raw chat logs between any two users to verify harassment or scam complaints.

---

## 7. Real-Time WebSocket Architecture (Socket.io)

### Room Structure
Rooms are identified by combining and alphabetically sorting the two participant IDs:
```javascript
const roomName = [senderId, receiverId].sort().join('_');
```
This guarantees both users always join the identical room regardless of who initiates the session.

### WebSocket Event Map

| Event Name | Direction | Payload | Purpose |
| :--- | :--- | :--- | :--- |
| `connection` | Client ⟶ Server | — | Browser connects to WebSocket server |
| `register_user` | Client ⟶ Server | `userId` | Maps `userId` to `socket.id` in `onlineUsers` Map |
| `online_users` | Server ⟶ All Clients | `[userId1, userId2, ...]` | Broadcasts array of currently active users |
| `join_room` | Client ⟶ Server | `{ senderId, receiverId }` | Joins client to deterministic room |
| `send_message` | Client ⟶ Server | `{ senderId, receiverId, content }` | Enforces block verification; saves to DB |
| `receive_message`| Server ⟶ Room | `Message Object` (populated) | Emits saved message to room participants |
| `conversation_update`| Server ⟶ Receiver | `{ senderId, content, message }` | Direct alert if receiver is online outside room |
| `typing` | Client ⟶ Server | `{ senderId, receiverId, isTyping }`| Signals active keystrokes |
| `typing_status` | Server ⟶ Room Partner| `{ senderId, isTyping }` | Displays "Typing..." banner on partner UI |
| `error_message` | Server ⟶ Client | `{ message }` | Emitted when blocked user tries sending a chat |
| `disconnect` | Client ⟶ Server | — | Removes socket from `onlineUsers`; broadcasts update |

---

## 8. Frontend Component & Page Architecture

### Global Providers (`src/context/`)
1. **`AuthContext.jsx`:**
   * Holds `user`, `token`, `loading`, and `API_URL`.
   * Automatically initializes from `localStorage.getItem('token')`.
   * If `user` is in memory but `user.uid` is missing, automatically triggers a de-cached `/api/auth/me` network call to populate the 8-digit UID.
   * Exposes: `login()`, `register()`, `logout()`, `updateProfile()`.
2. **`SocketContext.jsx`:**
   * Initializes single `io(SOCKET_URL)` instance.
   * Automatically dispatches `register_user` on authentication state changes.
   * Tracks `onlineUsers` array in reactive React state.

### Core Page Views (`src/pages/`)
1. **`Landing.jsx`:** Public marketing page; introduces the skill barter concept, hero illustration, and CTA links.
2. **`Login.jsx` & `Register.jsx`:** Forms with client-side validation; handles automatic redirects to OTP verification.
3. **`VerifyOtp.jsx`:** 6-digit input with resend countdown timer (starts at 60s).
4. **`Dashboard.jsx`:**
   * Animated numeric metric counter (total hours swapped, ratings, active partners).
   * **Quick Skill Finder Search:** Multi-field directory search querying the entire database by **Name**, **8-digit UID**, or **Offered Skill**.
   * Upcoming session previews and recent partner cards.
5. **`Explore.jsx`:**
   * Grid of student match cards with animated compatibility progress meters (0% to 100%).
   * Quick filter buttons: "All Matches", "Perfect Matches", "They Teach What I Need", "I Teach What They Need".
   * Includes modals to propose a new swap session or report a user.
6. **`Chat.jsx`:**
   * Dual-pane responsive messaging layout.
   * Left pane: active conversations with unread message badges and online green dots.
   * Right pane: active chat thread, auto-scrolling via `useRef`, typing indicator, and real-time message bubbling.
7. **`Schedule.jsx`:**
   * Calendar and list view of upcoming, pending, and past sessions.
   * Actions: Accept Proposal, Reject Proposal, Mark as Completed.
   * Triggers `ReviewModal` upon completing a session.
8. **`Profile.jsx`:**
   * **UID Identity Card:** Prominently displays the student's 8-digit UID with an explanation to share with peers.
   * Name change input with automatic avatar re-generation.
   * Interactive tag manager for `skillsOffered` and `skillsNeeded` (supports `Enter`-key tag addition and click-to-remove).
   * Biography character limit counter (300 chars max).
   * Peer review log display with star icons.
9. **`AdminPanel.jsx`:**
   * Accessible only to users with `isAdmin: true`.
   * Tabbed interface: User Directory, Safety Reports, Chat Logs.
   * Actions: Delete user, Issue warning (with 200-char limiter), Reduce warning, Block user with duration presets (1 Hr to 30 Yrs), Unblock user, Audit raw chat logs.

### UI Shell (`src/components/Sidebar.jsx`)
* Sticky desktop sidebar navigation.
* Displays user avatar with green active presence dot.
* Features user name and **styled emerald badge displaying the 8-digit unique ID (`ID: 83920184`)**.
* Includes star rating score, review count, navigation links, and day/night mode toggle.

---

## 9. Key Algorithms & Implementation Details

### 9.1. Unique 8-Digit UID Generation & Migration
* Every user has an 8-digit numeric string identifier (`uid`).
* **Generation Formula:** `Math.floor(10000000 + Math.random() * 90000000).toString()`
* **Collision Handling:** Checks `await User.findOne({ uid })` in a `while` loop until a collision-free number is found.
* **Auto-Migration:** On server startup, `generateUidsForExistingUsers()` in `server.js` queries `{ $or: [{ uid: { $exists: false } }, { uid: null }, { uid: '' }] }` and auto-assigns UIDs to legacy accounts.
* **Runtime Fallback:** In `auth.js`, `/login`, `/me`, `/verify-otp`, and `/profile` inspect `if (!user.uid)` and assign one dynamically if absent.

### 9.2. Reciprocal Matchmaking Algorithm (`users.js`)
Identifies mutual learning opportunities between students:
```javascript
const givesToCurrent = otherUser.skillsOffered.filter((skill) =>
  currentUser.skillsNeeded.some((needed) => needed.toLowerCase() === skill.toLowerCase())
);
const receivesFromCurrent = otherUser.skillsNeeded.filter((skill) =>
  currentUser.skillsOffered.some((offered) => offered.toLowerCase() === skill.toLowerCase())
);

if (givesToCurrent.length > 0 && receivesFromCurrent.length > 0) {
  matchType = 'perfect'; score = 100;
} else if (givesToCurrent.length > 0) {
  matchType = 'gives'; score = 60;
} else if (receivesFromCurrent.length > 0) {
  matchType = 'receives'; score = 40;
}
```

### 9.3. Star Rating Recalculation (`reviews.js`)
Calculates mathematical average without relying on aggregation pipelines:
```javascript
const allReviewsForUser = await Review.find({ reviewee: revieweeId });
const reviewCount = allReviewsForUser.length;
const averageRating = reviewCount > 0
  ? Number((allReviewsForUser.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
  : 0;

await User.findByIdAndUpdate(revieweeId, { averageRating, reviewCount });
```

---

## 10. Common Troubleshooting & FAQs

### Q1: Why did login fail with `querySrv ECONNREFUSED`?
* **Cause:** MongoDB Atlas free tier (`M0`) clusters automatically pause after 30 days of inactivity, temporarily removing DNS SRV records.
* **Fix:** Log in to `cloud.mongodb.com`, locate `PratikCluster`, and click **"Resume"**. Ensure `0.0.0.0/0` is active under **Network Access**.

### Q2: Why was the 8-digit User ID missing in the sidebar?
* **Cause:** Earlier auth routes omitted `uid` from the JSON payload returned on `/login`.
* **Fix:** `backend/routes/auth.js` now returns `uid: user.uid` on all auth routes. `Sidebar.jsx` displays `ID: <uid>` with a fallback to `user._id.slice(-8)`.

### Q3: How do WebSockets route traffic between two specific users?
* Both users join a shared room named `[userId1, userId2].sort().join('_')`. Emitting to `io.to(roomName)` delivers the message only to those two users. If the receiver is outside the room, a direct notification is sent to their `socket.id` via the `onlineUsers` map.

---

## 11. How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/Pratikkumarsahu/Skill-Swap.git
cd Skill-Swap

# 2. Run Backend
cd backend
npm install
npm run dev     # Starts server on http://localhost:5000

# 3. Run Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev     # Starts Vite on http://localhost:5173
```
