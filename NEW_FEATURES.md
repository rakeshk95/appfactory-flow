# New Performance Review Screens

This document describes the new screens implemented for the performance review system.

## Overview

The application now includes three new role-based screens for managing the performance review process:

1. **Mentee Screen** - For employees to select reviewers
2. **Mentor Screen** - For mentors to approve reviewer selections
3. **Reviewer Screen** - For reviewers to provide feedback

## Role-Based Access

### Employee (Mentee) Role
- **Login**: Use any email that doesn't contain special keywords
- **Dashboard**: `/dashboard`
- **Select Reviewers**: `/dashboard/select-reviewers`

### Mentor Role
- **Login**: Use email containing "mentor@"
- **Dashboard**: `/dashboard`
- **Review & Approve**: `/dashboard/review-approve`

### Reviewer Role
- **Login**: Use email containing "committee@"
- **Dashboard**: `/dashboard`
- **Provide Feedback**: `/dashboard/feedback`

### HR Lead Role
- **Login**: Use email containing "hr@"
- **Dashboard**: `/dashboard`
- **Initiate Performance Cycle**: `/dashboard/initiate-cycle`
- **Review Performance Data**: `/dashboard/review-data`

### System Administrator Role
- **Login**: Use email containing "admin@"
- **Dashboard**: `/admin`
- **User Master**: `/admin/users`
- **Location Master**: `/admin/locations`
- **Review Cycle Master**: `/admin/review-cycles`

## Screen Details

### 1. Mentee Screen - Select Reviewers

**Features:**
- View active performance cycle information
- Select multiple reviewers from available list
- Submit reviewer list to mentor for approval
- View submission status (pending, approved, sent back)
- Edit and resubmit if mentor sends back the list
- See mentor feedback when list is sent back

**Key Components:**
- Performance cycle display
- Reviewer selection with checkboxes
- Submission status tracking
- Edit functionality for sent-back submissions

### 2. Mentor Screen - Review and Approve Reviewers

**Features:**
- View active performance cycle
- See list of mentees with pending reviewer list approvals
- Review submitted reviewer lists from mentees
- Approve or send back reviewer lists with feedback
- View previously processed submissions

**Key Components:**
- Pending approvals section
- Review dialog with detailed submission view
- Approve/Send back actions with feedback
- Historical submissions tracking

### 3. Reviewer Screen - Provide Feedback

**Features:**
- View list of employees assigned for review
- Initiate new review for each employee
- Comprehensive feedback form with:
  - Strengths and key strengths
  - Areas for improvement
  - Overall rating (Tracking below/expected/above expectations)
- Save reviews as draft or submit
- View and edit draft reviews
- Track submitted reviews

**Key Components:**
- Employee assignment list
- Feedback form dialog
- Draft management
- Review status tracking

## Technical Implementation

### New Files Created:
- `src/pages/MenteeSelectReviewers.tsx` - Mentee screen
- `src/pages/MentorReviewApproval.tsx` - Mentor screen
- `src/pages/ReviewerFeedback.tsx` - Reviewer screen
- `src/pages/GeneralDashboard.tsx` - Role-specific dashboard
- `src/components/layout/GeneralLayout.tsx` - Layout for new roles

### Updated Files:
- `src/App.tsx` - Added new routes
- `src/components/layout/AppSidebar.tsx` - Added navigation for new roles

### Data Storage:
- Uses localStorage for demo purposes
- In production, this would connect to a backend API
- Mock data is provided for demonstration

## Usage Instructions

1. **Login with appropriate role email**
2. **Navigate to the relevant screen based on your role**
3. **Follow the workflow for your specific role**

### Example Workflow:
1. Employee logs in and selects reviewers
2. Employee submits reviewer list to mentor
3. Mentor reviews and approves/sends back the list
4. If approved, reviewers can provide feedback
5. Reviewers complete feedback forms for assigned employees

## Mock Data

The application includes mock data for demonstration:
- Sample employees and reviewers
- Mock performance cycles
- Example submissions and feedback

## Future Enhancements

- Backend API integration
- Real-time notifications
- Email notifications
- Advanced filtering and search
- Export functionality
- Audit trails
