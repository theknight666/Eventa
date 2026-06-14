# Eventa - Event Discovery Platform

Eventa is a platform to discover, book, and manage amazing tech, business, and social events across India. It aggregates events from multiple platforms (Eventbrite, Meetup, Luma, Townscript) and offers organizers a portal to post their own events.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion
- **Backend**: Python, FastAPI/Motor (MongoDB Async Driver)
- **Database**: MongoDB Atlas

## Project Structure

- `/frontend` - Next.js React application
- `/backend` - Python API and web scrapers

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB instance (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Create and activate a virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows use \`venv\\Scripts\\activate\`
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
4. Create a \`.env\` file based on \`.env.example\`:
   \`\`\`env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=eventa
   ADMIN_KEY=your_admin_secret_key
   JWT_SECRET=your_jwt_secret
   \`\`\`
5. Start the API server:
   \`\`\`bash
   python server.py
   \`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file based on \`.env.example\`:
   \`\`\`env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment
- The **frontend** is optimized for deployment on Vercel. Connect the repository and set the root directory to `frontend`.
- The **backend** can be deployed to any Python hosting service (e.g. Render, Heroku) by running `server.py` as the entrypoint. Ensure `MONGO_URL` is set in the environment variables.
