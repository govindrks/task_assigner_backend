# Task Authorization Implementation - Complete Guide

## 📋 Documentation Index

This implementation includes comprehensive documentation. Use this guide to find what you need:

### For Quick Understanding
1. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** ⭐ START HERE
   - 2-minute overview
   - Permission matrix
   - Common scenarios
   - Error codes

### For Detailed Understanding
2. **[TASK_AUTHORIZATION.md](TASK_AUTHORIZATION.md)**
   - Complete authorization flow
   - Database schema reference
   - All endpoints explained
   - Migration notes
   - Full testing checklist

3. **[AUTHORIZATION_VISUAL_GUIDE.md](AUTHORIZATION_VISUAL_GUIDE.md)**
   - Visual diagrams
   - Decision trees
   - Request flow charts
   - Permission models

### For Implementation
4. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**
   - What was changed
   - Example workflows
   - API changes required
   - Frontend tips

5. **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)**
   - What was implemented
   - Verification checklist
   - Testing requirements
   - Files modified

### For Testing
6. **[API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)**
   - 15+ test cases
   - Real curl examples
   - Expected responses
   - Error scenarios
   - Testing tips

---

## 🎯 Quick Start

### For Backend Developers
1. Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (5 min)
2. Review [controllers/task.controller.js](controllers/task.controller.js) changes
3. Check [utils/roleCheck.js](utils/roleCheck.js) helper functions
4. Run tests from [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)

### For Frontend Developers
1. Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (5 min)
2. Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Frontend Tips section
3. Review [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for request/response formats
4. Test with [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) examples

### For QA / Testers
1. Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Follow [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) - Testing Verification section
3. Use [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for test cases
4. Reference [AUTHORIZATION_VISUAL_GUIDE.md](AUTHORIZATION_VISUAL_GUIDE.md) for understanding flows

---

## 🔑 Core Concepts

### The Two User Roles

#### **Organization Admin**
- Created the organization
- OR explicitly assigned ADMIN role
- Can: Create, Update (any field), Delete, View All, Assign tasks
- **Key Permission**: Can update ANY field of ANY task

#### **Organization Member** 
- Invited to organization and accepted
- Cannot create tasks
- Can: View assigned tasks only, Update priority only, Mark done
- **Key Limitation**: Can only update priority field

### The Golden Rule
```
organizationId is REQUIRED as query parameter for all task endpoints
```

Example:
```bash
GET /tasks?organizationId=123
PUT /tasks/:id?organizationId=123
DELETE /tasks/:id?organizationId=123
```

---

## 📊 Permission Summary

| Operation | Admin | Member | Non-Member |
|-----------|-------|--------|-----------|
| Create Task | ✅ | ❌ | ❌ |
| View All Tasks | ✅ | ❌ | ❌ |
| View Assigned Task | ✅ | ✅ | ❌ |
| Update Any Field | ✅ | ❌ | ❌ |
| Update Priority | ✅ | ✅ | ❌ |
| Assign Task | ✅ | ❌ | ❌ |
| Delete Task | ✅ | ❌ | ❌ |
| Mark Done | ✅ | ✅ | ❌ |

---

## 🛠️ What Was Implemented

### New Files Created
```
utils/roleCheck.js                  Helper functions for role checking
TASK_AUTHORIZATION.md               Complete technical documentation
AUTHORIZATION_VISUAL_GUIDE.md       Visual diagrams and flows
IMPLEMENTATION_SUMMARY.md            Overview of changes
IMPLEMENTATION_CHECKLIST.md          Verification checklist
QUICK_REFERENCE.md                  Quick lookup guide
API_TESTING_GUIDE.md                Testing examples
README_AUTHORIZATION.md             This file
```

### Files Modified
```
controllers/task.controller.js       All functions updated with authorization
routes/task.route.js                Updated comments
```

### No Changes Needed (Compatible)
```
models/task.model.js
models/organization.model.js
models/user.model.js
middleware/auth.middleware.js
```

---

## 🚀 Key Implementation Features

### 1. Real-Time Role Checking
- Roles checked on every request
- No caching (always up-to-date)
- Creator always treated as admin

### 2. Field-Level Authorization
- Admins: Can update title, description, dueDate, priority, status, assignedTo
- Members: Can ONLY update priority

### 3. Member Validation
- When assigning task, system validates assignee is organization member
- Prevents assigning to non-members

### 4. Clear Error Messages
- Users understand why action failed
- Different error codes for different issues

### 5. Notifications & Logging
- Admins get notified when members update priority
- Members get notified when admin updates their tasks
- All changes logged for audit trail

---

## 📝 Example Usage

### Admin Creates and Assigns Task
```javascript
POST /tasks
{
  "title": "Design UI",
  "organizationId": "org123",
  "assignedTo": "member456"
}
// ✅ Success - Member can now see and work on this task
```

### Member Updates Priority
```javascript
PUT /tasks/task789?organizationId=org123
{
  "priority": "HIGH"
}
// ✅ Success - Only priority changes
```

### Admin Full Update
```javascript
PUT /tasks/task789?organizationId=org123
{
  "title": "Updated Title",
  "priority": "URGENT",
  "status": "IN_PROGRESS",
  "assignedTo": "member999"
}
// ✅ Success - All fields updated, member reassigned
```

### Member Cannot Delete
```javascript
DELETE /tasks/task789?organizationId=org123
// ❌ Error: "Only organization admins can delete tasks"
```

---

## 🧪 Testing Overview

Total test cases provided: **15+**

Categories:
- Create task tests (3)
- View task tests (4)
- Update task tests (4)
- Delete task tests (2)
- Mark done tests (2)
- Error scenario tests (multiple)

See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for all examples.

---

## 🔍 How Authorization Works

### Step-by-Step Process

```
1. Request arrives with organizationId
2. System checks: Is user authenticated? No → 401
3. System checks: Is user member of organization? No → 403
4. System determines: What is user's role?
   - Creator/ADMIN? → Full permissions
   - MEMBER? → Limited permissions
5. Based on role, check if user can perform specific action
6. If authorized, perform operation
7. If not authorized, return 403 with clear message
8. Send notifications and log activities
9. Return result to user
```

---

## 📚 File Organization

```
Backend/
├── controllers/
│   └── task.controller.js          ← Updated with authorization
├── routes/
│   └── task.route.js               ← Updated comments
├── utils/
│   └── roleCheck.js                ← NEW: Role checking functions
├── models/
│   ├── task.model.js               (No changes)
│   ├── organization.model.js        (No changes)
│   └── user.model.js               (No changes)
└── Documentation/
    ├── QUICK_REFERENCE.md          ← START HERE
    ├── TASK_AUTHORIZATION.md
    ├── AUTHORIZATION_VISUAL_GUIDE.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── IMPLEMENTATION_CHECKLIST.md
    ├── API_TESTING_GUIDE.md
    └── README_AUTHORIZATION.md      ← This file
```

---

## 💡 Important Notes

### For All Developers
- Always include `organizationId` in query parameters
- Always handle 403 errors (unauthorized)
- Organization creator is always admin - even if not explicitly listed

### For Frontend Developers  
- Hide task creation button for non-admins
- Only show edit fields that user can update
- Handle error responses gracefully
- Show member can only update priority

### For Backend Developers
- New imports in task.controller.js
- Helper functions in roleCheck.js
- Check the imports before deploying
- Test with different user roles

### For DevOps/Deployment
- No database migrations needed
- No data loss from this change
- Backward compatible
- Can deploy immediately

---

## ⚠️ Common Mistakes to Avoid

### ❌ Don't
- Forget to pass `organizationId` parameter
- Check user.role instead of organization role
- Cache role checks
- Allow members to create tasks
- Allow non-admins to delete tasks
- Assign tasks to non-members
- Update fields that require admin permission as member

### ✅ Do
- Always pass `organizationId` in query
- Use `isOrganizationAdmin()` helper function
- Check permissions on every operation
- Return clear error messages
- Log all activities
- Send notifications on updates
- Validate assignee membership

---

## 🆘 Troubleshooting

### Problem: Getting 403 Forbidden
**Solution**: Check if user has the right role for that organization

### Problem: organizationId parameter not recognized
**Solution**: Verify it's being passed as a query parameter, not in body

### Problem: Member can update all fields
**Solution**: Check that frontend is only sending `priority` field for members

### Problem: Can assign task to non-member
**Solution**: System validates - check if user is actually organization member

---

## 📞 Getting Help

1. **Quick questions**: Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. **Technical details**: See [TASK_AUTHORIZATION.md](TASK_AUTHORIZATION.md)
3. **Visual explanation**: Review [AUTHORIZATION_VISUAL_GUIDE.md](AUTHORIZATION_VISUAL_GUIDE.md)
4. **Test examples**: Use [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
5. **Change details**: Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## ✅ Pre-Deployment Checklist

- [ ] Backend code reviewed
- [ ] All files modified correctly
- [ ] No syntax errors
- [ ] Tests pass locally
- [ ] Authorization logic verified
- [ ] Error messages clear
- [ ] Notifications working
- [ ] Activity logging working
- [ ] Frontend ready to integrate
- [ ] Documentation reviewed

---

## 📈 Next Steps

1. **Review** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. **Understand** the authorization model
3. **Run tests** from [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
4. **Integrate** with frontend
5. **Deploy** with confidence

---

**Implementation Date**: January 29, 2026
**Status**: ✅ Complete and Ready for Testing
**Version**: 1.0.0
