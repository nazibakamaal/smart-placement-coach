# Smart Placement Coach

Smart Placement Coach is a comprehensive, production-ready full-stack placement coaching platform. It provides users with aptitude tests, visual progress tracking, AI-powered weak area detection, and placement readiness score calculation. Admins can manage practice questions via a CRUD interface.

## Tech Stack
- **Frontend**: React, Vite, React Router, Tailwind CSS, Recharts, Lucide React, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcryptjs, Gemini AI API (with local statistical evaluation fallback)
- **Deployment/Management**: Concurrently

## Key Features
1. **Authentication**: JWT-based session management for Students and Admins, secure passwords with bcrypt.
2. **Aptitude Module**: Category-based practice tests with visual navigation, countdown timer, and answers/explanations.
3. **Progress Dashboard**: Dynamic charts showing historical performance, scores, and completion times.
4. **AI-Powered Diagnostics**:
   - **Weak Area Detection**: Identifies performance gaps, links categories to sub-optimal accuracy, and suggests specific learning areas.
   - **Placement Readiness Score**: A dynamic AI-calculated score (0-100) that indicates how ready a student is based on volume of questions, difficulty tier, speed, and accuracy. Uses Google Gemini API if a key is provided, otherwise falls back to a precise analytical engine.
5. **Question CRUD**: Admin dashboard to create, view, update, and delete placement questions.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Free Tier cluster (M0)

### MongoDB Atlas Setup (Free Tier)
1. Create a free Atlas account and an M0 cluster.
2. **Database Access**: create a database user with read/write permissions.
3. **Network Access**: add your IP address (or `0.0.0.0/0` for development).
4. **Connect**: choose **Drivers**, copy the connection string, and replace `<password>` with your user password.
5. Set the database name to `smart-placement-coach` in the URI (before `?retryWrites`).

### Installation
1. Install all dependencies for root, frontend, and backend:
   ```bash
   npm run install-all
   ```

2. Setup environment variables:
   - Copy `backend/.env.example` to `backend/.env` and set your Atlas URI:
     ```env
     PORT=5000
     MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart-placement-coach?retryWrites=true&w=majority
     JWT_SECRET=supersecretjwtkeyforplacementcoach
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - (Optional) Create a `frontend/.env` file:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```

3. Seed the database with sample placement questions (only runs when the collection is empty):
   ```bash
   npm run seed
   ```

### Running the Application
To run both backend and frontend concurrently in development mode:
```bash
npm run dev
```
- Frontend will be available at [http://localhost:5173](http://localhost:5173)
- Backend will be available at [http://localhost:5000](http://localhost:5000)
