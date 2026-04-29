# Login Credentials

## Admin Account

**Username:** `admin`  
**Password:** `admin123`  
**Email:** admin@rvu.edu.in

---

## Teacher Accounts

All teachers have the password: `teacher123`

### School of Liberal Arts and Sciences
- **Username:** `solast1` | Email: solast1@rvu.edu.in
- **Username:** `solast2` | Email: solast2@rvu.edu.in

### School of Design and Innovation
- **Username:** `sdit1` | Email: sdit1@rvu.edu.in
- **Username:** `sdit2` | Email: sdit2@rvu.edu.in

### School of Business
- **Username:** `sobt1` | Email: sobt1@rvu.edu.in
- **Username:** `sobt2` | Email: sobt2@rvu.edu.in

### School of Economics and Public Policy
- **Username:** `soeppt1` | Email: soeppt1@rvu.edu.in
- **Username:** `soeppt2` | Email: soeppt2@rvu.edu.in

### School of Computer Science and Engineering
- **Username:** `socset1` | Email: socset1@rvu.edu.in
- **Username:** `socset2` | Email: socset2@rvu.edu.in

### School of Law
- **Username:** `solt1` | Email: solt1@rvu.edu.in
- **Username:** `solt2` | Email: solt2@rvu.edu.in

### School of Film, Media and Creative Arts
- **Username:** `sofmcat1` | Email: sofmcat1@rvu.edu.in
- **Username:** `sofmcat2` | Email: sofmcat2@rvu.edu.in

### School for Continuing Education & Professional Studies
- **Username:** `scepst1` | Email: scepst1@rvu.edu.in
- **Username:** `scepst2` | Email: scepst2@rvu.edu.in

### School of Allied and Healthcare Professions
- **Username:** `soahpt1` | Email: soahpt1@rvu.edu.in
- **Username:** `soahpt2` | Email: soahpt2@rvu.edu.in

---

## Testing the New Features

### Test Feature 1: Admin-Controlled Login

1. **Register a new student:**
   - Go to `/signup`
   - Fill in: Name, Email, Phone (optional)
   - Select schools and programs
   - Submit (no password required)

2. **Try to login as the student:**
   - Should fail with message: "Your account is not yet activated. Please contact admin."

3. **Login as admin:**
   - Username: `admin`
   - Password: `admin123`

4. **Assign credentials to the student:**
   - Go to "Pending Credentials" tab
   - Click "Assign Credentials" for the student
   - Set username and password
   - Click "Assign & Activate"

5. **Login as the student:**
   - Use the assigned username and password
   - Should successfully login

### Test Feature 2: Bulk Question Upload

1. **Login as a teacher:**
   - Example: Username `socset1`, Password `teacher123`

2. **Create an exam:**
   - Go to "Exams" tab
   - Click "Create New Exam"
   - Fill in exam details
   - Submit

3. **Add questions via bulk upload:**
   - Click "Manage Questions" for the exam
   - Click "Bulk Upload" button (gold button)
   - Download the template CSV
   - Edit the CSV with your questions
   - Upload the CSV file
   - Preview the questions
   - Click "Upload X Question(s)"

4. **Verify questions were added:**
   - Questions should appear in the question list
   - Check that all questions are correctly formatted

---

## CSV Template Format

```csv
Question,Option A,Option B,Option C,Option D,Correct Answer,Marks
"What is 2+2?",2,3,4,5,C,1
"What is the capital of France?",London,Paris,Berlin,Madrid,B,1
"Which planet is known as the Red Planet?",Venus,Mars,Jupiter,Saturn,B,1
```

**Rules:**
- All fields are required
- Correct Answer must be A, B, C, or D
- Marks is optional (defaults to 1)
- Use quotes for questions with commas

---

## Important Notes

⚠️ **Login Changes:**
- Login now uses **USERNAME** (not email)
- Students cannot login until admin assigns credentials
- Old email-based login will not work

✅ **New Workflow:**
1. Student registers (no password)
2. Admin assigns username + password
3. Student can now login with username

---

## Database Reset

If you need to reset the database:

```bash
npx prisma migrate reset --force
```

This will:
- Drop all tables
- Run all migrations
- Run the seed script
- Create admin and teacher accounts with usernames
