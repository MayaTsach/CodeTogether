# CodeTogether 🧩

A collaborative online coding platform built for mentors and students to work on JavaScript code blocks in real-time.

## 🌐 Live Demo
[Open App on Vercel](https://code-together-bay.vercel.app)

## 📁 Features
- Lobby page with a list of code challenges
- Real-time code editing using Socket.IO
- First user becomes the mentor, others are students
- Role-based access: 
  - Mentor sees code in read-only mode
  - Students can write and submit code
- Success detection with 🎉 smiley
- Live student count and list display
- Mentor announcements to students
- ✅ indicator for students who solved the challenge

## 🛠️ Tech Stack
- **Frontend:** React + CodeMirror
- **Backend:** Node.js + Express + Socket.IO
- **Database:** MongoDB (hosted on MongoDB Atlas)
- **Deployment:** Vercel (Frontend) & Railway (Backend)

## ⚙️ Setup
1. Clone the repo
2. Create a `.env` file with `VITE_BACKEND_URL` pointing to your backend
3. Run `npm install` in both `client` and `server`
4. Start frontend and backend locally

## 👤 Author
Maya Tsach
