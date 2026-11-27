# GoodDeed – Volunteer & Social Impact Platform

GoodDeed is a full-stack web application designed to connect volunteers with meaningful social-impact opportunities. It allows users to explore volunteering activities, apply for opportunities, and track their applications. Administrators can manage opportunities and monitor volunteer applications through an admin dashboard.

## 🌐 Live Demo

- **Website:** https://barkhania20-spec.github.io/GoodDeed/
- **GitHub Repository:** https://github.com/barkhania20-spec/GoodDeed
- **Backend API:** https://gooddeed-79tg.onrender.com

## ✨ Features

### Volunteer Features
- User registration and login.
- Browse available volunteering opportunities.
- Search opportunities by title, organization, location, description, and category.
- Filter opportunities by category.
- View detailed opportunity information.
- Submit volunteer applications.
- Provide skills, previous experience, availability, preferred time, and motivation.
- Track application status through My Applications.

### Admin Features
- Secure admin login.
- Admin dashboard with project statistics.
- Add new volunteering opportunities.
- Edit existing opportunities.
- Delete opportunities.
- View volunteer applications and applicant details.
- Approve, reject, or mark applications as pending.
- View registered volunteers.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tool |
| JavaScript | Application logic |
| HTML & CSS | Structure and styling |
| Node.js | Backend runtime |
| Express.js | Backend API |
| MongoDB Atlas | Database |
| Mongoose | Database management |
| JWT | Authentication |
| Git & GitHub | Version control |
| GitHub Pages | Frontend hosting |
| Render | Backend hosting |

## 📁 Project Structure

GoodDeed/
│
├── backend/
│   ├── models/
│   │   ├── Application.js
│   │   ├── Opportunity.js
│   │   └── User.js
│   │
│   ├── .env
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md
│
├── .gitignore
└── README.md

## ⚙️ Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB Atlas account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/barkhania20-spec/GoodDeed.git
cd GoodDeed
```

### 2. Setup the frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Setup the backend

Open another terminal from the project root:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ADMIN_NAME=Your Admin Name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Start the backend:

```bash
npm start
```

Use the backend start command configured in `backend/package.json` if it differs from `npm start`.

**Important:** Never upload your `.env` file or expose database credentials and secret keys on GitHub.

## 🚀 Deployment

- **Frontend:** Deployed using GitHub Pages.
- **Backend:** Deployed using Render.
- **Database:** Hosted using MongoDB Atlas.

## 🔐 Authentication and Security

- JWT-based authentication.
- Role-based access for volunteers and administrators.
- Protected backend routes.
- Admin-only opportunity management.
- Environment variables for sensitive configuration.

## 🎯 Project Objective

The main objective of GoodDeed is to make volunteering more accessible by providing a centralized platform where people can discover social-impact opportunities and participate in meaningful community activities.

## 👨‍💻 Developer

**Jalaj Barkhania**

Full Stack Development Semester Project

Bennett University

---

*GoodDeed – Small Actions, Meaningful Impact.*