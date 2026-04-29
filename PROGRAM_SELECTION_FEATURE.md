# Program Selection Feature

## Overview
Enhanced the signup form to allow users to select specific programs/courses under each school, rather than just selecting schools. This provides more granular control over program applications.

## Changes Made

### File Modified: `components/auth/SignupForm.tsx`

#### Previous Behavior:
- Users could only select entire schools
- No visibility into available programs
- Programs were shown as comma-separated text in description

#### New Behavior:
- Users can expand each school to see available programs
- Users can select specific programs within each school
- Visual feedback shows selected program count per school
- Validation requires at least one program to be selected

## User Interface

### School Selection Panel

#### Collapsed State:
```
┌─────────────────────────────────────────┐
│ ☐ School of Computer Science           │
│   0 programs selected                   │
│                                      ▼  │
└─────────────────────────────────────────┘
```

#### Expanded State with Selection:
```
┌─────────────────────────────────────────┐
│ ☑ School of Computer Science           │
│   2 programs selected                   │
│                                      ▲  │
├─────────────────────────────────────────┤
│   AVAILABLE PROGRAMS                    │
│   ☑ B.Tech CSE                         │
│   ☑ M.Tech CSE                         │
│   ☐ PhD CSE                            │
└─────────────────────────────────────────┘
```

### Visual Features:

1. **School Header**:
   - Checkbox indicator (checked if any programs selected)
   - School name
   - Selected program count
   - Expand/collapse arrow

2. **Programs Section** (when expanded):
   - Gray background to distinguish from school header
   - "AVAILABLE PROGRAMS" label
   - Individual checkboxes for each program
   - Hover effect on program rows

3. **Selection Counter**:
   - Shows total programs selected across all schools
   - Example: "5 program(s) selected"

## Technical Implementation

### State Management

```typescript
interface SelectedSchoolPrograms {
  [schoolId: string]: string[]; // schoolId -> array of programIds
}

const [selectedSchoolPrograms, setSelectedSchoolPrograms] = useState<SelectedSchoolPrograms>({});
const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
```

### Key Functions

#### 1. Toggle School Expansion
```typescript
const toggleSchool = (schoolId: string) => {
  setExpandedSchools((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(schoolId)) {
      newSet.delete(schoolId);
    } else {
      newSet.add(schoolId);
    }
    return newSet;
  });
};
```

#### 2. Toggle Program Selection
```typescript
const toggleProgram = (schoolId: string, programId: string) => {
  setSelectedSchoolPrograms((prev) => {
    const newSelection = { ...prev };
    
    if (!newSelection[schoolId]) {
      // First program for this school
      newSelection[schoolId] = [programId];
    } else if (newSelection[schoolId].includes(programId)) {
      // Remove program
      newSelection[schoolId] = newSelection[schoolId].filter(id => id !== programId);
      // Remove school if no programs selected
      if (newSelection[schoolId].length === 0) {
        delete newSelection[schoolId];
      }
    } else {
      // Add program
      newSelection[schoolId] = [...newSelection[schoolId], programId];
    }
    
    return newSelection;
  });
};
```

#### 3. Get Total Selected Count
```typescript
const getSelectedCount = () => {
  return Object.values(selectedSchoolPrograms)
    .reduce((total, programs) => total + programs.length, 0);
};
```

### Data Transformation for API

```typescript
// Transform selectedSchoolPrograms to API format
const selectedSchools = Object.entries(selectedSchoolPrograms).map(([schoolId, programIds]) => ({
  schoolId,
  programIds,
}));
```

## Validation

### Required Field:
- At least one program must be selected
- Error message: "Please select at least one program"

### Visual Indicators:
- Red asterisk (*) next to label
- Selection counter shows "0 program(s) selected" when empty
- Error message appears if user tries to submit without selections

## User Experience Improvements

✅ **Granular Control**: Select specific programs instead of entire schools
✅ **Clear Visibility**: See all available programs before selecting
✅ **Visual Feedback**: 
   - Checkmark on school header when programs selected
   - Program count displayed
   - Total selection count at top
✅ **Intuitive Interaction**: Click school to expand, click programs to select
✅ **Smooth Animations**: Expand/collapse with rotation animation
✅ **Hover Effects**: Visual feedback on interactive elements
✅ **Accessibility**: Proper labels and keyboard navigation support

## Example User Flow

1. **User opens signup form**
2. **Fills in personal details** (name, email, password)
3. **Scrolls to school selection**
4. **Clicks on "School of Computer Science"** → Expands to show programs
5. **Selects "B.Tech CSE" and "M.Tech CSE"** → Checkboxes checked
6. **School header shows "2 programs selected"**
7. **Clicks on "School of Business"** → Expands
8. **Selects "MBA"** → Checkbox checked
9. **Top counter shows "3 program(s) selected"**
10. **Clicks "Create Account"** → Submits with selected programs

## API Integration

### Request Format:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "selectedSchools": [
    {
      "schoolId": "school-cse-id",
      "programIds": ["btech-cse-id", "mtech-cse-id"]
    },
    {
      "schoolId": "school-business-id",
      "programIds": ["mba-id"]
    }
  ]
}
```

## Design Consistency

### Colors:
- **Navy Blue (#1F3A68)**: Selected checkboxes, focus states
- **Gray (#F3F4F6)**: Program section background
- **White**: School header background
- **Border Gray (#E5E7EB)**: Borders and dividers

### Spacing:
- **Padding**: 16px (p-4) for school headers
- **Gap**: 8px between programs
- **Border**: 2px for main container

### Typography:
- **School Name**: 14px, font-semibold
- **Program Count**: 12px, navy blue
- **Program Name**: 14px, regular
- **Section Label**: 12px, uppercase, gray

## Testing Checklist

- [ ] Schools load correctly from API
- [ ] Click school to expand/collapse
- [ ] Select individual programs
- [ ] Deselect programs
- [ ] School checkbox reflects program selection
- [ ] Program count updates correctly
- [ ] Total count updates correctly
- [ ] Validation error shows when no programs selected
- [ ] Form submits with correct data structure
- [ ] Multiple schools can be expanded simultaneously
- [ ] Hover effects work on all interactive elements
- [ ] Animations are smooth
- [ ] Responsive on different screen sizes

## Benefits

✅ **More Control**: Users select exactly which programs they want
✅ **Better UX**: Clear visibility of all options
✅ **Reduced Errors**: Users know exactly what they're applying for
✅ **Scalability**: Easy to add more schools/programs
✅ **Professional**: Matches modern application form standards

---

**Status**: ✅ Complete
**Date**: April 17, 2026
**Developer**: Kiro AI
