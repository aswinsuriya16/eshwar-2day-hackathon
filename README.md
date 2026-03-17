# Internship Progress Tracker

A full-stack web application that helps managers assign weekly goals to interns and review their progress reports efficiently.

**Managers** can:
- Assign weekly goals with deadlines and priorities
- Review, approve/reject submitted reports
- Get a dashboard of pending reviews

**Interns** can:
- View their assigned weekly goals
- Submit rich-text progress reports (using Quill editor)
- Track submission status

Built with the **MERN** stack (MongoDB, Express.js, React, Node.js) + JWT authentication, cron notifications, and rich text editing.

![Project Banner / Screenshot](https://via.placeholder.com/1200x400?text=Internship+Progress+Tracker+Dashboard)  
*(Replace with actual screenshot of manager/intern dashboard)*

## ✨ Features

- **Separate authentication** for Managers and Interns (JWT-based)
- Manager portal: Assign weekly goals, view assigned interns, approve/reject reports with feedback & rating
- Intern portal: View goals, submit rich-text reports (Quill editor integration)
- Weekly CRON job: Sends email reminders for upcoming deadlines (nodemailer)
- Role-based access control (protect + role middleware)
- Secure password hashing (bcrypt), helmet, CORS
- MongoDB schemas with proper indexing & population
- RESTful API design following MVC-like structure

## 🛠️ Tech Stack

| Layer       | Technology                  | Purpose                              |
|-------------|-----------------------------|--------------------------------------|
| Frontend    | React 18+                   | UI & state management                |
|              | React Quill                 | Rich text editor for reports         |
|              | Axios                       | API calls                            |
|              | Tailwind CSS (optional)     | Styling                              |
| Backend     | Node.js 20+                 | Runtime                              |
|              | Express.js                  | Web framework & routing              |
|              | Mongoose                    | MongoDB ODM                          |
|              | JWT                         | Authentication                       |
|              | bcryptjs                    | Password hashing                     |
|              | node-cron                   | Weekly reminder emails               |
|              | nodemailer                  | Email notifications                  |
| Database    | MongoDB                     | Document storage                     |
| Others      | dotenv, helmet, cors        | Environment, security, cross-origin  |

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) (for email notifications)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/internship-progress-tracker.git
cd internship-progress-tracker