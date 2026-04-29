# Manual Testing Guide - Notification Enhancement

## Prerequisites
✅ Dev server running at http://localhost:3000
✅ Admin credentials: username `admin`, password `admin123`

---

## Test Scenario 1: PENDING Student Login Message

### Objective
Verify that PENDING students see an informative blue message when trying to login.

### Steps

1. **Create a new student registration**
   - Go to http://localhost:3000/signup
   - Fill in the form:
     - Name: Test Student
     - Email: teststudent@example.com
     - Phone: (leave empty or fill)
     - Select at least one school and program
   - Click "Create Account"
   - **Note the generated credentials** (username and password shown in modal)
   - Click "Continue to Login"

2. **Try to login as the PENDING student**
   - You'll be redirected to http://localhost:3000/login
   - Enter the username and password from step 1
   - Click "Sign In"

3. **Expected Result** ✅
   - You should see a **BLUE info box** (not red error)
   - Message: "Your application is under review. You will be notified via email once your account is approved and credentials are assigned."
   - Info icon (ℹ️) instead of error icon (❌)

4. **What to Check**
   - [ ] Message is displayed in blue box
   - [ ] Info icon is shown
   - [ ] Message is clear and informative
   - [ ] No access to dashboard

---

## Test Scenario 2: Admin Assigns Credentials - Success Modal

### Objective
Verify that admin sees a comprehensive success modal after assigning credentials.

### Steps

1. **Login as Admin**
   - Go to http://localhost:3000/login
   - Username: `admin`
   - Password: `admin123`
   - Click "Sign In"

2. **Navigate to Pending Credentials**
   - You should be on the admin dashboard
   - Click "Pending Credentials" in the sidebar (should be selected by default)
   - You should see the student you registered in Test Scenario 1

3. **Assign Credentials**
   - Click the **"Assign Credentials"** button (gold/yellow button)
   - A modal should appear with:
     - Student information
     - Username field (pre-filled with suggestion)
     - Password field (empty)
     - Role dropdown (STUDENT selected)
   
4. **Fill in Credentials**
   - Username: Keep the suggested one or change it (e.g., `teststudent`)
   - Password: Click "Generate" button OR type a password (min 8 chars)
   - Role: Keep as STUDENT
   - Click **"Assign & Activate"**

5. **Expected Result** ✅
   - The assign modal should close
   - A **NEW SUCCESS MODAL** should appear with:

   **Header:**
   - [ ] Green checkmark icon
   - [ ] "Credentials Assigned Successfully!" title
   - [ ] "Account has been activated" subtitle

   **Blue Reminder Box:**
   - [ ] Info icon
   - [ ] "Important Reminder" heading
   - [ ] Message: "Please inform the student via email or phone with their login credentials."

   **Student Contact Information (Gray Box):**
   - [ ] Student name with person icon
   - [ ] Email address with "Copy" button
   - [ ] Phone number with "Copy" button (if provided)

   **Login Credentials (Yellow Box):**
   - [ ] "Login Credentials" heading
   - [ ] Username field (read-only) with "Copy" button
   - [ ] Password field (read-only) with "Copy" button

   **Footer:**
   - [ ] "Done" button

6. **Test Copy Functionality**
   - Click "Copy" button next to email
   - Paste somewhere (Notepad, browser address bar) to verify it copied
   - Click "Copy" button next to username
   - Paste to verify
   - Click "Copy" button next to password
   - Paste to verify
   - If phone was provided, test that copy button too

7. **Close Modal**
   - Click "Done" button
   - Modal should close
   - Student should disappear from "Pending Credentials" table
   - Student count should decrease by 1

---

## Test Scenario 3: Student Login After Approval

### Objective
Verify that the approved student can now login successfully.

### Steps

1. **Logout from Admin**
   - Click "Sign Out" in the admin sidebar

2. **Login as the Approved Student**
   - Go to http://localhost:3000/login
   - Enter the username you assigned in Test Scenario 2
   - Enter the password you assigned in Test Scenario 2
   - Click "Sign In"

3. **Expected Result** ✅
   - [ ] Login successful (no error message)
   - [ ] Redirected to `/change-password` page
   - [ ] See "Change Your Password" form

4. **Change Password**
   - Enter a new password (min 8 chars)
   - Confirm the new password
   - Click "Change Password"

5. **Expected Result** ✅
   - [ ] Alert: "Password changed successfully! Please log in again with your new password."
   - [ ] Automatically signed out
   - [ ] Redirected to login page

6. **Login with New Password**
   - Enter the username
   - Enter the NEW password you just set
   - Click "Sign In"

7. **Expected Result** ✅
   - [ ] Login successful
   - [ ] Redirected to student dashboard
   - [ ] Dashboard loads and stays loaded (no redirect loop)
   - [ ] Can see "Programs" and "Exams" tabs

---

## Test Scenario 4: Copy Buttons Work Correctly

### Objective
Verify all copy buttons in the success modal work.

### Steps

1. **Repeat Test Scenario 2** (assign credentials to another student)
   - Register another student first if needed
   - Assign credentials
   - Success modal appears

2. **Test Each Copy Button**
   
   **Email Copy:**
   - [ ] Click "Copy" next to email
   - [ ] Open Notepad or any text editor
   - [ ] Paste (Ctrl+V)
   - [ ] Verify email address is pasted correctly

   **Phone Copy (if provided):**
   - [ ] Click "Copy" next to phone
   - [ ] Paste in text editor
   - [ ] Verify phone number is pasted correctly

   **Username Copy:**
   - [ ] Click "Copy" next to username
   - [ ] Paste in text editor
   - [ ] Verify username is pasted correctly

   **Password Copy:**
   - [ ] Click "Copy" next to password
   - [ ] Paste in text editor
   - [ ] Verify password is pasted correctly

---

## Test Scenario 5: Visual Design Check

### Objective
Verify the UI looks professional and polished.

### Checklist

**Success Modal:**
- [ ] Modal is centered on screen
- [ ] Has proper shadow and rounded corners
- [ ] Green checkmark icon is visible and properly sized
- [ ] Blue reminder box stands out
- [ ] Yellow credentials box is clearly visible
- [ ] All text is readable
- [ ] Proper spacing between sections
- [ ] Icons are aligned with text
- [ ] Copy buttons are clearly visible
- [ ] "Done" button is prominent

**Login Page - PENDING Message:**
- [ ] Blue background (not red)
- [ ] Info icon (not error icon)
- [ ] Message is easy to read
- [ ] Proper padding and spacing
- [ ] Stands out from the form

---

## Test Scenario 6: Edge Cases

### Test 6A: Student Without Phone Number

1. Register a student WITHOUT providing phone number
2. Assign credentials as admin
3. **Expected:** Success modal should NOT show phone field
4. **Check:** [ ] Phone section is hidden when no phone provided

### Test 6B: Multiple Students

1. Register 3 different students
2. Assign credentials to all 3, one by one
3. **Expected:** Success modal appears for each one
4. **Check:** [ ] Each modal shows correct student information
5. **Check:** [ ] Pending count decreases correctly

### Test 6C: Cancel Assign Modal

1. Click "Assign Credentials" for a student
2. Click "Cancel" button
3. **Expected:** Modal closes without assigning
4. **Check:** [ ] Student still in pending list
5. **Check:** [ ] No success modal appears

---

## Troubleshooting

### Issue: Success Modal Doesn't Appear
**Solution:** 
- Check browser console (F12) for errors
- Verify the assign-credentials API returned success
- Refresh the page and try again

### Issue: Copy Buttons Don't Work
**Solution:**
- Check if browser has clipboard permissions
- Try in a different browser
- Check browser console for errors

### Issue: PENDING Message Shows Red Instead of Blue
**Solution:**
- Check if the error message contains "under review"
- Verify the auth.ts file has the correct error codes
- Check browser console for authentication errors

---

## Success Criteria

All tests pass if:
- ✅ PENDING students see blue info message
- ✅ Success modal appears after assigning credentials
- ✅ All copy buttons work correctly
- ✅ Student contact info is displayed
- ✅ Credentials are displayed correctly
- ✅ Reminder message is visible
- ✅ Approved students can login successfully
- ✅ UI looks professional and polished

---

## Current Test Status

**Test Scenario 1:** ⬜ Not Started
**Test Scenario 2:** ⬜ Not Started
**Test Scenario 3:** ⬜ Not Started
**Test Scenario 4:** ⬜ Not Started
**Test Scenario 5:** ⬜ Not Started
**Test Scenario 6:** ⬜ Not Started

---

## Notes

- Take screenshots of the success modal for documentation
- Note any UI issues or improvements
- Test in different browsers if possible (Chrome, Firefox, Edge)
- Test on different screen sizes if possible

---

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Check database for students
node check-all-piyush.js

# Verify status consistency
node verify-status-consistency.js
```

---

## Report Issues

If you find any issues during testing, note:
1. Which test scenario
2. What you expected
3. What actually happened
4. Browser and version
5. Screenshots if possible
