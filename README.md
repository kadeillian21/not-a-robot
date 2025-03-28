# Not a Robot - Verification Challenge

A recaptcha-like verification system built with Next.js and Supabase. This application allows administrators to create image puzzles for different days of the week, and users to solve these puzzles to verify they are human.

## Features

- **Admin Portal**: Upload images, define targets, and select correct tiles for each day of the week
- **User Verification**: Users solve puzzles by selecting the correct tiles containing the target object
- **Success Animation**: Dopamine-triggering animation when users solve puzzles correctly
- **Failure Handling**: Graceful error messages when users make incorrect selections
- **Secure Authentication**: Admin-only access to the puzzle management system

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Supabase
- **Authentication & Storage**: Supabase for auth and image storage
- **Animation**: Framer Motion and React Confetti for engaging UI experiences
- **Notifications**: React Hot Toast for user feedback

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Supabase account (free tier works fine)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/not-a-robot.git
cd not-a-robot
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL in the `schema.sql` file to create your tables and storage
   - Enable Storage and create a new bucket called `puzzles`
   - Set the bucket's privacy to `public`

4. Configure environment variables:
   - Create a `.env` file with your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

5. Create an admin user:
   - In Supabase's Authentication section, enable Email/Password authentication
   - Create a new user with email/password or use the SQL editor:
     ```sql
     INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
     VALUES ('admin@example.com', crypt('your-password', gen_salt('bf')), now());
     ```

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following database schema:

```sql
CREATE TABLE puzzles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  weekday INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  target_description TEXT NOT NULL,
  correct_tiles INTEGER[] NOT NULL
);
```

## API Routes

The application provides the following API endpoints:

- `GET /api/puzzles` - Get all puzzles
- `GET /api/puzzles?weekday=X` - Get puzzle for a specific weekday
- `POST /api/puzzles` - Create a new puzzle
- `GET /api/puzzles/[id]` - Get a specific puzzle
- `PUT /api/puzzles/[id]` - Update a puzzle
- `DELETE /api/puzzles/[id]` - Delete a puzzle

## Usage

### Admin Portal

1. Access the admin portal at [http://localhost:3000/admin](http://localhost:3000/admin)
2. Log in with your admin credentials
3. For each day of the week:
   - Upload an image
   - Provide a target description (e.g., "a traffic light")
   - Select the tiles that contain the target object
   - Save the puzzle

### User Verification

1. Users visit the homepage at [http://localhost:3000](http://localhost:3000)
2. They see the day's puzzle with instructions
3. They select all tiles containing the target object
4. If correct, they see a success animation
5. If incorrect, they can try again

## Deployment

This application can be deployed on Vercel, Netlify, or any platform that supports Next.js. Make sure to set the environment variables in your hosting provider's dashboard.

```bash
npm run build
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.