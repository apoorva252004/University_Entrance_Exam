# Implementation Plan: University Entrance Examination System

## Overview

This implementation plan breaks down the University Entrance Examination System into discrete, actionable coding tasks. The system is a Next.js 14+ application using the App Router, MongoDB with Prisma ORM, NextAuth.js v5 for authentication, and TypeScript for type safety. The implementation follows a sequential approach: project setup → database schema → authentication → API routes → middleware → UI components → pages → testing.

## Tasks

- [x] 1. Initialize Next.js project and configure dependencies
  - Create Next.js 14+ project with TypeScript and App Router
  - Install dependencies: prisma, @prisma/client, next-auth@beta, bcrypt, @types/bcrypt, tailwindcss
  - Configure tailwind.css with base styles
  - Set up environment variables template (.env.example)
  - _Requirements: 8.1, 8.5_

- [x] 2. Set up Prisma schema and database connection
  - [x] 2.1 Create Prisma schema with User, School, and Program models
    - Define User model with fields: id, name, email, password, phone, role, status, selectedSchools (Json), assignedSchool (String), createdAt, updatedAt
    - Define School model with id, name, programs relation, createdAt
    - Define Program model with id, name, schoolId, school relation, createdAt
    - Add enums for Role (ADMIN, TEACHER, STUDENT) and ApplicationStatus (PENDING, APPROVED, REJECTED)
    - Add indexes on User: email, (role + status)
    - Add unique constraints: User.email, School.name, Program(schoolId + name)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_
  
  - [x] 2.2 Create database seed script
    - Create prisma/seed.ts with 9 schools and their programs (CSE, ECE, Business, Architecture, Liberal Arts, Law, Design, Sciences, Civil Engineering)
    - Seed admin user with email admin@rvu.edu.in, hashed password, role ADMIN, status APPROVED
    - Seed 2 teachers per school (18 total) with assignedSchool field, role TEACHER, status APPROVED
    - Configure package.json with prisma seed command
    - _Requirements: 7.1, 7.2, 9.3_
  
  - [x] 2.3 Create Prisma client singleton
    - Create lib/prisma.ts with PrismaClient singleton pattern
    - Handle development hot-reload with globalThis caching
    - Export prisma client instance
    - _Requirements: 8.1_

- [x] 3. Implement authentication system with NextAuth.js
  - [x] 3.1 Configure NextAuth.js with credentials provider
    - Create app/api/auth/[...nextauth]/route.ts
    - Configure CredentialsProvider with email and password fields
    - Implement authorize callback: find user by email, verify password with bcrypt.compare
    - Handle pending student status: throw error with code "PENDING_APPROVAL"
    - Handle rejected student status: throw error with code "APPLICATION_REJECTED"
    - Return user object with id, name, email, role, status on success
    - _Requirements: 2.2, 2.3, 2.7, 8.5_
  
  - [x] 3.2 Configure JWT and session callbacks
    - Implement jwt callback: add role, status, id to token
    - Implement session callback: add role, status, id to session.user
    - Configure session strategy as "jwt"
    - Set custom signIn page to "/login"
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [x] 3.3 Create auth utility functions
    - Create lib/auth.ts with getServerSession wrapper
    - Export authOptions for reuse across API routes
    - Create type definitions for extended session and user types
    - _Requirements: 2.2_

- [x] 4. Implement student registration API
  - [x] 4.1 Create validation utilities
    - Create lib/utils/validation.ts
    - Implement isValidEmail function (regex-based email validation)
    - Implement isValidPassword function (minimum 8 characters)
    - Implement isValidPhone function (10-digit Indian phone number)
    - Implement validateSchoolSelection function (at least one school and program)
    - _Requirements: 1.2, 1.4_
  
  - [x] 4.2 Create registration API route
    - Create app/api/register/route.ts with POST handler
    - Parse request body: name, email, password, phone, selectedSchools array
    - Validate all inputs using validation utilities
    - Check email uniqueness with prisma.user.findUnique
    - Hash password with bcrypt.hash (10 rounds)
    - Transform selectedSchools to JSON format: [{ schoolName, programName }]
    - Create user with role STUDENT, status PENDING
    - Return success response with userId or error response with validation errors
    - Handle Prisma P2002 error (unique constraint) with 409 status
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.2, 8.5, 8.6_
  
  - [ ]* 4.3 Write unit tests for validation utilities
    - Test isValidEmail with valid and invalid emails
    - Test isValidPassword with short and valid passwords
    - Test isValidPhone with valid and invalid phone numbers
    - Test validateSchoolSelection with empty and valid selections
    - _Requirements: 1.2, 1.4_
  
  - [ ]* 4.4 Write integration tests for registration API
    - Test successful registration creates user with pending status
    - Test duplicate email returns 409 error
    - Test invalid email returns 400 with validation error
    - Test password is hashed before storage
    - Test selectedSchools JSON structure is correct
    - _Requirements: 1.5, 1.6, 8.5, 8.6_

- [x] 5. Implement admin approval API
  - [x] 5.1 Create admin students list API route
    - Create app/api/admin/students/route.ts with GET handler
    - Verify requester is admin using getServerSession
    - Query users with role STUDENT and status PENDING
    - Return array of students with id, name, email, phone, selectedSchools, createdAt
    - Return 403 if requester is not admin
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 5.2 Create admin approval API route
    - Create app/api/admin/approve/route.ts with PATCH handler
    - Verify requester is admin using getServerSession
    - Parse request body: studentId, action ("approve" or "reject")
    - Validate studentId exists and user is a student
    - Update user status to APPROVED or REJECTED based on action
    - Return success response or error response
    - _Requirements: 3.4, 3.5, 3.6_
  
  - [ ]* 5.3 Write integration tests for admin approval API
    - Test admin can approve pending student
    - Test admin can reject pending student
    - Test non-admin cannot access approval endpoint (403)
    - Test status updates persist to database
    - Test invalid studentId returns error
    - _Requirements: 3.4, 3.5_

- [x] 6. Implement teacher students API
  - [x] 6.1 Create teacher students API route
    - Create app/api/teacher/students/route.ts with GET handler
    - Verify requester is teacher using getServerSession
    - Get teacher's assignedSchool from user record
    - Query students where selectedSchools JSON contains assignedSchool
    - Extract only the program for teacher's school from each student's selectedSchools
    - Return array with id, name, email, programForSchool, status
    - Return teacher's assignedSchool in response
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 6.2 Write integration tests for teacher students API
    - Test teacher sees only students for assigned school
    - Test teacher sees correct program for their school
    - Test teacher does not see students from other schools
    - Test non-teacher cannot access endpoint (403)
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 7. Implement schools API for registration form
  - [x] 7.1 Create schools API route
    - Create app/api/schools/route.ts with GET handler
    - Query all schools with their programs using prisma.school.findMany with include
    - Return array of schools with id, name, programs (id, name, schoolId)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 7.2 Write integration tests for schools API
    - Test returns all schools with programs
    - Test programs are correctly associated with schools
    - _Requirements: 7.3, 7.4_

- [x] 8. Implement middleware for role-based access control
  - [x] 8.1 Create RBAC utility functions
    - Create lib/utils/rbac.ts
    - Implement isAdmin, isTeacher, isStudent helper functions
    - Implement canAccessRoute function (checks role and path)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 8.2 Create Next.js middleware
    - Create middleware.ts in root directory
    - Allow public access to /login and /signup
    - Require authentication for all protected routes
    - Redirect unauthenticated users to /login
    - Check role-based access: /admin/* for admin, /teacher/* for teacher, /student/* for student
    - For /student/*, also check status is APPROVED
    - Return 403 JSON response for unauthorized access
    - Configure matcher for /admin/:path*, /teacher/:path*, /student/:path*
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 2.3, 5.1_
  
  - [ ]* 8.3 Write unit tests for RBAC utilities
    - Test isAdmin, isTeacher, isStudent with different roles
    - Test canAccessRoute with various role and path combinations
    - _Requirements: 6.4, 6.5, 6.6_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create authentication UI components
  - [x] 10.1 Create LoginForm component
    - Create components/auth/LoginForm.tsx
    - Add form fields: email (type email), password (type password)
    - Implement form submission with signIn from next-auth/react
    - Handle pending approval error: display "Waiting for admin approval" message
    - Handle rejected application error: display "Your application has been rejected" message
    - Handle invalid credentials error: display "Invalid email or password" message
    - Show loading state during authentication
    - Accept callbackUrl prop for post-login redirect
    - _Requirements: 2.1, 2.2, 2.3, 2.7_
  
  - [x] 10.2 Create SignupForm component
    - Create components/auth/SignupForm.tsx
    - Add form fields: name, email, password, phone
    - Fetch schools from /api/schools on component mount
    - Render school checkboxes with multi-select capability
    - Dynamically display programs for selected schools
    - Render program checkboxes for each selected school
    - Maintain state: selectedSchools Map<schoolId, programIds[]>
    - Validate at least one school and one program selected
    - Submit to /api/register with transformed data
    - Display validation errors inline
    - Redirect to /login with success message on successful registration
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.3, 7.4, 7.5_
  
  - [ ]* 10.3 Write unit tests for authentication components
    - Test LoginForm displays error messages correctly
    - Test SignupForm displays programs for selected schools
    - Test SignupForm prevents submission without selections
    - Test SignupForm validates email and password format
    - _Requirements: 2.7, 1.4, 7.5_

- [x] 11. Create admin dashboard components
  - [x] 11.1 Create StudentApprovalTable component
    - Create components/admin/StudentApprovalTable.tsx
    - Accept props: students array, onApprove callback, onReject callback
    - Render table with columns: Name, Email, Phone, Schools/Programs, Created At, Actions
    - Display selectedSchools as expandable list showing school and program pairs
    - Add Approve button that calls onApprove with studentId
    - Add Reject button that calls onReject with studentId
    - Implement optimistic UI updates with error rollback
    - Show loading state on buttons during action
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 11.2 Write unit tests for StudentApprovalTable
    - Test renders student data correctly
    - Test Approve button calls onApprove with correct studentId
    - Test Reject button calls onReject with correct studentId
    - Test displays selectedSchools correctly
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 12. Create teacher dashboard components
  - [x] 12.1 Create StudentListTable component
    - Create components/teacher/StudentListTable.tsx
    - Accept props: students array, assignedSchool string
    - Render table with columns: Name, Email, Program, Status
    - Display programForSchool (program selected for teacher's school)
    - Implement sortable columns (name, email, status)
    - Display assignedSchool in header
    - Read-only view (no action buttons)
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 12.2 Write unit tests for StudentListTable
    - Test renders student data correctly
    - Test displays correct program for teacher's school
    - Test sorting functionality works
    - _Requirements: 4.4_

- [x] 13. Create student dashboard components
  - [x] 13.1 Create SchoolProgramList component
    - Create components/student/SchoolProgramList.tsx
    - Accept props: selectedSchools array
    - Render list of schools with their selected programs
    - Group by school name
    - Display school name as header and program name as list item
    - Add placeholder for future exam information
    - _Requirements: 5.2, 5.3_
  
  - [ ]* 13.2 Write unit tests for SchoolProgramList
    - Test renders selectedSchools correctly
    - Test groups by school name
    - _Requirements: 5.2_

- [x] 14. Create authentication pages
  - [x] 14.1 Create login page
    - Create app/(auth)/login/page.tsx
    - Render LoginForm component
    - Add link to signup page
    - Add page title and description
    - _Requirements: 2.1_
  
  - [x] 14.2 Create signup page
    - Create app/(auth)/signup/page.tsx
    - Render SignupForm component
    - Add link to login page
    - Add page title and description
    - _Requirements: 1.1_
  
  - [x] 14.3 Create auth layout
    - Create app/(auth)/layout.tsx
    - Add centered layout with max-width container
    - Add RVU branding and logo
    - Apply consistent styling for auth pages

- [x] 15. Create admin dashboard page
  - [x] 15.1 Create admin dashboard page
    - Create app/admin/dashboard/page.tsx
    - Fetch pending students from /api/admin/students on page load
    - Implement handleApprove function: call /api/admin/approve with action "approve"
    - Implement handleReject function: call /api/admin/approve with action "reject"
    - Render StudentApprovalTable with students and callbacks
    - Display loading state while fetching
    - Display empty state if no pending students
    - Show success/error toast notifications after actions
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  
  - [ ]* 15.2 Write integration tests for admin dashboard
    - Test fetches and displays pending students
    - Test approve action updates student status
    - Test reject action updates student status
    - Test displays empty state correctly
    - _Requirements: 3.2, 3.4, 3.5_

- [x] 16. Create teacher dashboard page
  - [x] 16.1 Create teacher dashboard page
    - Create app/teacher/dashboard/page.tsx
    - Fetch students from /api/teacher/students on page load
    - Render StudentListTable with students and assignedSchool
    - Display loading state while fetching
    - Display empty state if no students
    - Show teacher's assignedSchool in page header
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 16.2 Write integration tests for teacher dashboard
    - Test fetches and displays students for assigned school
    - Test displays correct program information
    - Test displays empty state correctly
    - _Requirements: 4.3, 4.4_

- [x] 17. Create student dashboard page
  - [x] 17.1 Create student dashboard page
    - Create app/student/dashboard/page.tsx
    - Fetch current user's selectedSchools from session
    - Render SchoolProgramList with selectedSchools
    - Display welcome message with student name
    - Add placeholder section for upcoming exams
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 17.2 Write integration tests for student dashboard
    - Test displays student's selected schools
    - Test displays welcome message
    - Test only accessible to approved students
    - _Requirements: 5.1, 5.2, 5.4_

- [-] 18. Create root layout and home page
  - [x] 18.1 Create root layout
    - Create app/layout.tsx
    - Configure NextAuth SessionProvider
    - Add global styles and Tailwind CSS imports
    - Configure metadata (title, description)
    - Add font configuration (Inter or similar)
  
  - [-] 18.2 Create home page
    - Create app/page.tsx
    - Add welcome message and system description
    - Add links to login and signup pages
    - Display RVU branding

- [ ] 19. Add error handling and user feedback
  - [ ] 19.1 Create error boundary components
    - Create components/ErrorBoundary.tsx for client-side errors
    - Create app/error.tsx for Next.js error handling
    - Display user-friendly error messages
    - Add retry functionality
  
  - [ ] 19.2 Create toast notification system
    - Create components/Toast.tsx or integrate react-hot-toast
    - Add success notifications for approve/reject actions
    - Add error notifications for API failures
    - Add info notification for pending approval status
  
  - [ ] 19.3 Add loading states
    - Create components/LoadingSpinner.tsx
    - Add loading states to all data-fetching pages
    - Add loading states to form submissions
    - Add skeleton loaders for tables

- [ ] 20. Implement data integrity constraints
  - [ ] 20.1 Add API route protection for data modification
    - Prevent modification of selectedSchools after registration (return 403)
    - Validate school/program existence before saving in registration API
    - Validate assignedSchool exists in School table when creating teachers
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 20.2 Write integration tests for data integrity
    - Test cannot modify selectedSchools after registration
    - Test invalid school/program combinations are rejected
    - Test teacher assignedSchool must exist
    - _Requirements: 10.4, 10.5_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Set up testing infrastructure
  - [ ]* 22.1 Configure Jest and React Testing Library
    - Install jest, @testing-library/react, @testing-library/jest-dom
    - Create jest.config.js with Next.js preset
    - Create jest.setup.js with testing-library matchers
    - Configure test scripts in package.json
  
  - [ ]* 22.2 Configure MongoDB Memory Server for integration tests
    - Install @shelf/jest-mongodb
    - Configure jest-mongodb-config.js
    - Create test utilities for database setup/teardown
    - Create factory functions for test data (createStudent, createTeacher, createAdmin)
  
  - [ ]* 22.3 Set up E2E testing with Playwright
    - Install @playwright/test
    - Create playwright.config.ts
    - Set up test database configuration
    - Create test utilities for authentication and navigation

- [ ] 23. Write end-to-end tests
  - [ ]* 23.1 Write E2E test for complete registration and approval flow
    - Test student registers with multiple schools
    - Test student attempts login (sees pending message)
    - Test admin logs in and approves student
    - Test student logs in successfully and sees dashboard
    - _Requirements: 1.1, 1.6, 1.7, 2.3, 2.4, 3.4, 3.6, 5.1_
  
  - [ ]* 23.2 Write E2E test for role-based access control
    - Test student cannot access admin/teacher routes
    - Test teacher cannot access admin/student routes
    - Test admin cannot access teacher/student routes
    - _Requirements: 6.4, 6.5, 6.6_
  
  - [ ]* 23.3 Write E2E test for teacher student viewing
    - Test teacher logs in
    - Test sees only students for assigned school
    - Test sees correct program information
    - _Requirements: 4.2, 4.3, 4.4_

- [ ] 24. Add documentation and deployment preparation
  - [ ] 24.1 Create README.md
    - Add project description and features
    - Add setup instructions (clone, install, env variables, prisma migrate, seed)
    - Add development instructions (npm run dev)
    - Add testing instructions (npm test, npm run test:e2e)
    - Document environment variables required
    - Add technology stack section
  
  - [ ] 24.2 Create .env.example
    - Add DATABASE_URL placeholder
    - Add NEXTAUTH_URL placeholder
    - Add NEXTAUTH_SECRET placeholder
    - Add comments explaining each variable
  
  - [ ] 24.3 Add deployment configuration
    - Create vercel.json or deployment config for chosen platform
    - Document deployment steps
    - Add production environment variable checklist

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation follows a bottom-up approach: infrastructure → APIs → UI → integration
- All passwords are hashed with bcrypt before storage
- Role-based access control is enforced at both middleware and API route levels
- Student school selections are immutable after registration (Requirement 10.4)
- Teacher filtering is performed server-side for security and performance
- The system uses NextAuth.js v5 (Auth.js) with JWT session strategy
- MongoDB is used with Prisma ORM for type-safe database access
- TypeScript provides compile-time type safety throughout the application
