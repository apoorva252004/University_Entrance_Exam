# Requirements Document

## Introduction

The University Entrance Examination System is a web-based application for RV University (RVU) that manages the complete entrance examination workflow. The system enables students to apply for admission by selecting schools and programs, allows administrators to approve or reject applications, and provides teachers with access to view students assigned to their respective schools. The system enforces role-based access control across three user types: Admin, Teacher, and Student.

## Glossary

- **System**: The University Entrance Examination System web application
- **Student**: A user who registers to apply for admission to one or more schools at RVU
- **Teacher**: A user assigned to exactly one school who can view students who selected that school
- **Admin**: A user with full system control who approves or rejects student applications
- **School**: An academic division within RVU (e.g., School of Computer Science & Engineering, School of Business)
- **Program**: A degree or course offering within a school (e.g., B.Tech CSE, BBA)
- **Application_Status**: The approval state of a student account (pending, approved, rejected)
- **Selected_Schools**: The collection of schools and programs a student chooses during registration
- **Assigned_School**: The single school that a teacher is responsible for
- **Dashboard**: The role-specific interface displayed after successful authentication

## Requirements

### Requirement 1: Student Registration

**User Story:** As a prospective student, I want to register for the entrance examination system by providing my details and selecting schools and programs, so that I can apply for admission to RVU.

#### Acceptance Criteria

1. THE System SHALL provide a registration page at /signup accessible without authentication
2. WHEN a student submits the registration form, THE System SHALL collect name, email, password, and phone number
3. WHEN a student submits the registration form, THE System SHALL allow selection of multiple schools from the available RVU schools
4. WHEN a student submits the registration form, THE System SHALL allow selection of programs based on the selected schools
5. WHEN a student completes registration, THE System SHALL store the selected schools and programs as structured data containing school name and program name pairs
6. WHEN a student completes registration, THE System SHALL set the Application_Status to "pending"
7. WHEN a student completes registration, THE System SHALL prevent dashboard access until Application_Status changes to "approved"

### Requirement 2: Authentication and Login

**User Story:** As a user, I want to log in to the system with my credentials, so that I can access my role-specific dashboard.

#### Acceptance Criteria

1. THE System SHALL provide a login page at /login accessible without authentication
2. WHEN a user submits valid credentials, THE System SHALL authenticate the user against stored credentials
3. WHEN a Student with Application_Status "pending" attempts to log in, THE System SHALL display the message "Waiting for admin approval" and prevent dashboard access
4. WHEN a Student with Application_Status "approved" logs in, THE System SHALL redirect to /student/dashboard
5. WHEN a Teacher logs in, THE System SHALL redirect to /teacher/dashboard
6. WHEN an Admin logs in, THE System SHALL redirect to /admin/dashboard
7. WHEN a user submits invalid credentials, THE System SHALL display an authentication error message

### Requirement 3: Admin Approval System

**User Story:** As an admin, I want to review and approve or reject student applications, so that I can control who gains access to the examination system.

#### Acceptance Criteria

1. THE System SHALL provide an admin dashboard at /admin/dashboard accessible only to Admin users
2. WHEN an Admin accesses the dashboard, THE System SHALL display all student registrations with Application_Status "pending"
3. WHEN an Admin views a student record, THE System SHALL display name, email, Selected_Schools, selected programs, and Application_Status
4. WHEN an Admin approves a student, THE System SHALL update the Application_Status to "approved"
5. WHEN an Admin rejects a student, THE System SHALL update the Application_Status to "rejected"
6. WHEN a Student's Application_Status changes to "approved", THE System SHALL grant login access to the student dashboard

### Requirement 4: Teacher School Assignment and Student Viewing

**User Story:** As a teacher, I want to view only the students who selected my assigned school, so that I can focus on applicants relevant to my school.

#### Acceptance Criteria

1. THE System SHALL assign exactly one Assigned_School to each Teacher user
2. THE System SHALL provide a teacher dashboard at /teacher/dashboard accessible only to Teacher users
3. WHEN a Teacher accesses the dashboard, THE System SHALL display only students whose Selected_Schools includes the Teacher's Assigned_School
4. WHEN a Teacher views a student record, THE System SHALL display the student's name, email, and the program selected for the Teacher's Assigned_School
5. THE System SHALL exclude students who did not select the Teacher's Assigned_School from the teacher dashboard view

### Requirement 5: Student Dashboard Access

**User Story:** As an approved student, I want to access my dashboard to view my selected schools and available exams, so that I can proceed with the entrance examination process.

#### Acceptance Criteria

1. THE System SHALL provide a student dashboard at /student/dashboard accessible only to Student users with Application_Status "approved"
2. WHEN an approved Student accesses the dashboard, THE System SHALL display the list of schools the student selected during registration
3. WHEN an approved Student accesses the dashboard, THE System SHALL display available exams for each selected school
4. WHEN a Student with Application_Status "pending" or "rejected" attempts to access /student/dashboard, THE System SHALL deny access and redirect to the login page

### Requirement 6: Role-Based Access Control

**User Story:** As a system administrator, I want to enforce role-based access control, so that users can only access pages and data appropriate to their role.

#### Acceptance Criteria

1. WHEN a non-authenticated user attempts to access /admin/dashboard, THE System SHALL redirect to /login
2. WHEN a non-authenticated user attempts to access /teacher/dashboard, THE System SHALL redirect to /login
3. WHEN a non-authenticated user attempts to access /student/dashboard, THE System SHALL redirect to /login
4. WHEN a Student attempts to access /admin/dashboard or /teacher/dashboard, THE System SHALL deny access and display an authorization error
5. WHEN a Teacher attempts to access /admin/dashboard or /student/dashboard, THE System SHALL deny access and display an authorization error
6. WHEN an Admin attempts to access /teacher/dashboard or /student/dashboard, THE System SHALL deny access and display an authorization error

### Requirement 7: School and Program Data Management

**User Story:** As a system administrator, I want the system to maintain accurate school and program data, so that students can select from valid options during registration.

#### Acceptance Criteria

1. THE System SHALL store data for approximately 9 schools representing RVU's academic divisions
2. THE System SHALL store multiple programs for each school
3. WHEN a student accesses the registration form, THE System SHALL display all available schools for selection
4. WHEN a student selects one or more schools, THE System SHALL display programs associated with the selected schools
5. THE System SHALL prevent selection of programs that do not belong to the selected schools

### Requirement 8: User Data Persistence

**User Story:** As a developer, I want user data to be persisted in MongoDB using Prisma, so that the system maintains data integrity and supports efficient queries.

#### Acceptance Criteria

1. THE System SHALL store user records with fields: id, name, email, password, role, status, phone, selectedSchools, assignedSchool, and createdAt
2. WHEN a user record has role "student", THE System SHALL store selectedSchools as JSON containing school and program pairs
3. WHEN a user record has role "teacher", THE System SHALL store assignedSchool as a string containing the school name
4. WHEN a user record has role "admin", THE System SHALL not require selectedSchools or assignedSchool fields
5. THE System SHALL hash passwords before storing them in the database
6. THE System SHALL enforce unique email addresses across all user records

### Requirement 9: Teacher Assignment by Admin

**User Story:** As an admin, I want to create teacher accounts and assign them to schools, so that each school has exactly 2 teachers responsible for entrance exams.

#### Acceptance Criteria

1. THE System SHALL allow Admin users to create Teacher accounts without requiring teacher self-registration
2. WHEN an Admin creates a Teacher account, THE System SHALL require assignment of exactly one Assigned_School
3. THE System SHALL allow each school to have exactly 2 assigned teachers
4. WHEN an Admin creates a Teacher account, THE System SHALL set the role to "teacher" and Application_Status to "approved"
5. THE System SHALL provide the created Teacher with login credentials to access /teacher/dashboard

### Requirement 10: Application Data Integrity

**User Story:** As a system administrator, I want the system to maintain data integrity for student applications, so that school and program selections remain consistent throughout the application lifecycle.

#### Acceptance Criteria

1. WHEN a Student's application is stored, THE System SHALL preserve the exact schools and programs selected during registration
2. WHEN a Teacher views a student record, THE System SHALL display only the program the student selected for the Teacher's Assigned_School
3. WHEN an Admin views a student record, THE System SHALL display all Selected_Schools and programs the student chose
4. THE System SHALL prevent modification of Selected_Schools after initial registration
5. FOR ALL student records, the selectedSchools JSON structure SHALL contain valid school and program pairs that existed at registration time
