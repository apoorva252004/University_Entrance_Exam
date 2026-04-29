# Implementation Plan: University Entrance Examination System

## Overview

This implementation plan breaks down the University Entrance Examination System into discrete, actionable coding tasks. The system is a Next.js 14+ application using the App Router, MongoDB with Prisma ORM, NextAuth.js v5 for authentication, and TypeScript for type safety.

**Key Authentication System Features**:
- **Auto-Generated Credentials**: Students register WITHOUT providing a password. The system auto-generates a unique username (firstname + 3-digit random number, e.g., "apoorva123") and a secure password (8-10 characters with uppercase, lowercase, and numbers).
- **First-Login Password Change**: All new users have `isFirstLogin = TRUE` and are redirected to `/change-password` on first login. They must change their auto-generated password before accessing their dashboard.
- **Username-Based Authentication**: Login uses username (NOT email). Error messages display "Invalid username or password".
- **Admin User**: Has hardcoded username "admin" with `isFirstLogin = FALSE`.

The implementation follows a sequential approach: project setup → database schema → authentication utilities → API routes → middleware → UI components → pages → testing.

## Tasks

- [x] 1. Initialize Next.js project and configure dependencies
  - Create Next.js 14+ project with TypeScript and App Router
  - Install dependencies: prisma, @prisma/client, next-auth@beta, bcrypt, @types/bcrypt, tailwindcss
  - Configure tailwind.css with base styles
  - Set up environment variables template (.env.example)
  - _Requirements: 8.1, 8.5_

- [x] 2. Set up Prisma schema and database connection
  - [x] 2.1 Create Prisma schema with User, School, and Program models
    - Define User model with fields: id, name, email, username (unique), password, phone, role, status, isFirstLogin (Boolean, default true), selectedSchools (Json), assignedSchool (String), createdAt, updatedAt
    - Define School model with id, name, programs relation, createdAt
    - Define Program model with id, name, schoolId, school relation, createdAt
    - Add enums for Role (ADMIN, TEACHER, STUDENT) and ApplicationStatus (PENDING, APPROVED, REJECTED)
    - Add indexes on User: email, username, (role + status)
    - Add unique constraints: User.email, User.username, School.name, Program(schoolId + name)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.9, 1.5, 1.9_
  
  - [x] 2.2 Create database seed script
    - Create prisma/seed.ts with 9 schools and their programs (CSE, ECE, Business, Architecture, Liberal Arts, Law, Design, Sciences, Civil Engineering)
    - Seed admin user with username "admin", email admin@rvu.edu.in, hashed password, role ADMIN, status APPROVED, isFirstLogin FALSE
    - Seed 2 teachers per school (18 total) with auto-generated username (firstname + 3-digit number), auto-generated password, assignedSchool field, role TEACHER, status APPROVED, isFirstLogin TRUE
    - Configure package.json with prisma seed command
    - _Requirements: 7.1, 7.2, 9.3, 2.10, 1.5, 1.9_
  
  - [x] 2.3 Create Prisma client singleton
    - Create lib/prisma.ts with PrismaClient singleton pattern
    - Handle development hot-reload with globalThis caching
    - Export prisma client instance
    - _Requirements: 8.1_

- [x] 3. Implement authentication system with NextAuth.js
  - [x] 3.1 Configure NextAuth.js with credentials provider
    - Create app/api/auth/[...nextauth]/route.ts
    - Configure CredentialsProvider with username and password fields (NOT email)
    - Implement authorize callback: find user by username (NOT email), verify password with bcrypt.compare
    - Handle pending student status: throw error with code "PENDING_APPROVAL"
    - Handle rejected student status: throw error with code "APPLICATION_REJECTED"
    - Return user object with id, name, email, username, role, status, isFirstLogin on success
    - _Requirements: 2.2, 2.3, 2.7, 2.9, 8.5, 1.9_
  
  - [x] 3.2 Configure JWT and session callbacks
    - Implement jwt callback: add role, status, id, username, isFirstLogin to token
    - Implement session callback: add role, status, id, username, isFirstLogin to session.user
    - Configure session strategy as "jwt"
    - Set custom signIn page to "/login"
    - _Requirements: 2.4, 2.5, 2.6, 2A.1, 2A.8_
  
  - [x] 3.3 Create auth utility functions
    - Create lib/auth.ts with getServerSession wrapper
    - Export authOptions for reuse across API routes
    - Create type definitions for extended session and user types
    - _Requirements: 2.2_

- [x] 4. Implement student registration API with auto-generated credentials
  - [x] 4.1 Create username and password generation utilities
    - Create lib/utils/username.ts
    - Implement generateUsername(fullName) function: extract first name, append 3-digit random number (100-999)
    - Implement extractFirstName(fullName) function: extract and lowercase first name
    - Implement generateRandomThreeDigit() function: return random number 100-999
    - Implement isUsernameUnique(username) function: check database for uniqueness
    - Create lib/utils/password.ts
    - Implement generateSecurePassword() function: 8-10 characters with uppercase, lowercase, numbers
    - Implement shuffleString(str) function: Fisher-Yates shuffle for password randomization
    - Implement isValidPassword(password) function: minimum 8 characters validation
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 4.1a Write unit tests for username generation utilities
    - Test generateUsername creates correct format (firstname + 3-digit number)
    - Test extractFirstName handles multiple spaces and special characters
    - Test generateRandomThreeDigit returns values between 100-999
    - Test isUsernameUnique checks database correctly
    - Test username collision retry logic
    - _Requirements: 1.5, 1.6, 13.1, 13.2_
  
  - [ ]* 4.1b Write unit tests for password generation utilities
    - Test generateSecurePassword creates 8-10 character passwords
    - Test password contains at least one uppercase, lowercase, and number
    - Test shuffleString randomizes character order
    - Test isValidPassword validates minimum length
    - Test password uniqueness across multiple generations
    - _Requirements: 1.7, 13.3, 13.4, 13.5_
  
  - [x] 4.2 Create validation utilities
    - Create lib/utils/validation.ts
    - Implement isValidEmail function (regex-based email validation)
    - Implement isValidPhone function (10-digit Indian phone number)
    - Implement validateSchoolSelection function (at least one school and program)
    - Remove isValidPassword from validation.ts (moved to password.ts for password change validation)
    - _Requirements: 1.2, 1.4_
  
  - [x] 4.3 Create registration API route
    - Create app/api/register/route.ts with POST handler
    - Parse request body: name, email, phone, selectedSchools array (NO password field)
    - Validate email and phone using validation utilities
    - Check email uniqueness with prisma.user.findUnique
    - Generate unique username using generateUsername() with collision retry (max 10 attempts)
    - Generate secure password using generateSecurePassword()
    - Hash generated password with bcrypt.hash (10 rounds)
    - Transform selectedSchools to JSON format: [{ schoolName, programName }]
    - Create user with role STUDENT, status PENDING, isFirstLogin TRUE
    - Return success response with userId, username, and plain-text password (only returned once)
    - Handle Prisma P2002 error (unique constraint) with 409 status
    - Handle username generation failure after max attempts with 500 status
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 8.2, 8.5, 8.6, 8.9, 12.2, 13.2_
  
  - [ ]* 4.4 Write unit tests for validation utilities
    - Test isValidEmail with valid and invalid emails
    - Test isValidPhone with valid and invalid phone numbers
    - Test validateSchoolSelection with empty and valid selections
    - _Requirements: 1.2, 1.4_
  
  - [ ]* 4.5 Write integration tests for registration API
    - Test successful registration creates user with pending status and isFirstLogin TRUE
    - Test response includes auto-generated username in format firstname + 3-digit number
    - Test response includes auto-generated password with 8-10 characters
    - Test duplicate email returns 409 error
    - Test invalid email returns 400 with validation error
    - Test password is hashed before storage (not plain text)
    - Test selectedSchools JSON structure is correct
    - Test username uniqueness with collision retry
    - Test username generation failure after max attempts returns 500
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 8.5, 8.6, 8.9, 12.2, 13.2_

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

- [ ] 7A. Implement password change API for first-login flow
  - [ ] 7A.1 Create password change API route
    - Create app/api/change-password/route.ts with POST handler
    - Verify user is authenticated using getServerSession
    - Verify user has isFirstLogin = TRUE
    - Parse request body: newPassword, confirmPassword
    - Validate newPassword and confirmPassword match
    - Validate password strength using isValidPassword (minimum 8 characters)
    - Hash new password with bcrypt.hash (10 rounds)
    - Update user password in database
    - Set isFirstLogin = FALSE
    - Return success response or error response with validation errors
    - Return 401 if user not authenticated
    - Return 403 if user has isFirstLogin = FALSE
    - _Requirements: 2A.1, 2A.2, 2A.3, 2A.4, 2A.5, 2A.6, 2A.8, 12.5, 13.5, 13.6_
  
  - [ ]* 7A.2 Write integration tests for password change API
    - Test successful password change with matching passwords
    - Test password is hashed before storage
    - Test isFirstLogin is set to FALSE after change
    - Test password mismatch returns 400 error
    - Test weak password (< 8 characters) returns 400 error
    - Test unauthenticated request returns 401
    - Test user with isFirstLogin FALSE cannot change password via this endpoint
    - Test new password works for subsequent login
    - _Requirements: 2A.3, 2A.4, 2A.5, 2A.6, 2A.8, 13.5, 13.6, 13.7_

- [x] 8. Implement middleware for role-based access control
  - [x] 8.1 Create RBAC utility functions
    - Create lib/utils/rbac.ts
    - Implement isAdmin, isTeacher, isStudent helper functions
    - Implement canAccessRoute function (checks role and path)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 8.2 Create Next.js middleware with first-login redirect
    - Create middleware.ts in root directory
    - Allow public access to /login and /signup
    - Require authentication for all protected routes
    - Redirect unauthenticated users to /login
    - Check isFirstLogin flag: if TRUE and path is not /change-password, redirect to /change-password
    - Prevent access to /change-password if isFirstLogin is FALSE (redirect to role-specific dashboard)
    - Check role-based access: /admin/* for admin, /teacher/* for teacher, /student/* for student
    - For /student/*, also check status is APPROVED
    - Return 403 JSON response for unauthorized access
    - Configure matcher for /admin/:path*, /teacher/:path*, /student/:path*, /change-password
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 2.3, 2.5, 2.6, 2A.1, 2A.7, 2A.8, 5.1_
  
  - [ ]* 8.3 Write unit tests for RBAC utilities
    - Test isAdmin, isTeacher, isStudent with different roles
    - Test canAccessRoute with various role and path combinations
    - _Requirements: 6.4, 6.5, 6.6_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create authentication UI components
  - [x] 10.1 Create LoginForm component with username field
    - Create components/auth/LoginForm.tsx
    - Add form fields: username (type text, NOT email), password (type password)
    - Implement form submission with signIn from next-auth/react
    - Handle pending approval error: display "Waiting for admin approval" message
    - Handle rejected application error: display "Your application has been rejected" message
    - Handle invalid credentials error: display "Invalid username or password" message (NOT "Invalid email or password")
    - Show loading state during authentication
    - Accept callbackUrl prop for post-login redirect
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.9, 1.10_
  
  - [x] 10.2 Create SignupForm component without password field
    - Create components/auth/SignupForm.tsx
    - Add form fields: name, email, phone (NO password field)
    - Fetch schools from /api/schools on component mount
    - Render school checkboxes with multi-select capability
    - Dynamically display programs for selected schools
    - Render program checkboxes for each selected school
    - Maintain state: selectedSchools Map<schoolId, programIds[]>
    - Validate at least one school and one program selected
    - Submit to /api/register with transformed data (no password)
    - Display validation errors inline
    - On successful registration, display modal with generated username and password
    - Modal includes "Copy Credentials" button and warning to save credentials
    - After modal dismissal, redirect to /login
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.10, 7.3, 7.4, 7.5, 12.2_
  
  - [ ] 10.3 Create ChangePasswordForm component
    - Create components/auth/ChangePasswordForm.tsx
    - Add form fields: newPassword (type password), confirmPassword (type password)
    - Implement form submission to /api/change-password
    - Validate newPassword and confirmPassword match before submission
    - Validate password strength (minimum 8 characters) using isValidPassword
    - Display validation errors inline
    - Show loading state during submission
    - On success, redirect to role-specific dashboard
    - Display error messages for API failures
    - _Requirements: 2A.2, 2A.3, 2A.7, 13.5, 13.6, 13.7_
  
  - [ ]* 10.4 Write unit tests for authentication components
    - Test LoginForm uses username field (not email)
    - Test LoginForm displays "Invalid username or password" error message
    - Test SignupForm has no password input field
    - Test SignupForm displays credentials modal on successful registration
    - Test SignupForm displays programs for selected schools
    - Test SignupForm prevents submission without selections
    - Test SignupForm validates email format
    - Test ChangePasswordForm validates password match
    - Test ChangePasswordForm validates password strength
    - Test ChangePasswordForm displays error messages correctly
    - _Requirements: 2.7, 2.9, 1.4, 1.10, 7.5, 2A.3, 13.6, 13.7_

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
  
  - [ ] 14.3 Create change password page
    - Create app/(auth)/change-password/page.tsx
    - Render ChangePasswordForm component
    - Add page title: "Change Your Password"
    - Add description: "For security, please change your temporary password"
    - Verify user is authenticated (redirect to /login if not)
    - _Requirements: 2A.1, 2A.2_
  
  - [x] 14.4 Create auth layout
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
    - Add success notification for password change
    - Add error notifications for API failures
    - Add info notification for pending approval status
    - Add warning notification to save generated credentials
  
  - [ ] 19.3 Add loading states
    - Create components/LoadingSpinner.tsx
    - Add loading states to all data-fetching pages
    - Add loading states to form submissions (login, signup, password change)
    - Add skeleton loaders for tables

- [ ] 19A. Optional: Implement admin user management features
  - [ ]* 19A.1 Create admin user list API route
    - Create app/api/users/route.ts with GET handler
    - Verify requester is admin using getServerSession
    - Query all users, exclude password field
    - Return array with id, name, username, role, status
    - Return 403 if requester is not admin
    - _Requirements: 11.1, 11.2, 11.3, 12.7_
  
  - [ ]* 19A.2 Create admin password reset API route
    - Create app/api/admin/reset-password/route.ts with POST handler
    - Verify requester is admin using getServerSession
    - Parse request body: userId
    - Validate userId exists
    - Generate new secure password using generateSecurePassword()
    - Hash password with bcrypt
    - Update user password in database
    - Set isFirstLogin = TRUE
    - Return success response with plain-text password (only returned once)
    - Return 403 if requester is not admin
    - _Requirements: 11.4, 11.5, 11.6, 11.7, 12.8_
  
  - [ ]* 19A.3 Create UserManagementTable component
    - Create components/admin/UserManagementTable.tsx
    - Accept props: users array, onResetPassword callback
    - Render table with columns: Name, Username, Role, Status, Actions
    - Add "Reset Password" button for each user
    - Display generated password in modal after reset
    - Show loading state on buttons during action
    - _Requirements: 11.2, 11.3, 11.6, 11.7_
  
  - [ ]* 19A.4 Create admin users page
    - Create app/admin/users/page.tsx
    - Fetch all users from /api/users on page load
    - Implement handleResetPassword function: call /api/admin/reset-password
    - Render UserManagementTable with users and callback
    - Display loading state while fetching
    - Show success/error toast notifications after password reset
    - Display new password in modal for admin to communicate to user
    - _Requirements: 11.1, 11.4, 11.5, 11.6, 11.7_
  
  - [ ]* 19A.5 Write integration tests for admin user management
    - Test GET /api/users returns all users without passwords
    - Test POST /api/admin/reset-password generates new password
    - Test reset password sets isFirstLogin to TRUE
    - Test non-admin cannot access endpoints (403)
    - Test new password works for subsequent login
    - _Requirements: 11.2, 11.3, 11.5, 11.6_

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
  - [ ]* 23.1 Write E2E test for complete registration, approval, and first-login flow
    - Test student registers with multiple schools (no password field visible)
    - Test system displays credentials modal with username and password
    - Test student copies credentials and proceeds to login
    - Test student attempts login with generated credentials (sees pending message)
    - Test admin logs in with username "admin" and approves student
    - Test student logs in successfully and is redirected to /change-password
    - Test student changes password successfully
    - Test student is redirected to dashboard after password change
    - Test student can login with new password
    - Test student cannot access /change-password after password change
    - _Requirements: 1.1, 1.6, 1.7, 1.10, 2.3, 2.4, 2.5, 2.6, 2A.1, 2A.6, 2A.7, 3.4, 3.6, 5.1_
  
  - [ ]* 23.2 Write E2E test for role-based access control with first-login redirect
    - Test student cannot access admin/teacher routes
    - Test teacher cannot access admin/student routes
    - Test admin cannot access teacher/student routes
    - Test user with isFirstLogin TRUE cannot access dashboard (redirected to /change-password)
    - Test user with isFirstLogin FALSE cannot access /change-password (redirected to dashboard)
    - _Requirements: 6.4, 6.5, 6.6, 2A.1, 2A.7, 2A.8_
  
  - [ ]* 23.3 Write E2E test for teacher student viewing
    - Test teacher logs in with username (not email)
    - Test sees only students for assigned school
    - Test sees correct program information
    - _Requirements: 4.2, 4.3, 4.4, 2.2_
  
  - [ ]* 23.4 Write E2E test for username-based authentication
    - Test login form has username field (not email field)
    - Test login with invalid username shows "Invalid username or password"
    - Test admin can login with username "admin"
    - Test student can login with auto-generated username
    - _Requirements: 2.2, 2.9, 2.10, 1.5, 1.10_
  
  - [ ]* 23.5 Write E2E test for password change validation
    - Test password mismatch shows error
    - Test weak password (< 8 characters) shows error
    - Test successful password change redirects to dashboard
    - Test new password works for subsequent login
    - _Requirements: 2A.3, 2A.6, 2A.7, 13.5, 13.6_
  
  - [ ]* 23.6 Optional: Write E2E test for admin password reset
    - Test admin can view all users with usernames
    - Test admin can reset user password
    - Test reset password is displayed to admin
    - Test user with reset password must change it on first login
    - _Requirements: 11.1, 11.4, 11.5, 11.6_

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
- **Auto-generated credentials**: Students do NOT provide passwords during registration; system generates username (firstname + 3-digit number) and secure password (8-10 characters)
- **First-login flow**: All new users have isFirstLogin = TRUE and must change password on first login via /change-password page
- **Username-based authentication**: Login uses username field (NOT email); error messages say "Invalid username or password"
- **Admin user**: Has hardcoded username "admin" with isFirstLogin = FALSE
- Role-based access control is enforced at both middleware and API route levels
- Middleware enforces first-login redirect: users with isFirstLogin = TRUE are redirected to /change-password before accessing dashboards
- Student school selections are immutable after registration (Requirement 10.4)
- Teacher filtering is performed server-side for security and performance
- The system uses NextAuth.js v5 (Auth.js) with JWT session strategy
- MongoDB is used with Prisma ORM for type-safe database access
- TypeScript provides compile-time type safety throughout the application
- Username generation includes collision retry logic (max 10 attempts)
- Generated credentials are displayed only once on registration success and must be saved by the user
- Optional admin user management features (tasks 19A.*) allow admins to reset passwords and view all users
