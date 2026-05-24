# Task Management App

A full stack task management application built with Node.js, Express, MongoDB, and plain HTML/CSS/JavaScript.

## Features

- User signup and login
- Task creation, editing, deletion
- Mark tasks completed
- Pending and completed task sections
- Responsive mobile-first UI
- Modern single-page frontend

## Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a MongoDB database and set `MONGO_URI`.
4. Start the server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5000` in your browser.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Notes

The frontend uses JWT in `localStorage` and communicates with the backend API.
