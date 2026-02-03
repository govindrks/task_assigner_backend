# Task Authorization System - Visual Guide

## Organization Structure

```
Organization
├── createdBy: User A (ALWAYS ADMIN)
├── members: [
│   ├── { user: User A, role: "ADMIN" }      ← Creator (always admin)
│   ├── { user: User B, role: "MEMBER" }     ← Invited member
│   └── { user: User C, role: "MEMBER" }     ← Invited member
│]
└── tasks: [
    ├── Task 1 (assigned to User B)
    ├── Task 2 (assigned to User C)
    └── Task 3 (assigned to User A)
]
```

---

## Permission Model

### Admin User (Organization Creator)
```
User A (Admin)
    ├─ Can VIEW
    │  ├─ All tasks in organization
    │  └─ Specific task details
    ├─ Can CREATE
    │  ├─ New tasks
    │  └─ Assign to any member
    ├─ Can UPDATE
    │  ├─ Title ✅
    │  ├─ Description ✅
    │  ├─ Priority ✅
    │  ├─ Status ✅
    │  ├─ Due Date ✅
    │  └─ Reassign ✅
    ├─ Can DELETE
    │  └─ Any task ✅
    └─ Can MARK DONE
       └─ Any task ✅
```

### Member User (Invited)
```
User B (Member)
    ├─ Can VIEW
    │  ├─ Own assigned tasks only
    │  └─ Cannot see other members' tasks
    ├─ Cannot CREATE
    │  └─ Get 403 Forbidden
    ├─ Can UPDATE
    │  └─ Priority only ✅ (other fields ignored)
    ├─ Cannot DELETE
    │  └─ Get 403 Forbidden
    └─ Can MARK DONE
       └─ Assigned tasks only ✅
```

---

## Request Flow Diagram

### Creating a Task

```
Admin POST /tasks
  │
  ├─ Check authentication ✓
  │
  ├─ Validate: title + organizationId required ✓
  │
  ├─ Verify organization exists ✓
  │
  ├─ Check: User is organization admin?
  │  │
  │  ├─ YES → Continue
  │  └─ NO → 403 Forbidden
  │
  ├─ If assignedTo provided:
  │  │
  │  └─ Check: Assignee is member?
  │     │
  │     ├─ YES → Continue
  │     └─ NO → 400 Bad Request
  │
  └─ Create task → 201 Created
```

### Updating a Task

```
User PUT /tasks/{id}?organizationId={id}
  │
  ├─ Check authentication ✓
  │
  ├─ Verify organizationId required ✓
  │
  ├─ Find task in organization ✓
  │
  ├─ Check: User is admin?
  │  │
  │  ├─ YES → Can update any field
  │  │        ├─ title ✓
  │  │        ├─ description ✓
  │  │        ├─ priority ✓
  │  │        ├─ status ✓
  │  │        ├─ dueDate ✓
  │  │        └─ assignedTo ✓ (validate member)
  │  │
  │  └─ NO → Check: Is task assigned to user?
  │           │
  │           ├─ YES → Can only update priority
  │           │        └─ All other fields ignored
  │           │
  │           └─ NO → 403 Forbidden
  │
  ├─ Apply updates
  │
  ├─ Send notifications
  │
  └─ Return updated task → 200 OK
```

### Getting Tasks

```
User GET /tasks?organizationId={id}
  │
  ├─ Check authentication ✓
  │
  ├─ Verify organizationId required ✓
  │
  ├─ Check: User is member of organization?
  │  │
  │  ├─ NO → 403 Forbidden
  │  │
  │  └─ YES → Continue
  │
  ├─ Check: User is admin?
  │  │
  │  ├─ YES → Return ALL tasks
  │  │
  │  └─ NO → Return ONLY assigned tasks
  │
  └─ Return tasks → 200 OK
```

---

## Decision Trees

### Can User Create Task?

```
START
  │
  ├─ Is user authenticated? 
  │  └─ NO → 401 Unauthorized
  │
  ├─ Is organizationId provided?
  │  └─ NO → 400 Bad Request
  │
  ├─ Is user admin of organization?
  │  │
  │  └─ NO → 403 Forbidden ❌
  │
  └─ YES → Create task ✅
```

### Can User Update Task Field X?

```
START
  │
  ├─ Is user authenticated?
  │  └─ NO → 401 Unauthorized
  │
  ├─ Is task in specified organization?
  │  └─ NO → 404 Not Found
  │
  ├─ Is user admin of organization?
  │  │
  │  ├─ YES → Can update ANY field ✅
  │  │
  │  └─ NO → Continue
  │
  ├─ Is task assigned to user?
  │  │
  │  ├─ NO → 403 Forbidden ❌
  │  │
  │  └─ YES → Continue
  │
  ├─ Is field "priority"?
  │  │
  │  ├─ YES → Can update ✅
  │  │
  │  └─ NO → Ignored ⚠️
  │
  └─ Update applied
```

### Can User Delete Task?

```
START
  │
  ├─ Is user authenticated?
  │  └─ NO → 401 Unauthorized
  │
  ├─ Is task in specified organization?
  │  └─ NO → 404 Not Found
  │
  ├─ Is user admin of organization?
  │  │
  │  ├─ YES → Delete task ✅
  │  │
  │  └─ NO → 403 Forbidden ❌
  │
  └─ Task deleted
```

---

## State Transitions

### Task Lifecycle by User Type

#### Admin User
```
CREATION        UPDATE         DELETION
   ├─ Creates ──────→ Can update ──────→ Can
   │                 any field         delete
   └─ Assigns to ──→ Can reassign ──→ Logs activity
      any member      to new member
```

#### Member User
```
ASSIGNMENT         UPDATE              COMPLETION
   ← Gets assigned ──→ Can update   ──→ Can mark
                      priority only     done
                   (other fields     (changes status
                    ignored)         to DONE)
```

---

## API Response Examples

### Success: Admin Creates Task
```
201 Created
{
  "_id": "task123",
  "title": "Design UI",
  "organizationId": "org123",
  "createdBy": "admin456",
  "assignedTo": "member789",
  "status": "TODO",
  "priority": "HIGH"
}
```

### Error: Member Cannot Create
```
403 Forbidden
{
  "message": "Only organization admins can create tasks"
}
```

### Success: Member Updates Priority
```
200 OK
{
  "_id": "task123",
  "title": "Design UI",              ← NOT changed
  "priority": "URGENT",              ← CHANGED
  "status": "TODO",                  ← NOT changed
  "updatedBy": "member789",
  "updatedAt": "2026-01-29T..."
}
```

### Success: Admin Updates Multiple Fields
```
200 OK
{
  "_id": "task123",
  "title": "Design Complete UI",     ← CHANGED
  "description": "Full page design", ← CHANGED
  "priority": "MEDIUM",              ← CHANGED
  "status": "IN_PROGRESS",           ← CHANGED
  "assignedTo": "member999",         ← CHANGED
  "updatedBy": "admin456",
  "updatedAt": "2026-01-29T..."
}
```

---

## Database Query Flow

### Get Tasks by User Type

#### For Admin
```javascript
// Query: Get all organization tasks
Task.find({ organization: organizationId })

// Returns: [Task1, Task2, Task3, ...]
```

#### For Member
```javascript
// Query: Get only member's assigned tasks
Task.find({ 
  organization: organizationId,
  assignedTo: userId
})

// Returns: [Task1, Task2, ...] (only assigned)
```

---

## Security Checks

### Authorization Checks Applied To Every Request

```
Request Received
  │
  1. Authentication Check
  │  └─ Verify JWT token valid
  │
  2. Authorization Check
  │  ├─ Is organizationId provided? (if needed)
  │  ├─ Does organization exist?
  │  ├─ Is user member of organization?
  │  └─ Does user have permission? (admin/member/assignee)
  │
  3. Ownership Check
  │  └─ Verify ownership or assignment
  │
  4. Data Validation
  │  └─ Validate request parameters
  │
  5. Operation Execution
  │  └─ Perform actual operation
  │
  6. Notification/Logging
  │  └─ Send notifications, log activities
  │
  Response Sent
```

---

## Member Visibility Matrix

```
                Task 1      Task 2      Task 3
            (Assigned     (Assigned   (Assigned
             to UserB)     to UserC)   to Admin)

User B
(Member)      ✅ VIEW      ❌ HIDDEN    ❌ HIDDEN
              ✅ UPDATE    
              ✅ EDIT      
              
User C                      ✅ VIEW     ❌ HIDDEN
(Member)      ❌ HIDDEN    ✅ UPDATE
                           ✅ EDIT
                           
Admin          ✅ VIEW     ✅ VIEW     ✅ VIEW
               ✅ EDIT     ✅ EDIT     ✅ EDIT
               ✅ DELETE   ✅ DELETE   ✅ DELETE
```

---

## Notifications Flow

```
Admin Updates Task
  │
  ├─ Task title changed? 
  │  └─ YES → Include in changes
  │
  ├─ Task priority changed?
  │  └─ YES → Include in changes
  │
  ├─ Task assigned to changed?
  │  └─ YES → Include in changes
  │
  └─ Send Notification to Assigned User
     └─ Type: TASK_UPDATED
        Message: "Task '{title}' was updated"
        Changes: [{ field, oldValue, newValue }, ...]
```

---

## Implementation Architecture

```
Request
  │
  ├─ Middleware: requireAuth
  │  └─ Verify user is authenticated
  │
  ├─ Controller: task.controller.js
  │  ├─ Validate request
  │  ├─ Check organization exists
  │  └─ Call roleCheck functions
  │
  ├─ Utility: roleCheck.js
  │  ├─ isOrganizationAdmin()
  │  ├─ isOrganizationMember()
  │  └─ getUserRoleInOrganization()
  │
  ├─ Model: Task, Organization
  │  └─ Database operations
  │
  └─ Response
     ├─ Success (2xx)
     ├─ Client Error (4xx)
     └─ Server Error (5xx)
```

---

## Summary

**The authorization system follows these principles:**

1. **Creator = Admin**: Organization creator is automatically admin
2. **Role-Based Access**: Permissions determined by user role (admin vs member)
3. **Principle of Least Privilege**: Members have minimal permissions
4. **Admin Override**: Admins can do anything within organization
5. **Explicit Authorization**: Every operation checked before execution
6. **Clear Errors**: Users get clear messages when unauthorized
7. **Auditability**: Activities logged, notifications sent
