# RV University Entrance Examination System

A modern, full-stack web application for managing university entrance examinations with multi-school support, built with Next.js, Prisma, and SQLite.

## 🌟 Features

### Multi-Role System
- **Admin Dashboard**: Approve/reject student applications, manage all schools
- **Teacher Dashboard**: View students assigned to their school
- **Student Dashboard**: Register for multiple schools, view application status

### Key Capabilities
- ✅ Multi-school architecture (9 schools with various programs)
- ✅ Secure authentication with NextAuth.js
- ✅ Role-based access control (Admin, Teacher, Student)
- ✅ Student application approval workflow
- ✅ Beautiful, modern UI with Tailwind CSS
- ✅ Responsive design for all devices
- ✅ SQLite database with Prisma ORM

## 🏫 Schools Included

1. School of Computer Science & Engineering
2. School of Electronics & Communication
3. School of Business
4. School of Architecture
5. School of Liberal Arts
6. School of Law
7. School of Design
8. School of Sciences
9. School of Civil Engineering

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/apoorva252004/RVU_Entrance_Exam.git
   cd RVU_Entrance_Exam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init_sqlite
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 Default Login Credentials

### Admin Account
- **Email**: `admin@rvu.edu.in`
- **Password**: `admin123`

### Teacher Accounts
All teachers use password: `teacher123`

| School | Teacher 1 Email | Teacher 2 Email |
|--------|----------------|----------------|
| School of Liberal Arts and Sciences | `solast1@rvu.edu.in` | `solast2@rvu.edu.in` |
| School of Design and Innovation | `sdit1@rvu.edu.in` | `sdit2@rvu.edu.in` |
| School of Business | `sobt1@rvu.edu.in` | `sobt2@rvu.edu.in` |
| School of Economics and Public Policy | `soeppt1@rvu.edu.in` | `soeppt2@rvu.edu.in` |
| School of Computer Science and Engineering | `socset1@rvu.edu.in` | `socset2@rvu.edu.in` |
| School of Law | `solt1@rvu.edu.in` | `solt2@rvu.edu.in` |
| School of Film, Media and Creative Arts | `sofmcat1@rvu.edu.in` | `sofmcat2@rvu.edu.in` |
| School for Continuing Education & Professional Studies | `scepst1@rvu.edu.in` | `scepst2@rvu.edu.in` |
| School of Allied and Healthcare Professions | `soahpt1@rvu.edu.in` | `soahpt2@rvu.edu.in` |

### Student Accounts
Students must register through the signup page. After registration, an admin must approve their application before they can log in.

## 📁 Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages (login, signup)
│   ├── admin/           # Admin dashboard
│   ├── teacher/         # Teacher dashboard
│   ├── student/         # Student dashboard
│   └── api/             # API routes
├── components/          # Reusable React components
├── lib/                 # Utility functions and configurations
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.3 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **Password Hashing**: bcrypt
- **Testing**: Jest

## 🎨 UI Features

- Modern gradient designs for each role (Admin: Blue, Teacher: Purple, Student: Green)
- Smooth animations and transitions
- Custom scrollbar styling
- Responsive tables with sorting
- Loading states and error handling
- Toast notifications
- Empty state designs

## 📊 Database Schema

### User Model
- Multi-role support (ADMIN, TEACHER, STUDENT)
- Application status tracking (PENDING, APPROVED, REJECTED)
- School assignments for teachers
- Multiple school selections for students

### School Model
- School information
- Associated programs

### Program Model
- Program details
- School relationships

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based session management
- Role-based route protection
- Input validation
- SQL injection prevention (Prisma)

## 🧪 Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## 📝 API Endpoints

### Authentication
- `POST /api/register` - Student registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Admin
- `GET /api/admin/students` - List all students
- `PATCH /api/admin/approve` - Approve/reject students

### Teacher
- `GET /api/teacher/students` - List students for assigned school

### Public
- `GET /api/schools` - List all schools and programs

## 🚧 Future Enhancements

- [ ] Examination scheduling
- [ ] Online exam taking interface
- [ ] Result management
- [ ] Email notifications
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Dark mode support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Apoorva**
- GitHub: [@apoorva252004](https://github.com/apoorva252004)

## 🙏 Acknowledgments

- RV University for the project inspiration
- Next.js team for the amazing framework
- Prisma team for the excellent ORM

---

**Note**: This is a project for educational purposes. Make sure to change default passwords and secrets before deploying to production.
