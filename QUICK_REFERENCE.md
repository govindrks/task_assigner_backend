# Quick Reference: Task Authorization Rules

## User Roles

| Role | How Acquired | Task Permissions |
|------|-------------|-----------------|
| **Admin** | Organization creator OR explicitly assigned | ✅ Create, Read All, Update Any, Delete |
| **Member** | Accepts organization invite | ✅ Read Own, Update Priority Only, Mark Done |

## Permission Matrix

| Action | Admin | Member | Non-Member |
|--------|-------|--------|-----------|
| Create Task | ✅ | ❌ | ❌ |
| View All Tasks | ✅ | ❌ | ❌ |
| View Assigned Task | ✅ | ✅ | ❌ |
| View Other's Task | ✅ | ❌ | ❌ |
| Update Title | ✅ | ❌ | ❌ |
| Update Description | ✅ | ❌ | ❌ |
| Update Due Date | ✅ | ❌ | ❌ |
| Update Priority | ✅ | ✅ | ❌ |
| Update Status | ✅ | Only to DONE | ❌ |
| Reassign Task | ✅ | ❌ | ❌ |
| Delete Task | ✅ | ❌ | ❌ |
| Mark Done | ✅ | ✅* | ❌ |

**\* Only if assigned to them*

## API Endpoints

### Create Task (POST)
```javascript
POST /tasks
Authorization: {admin-token}
Body: {
  title: string (required),
  description: string,
  organizationId: string (required),
  assignedTo: string (optional, must be member),
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  dueDate: date
}
```
**Admin Only** ❌ Members get 403 error

---

### List Tasks (GET)
```javascript
GET /tasks?organizationId={id}
Authorization: {user-token}
Response:
- Admin: All tasks in organization
- Member: Only assigned tasks
```

---

### Get Single Task (GET)
```javascript
GET /tasks/{taskId}?organizationId={id}
Authorization: {user-token}
```
**Allowed:** Admin OR Task Assignee

---

### Update Task (PUT)
```javascript
PUT /tasks/{taskId}?organizationId={id}
Authorization: {user-token}
Body: {
  title, description, dueDate, priority, status, assignedTo
}
```

**Admin:** Can update any field
**Member:** Can only update `priority`

---

### Mark Done (PATCH)
```javascript
PATCH /tasks/{taskId}/mark-done?organizationId={id}
Authorization: {user-token}
```
**Assignee Only** ❌ Non-assigned get 403 error

---

### Delete Task (DELETE)
```javascript
DELETE /tasks/{taskId}?organizationId={id}
Authorization: {user-token}
```
**Admin Only** ❌ Members get 403 error

---

## Key Rules

✅ **Always required**: `organizationId` in query parameters for task endpoints

✅ **Organization creator** is automatically admin

✅ **Members can**: See their tasks, update priority, mark done

✅ **Only admins can**: Create, delete, fully edit, reassign tasks

✅ **All operations** require authentication

✅ **All validation** happens in real-time against database

---

## Error Codes

| Code | Scenario | Message |
|------|----------|---------|
| 400 | Missing organizationId | "organizationId is required" |
| 400 | Invalid assignee | "Assigned user must be a member" |
| 403 | Non-admin creates | "Only organization admins can create tasks" |
| 403 | Member updates field | "Not authorized to update this task" |
| 403 | Non-assignee marks done | "Only the assigned user can mark this task as done" |
| 403 | Member deletes | "Only organization admins can delete tasks" |
| 404 | Task not found | "Task not found" |

---

## Implementation Files

- [controllers/task.controller.js](controllers/task.controller.js) - Authorization logic
- [utils/roleCheck.js](utils/roleCheck.js) - Role verification helpers
- [routes/task.route.js](routes/task.route.js) - API routes
- [TASK_AUTHORIZATION.md](TASK_AUTHORIZATION.md) - Full documentation
- [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) - Testing examples

---

## Common Scenarios

### Scenario 1: Admin creates and assigns task
```javascript
// Admin creates task for specific member
POST /tasks
{
  "title": "Review Design",
  "organizationId": "org123",
  "assignedTo": "member456"
}
// ✅ Success - Member can now see this task
```

### Scenario 2: Member updates priority
```javascript
// Member can update priority of assigned task
PUT /tasks/task789?organizationId=org123
{
  "priority": "HIGH"
}
// ✅ Success - Only priority changes
```

### Scenario 3: Member tries to edit title
```javascript
// Member tries to change title
PUT /tasks/task789?organizationId=org123
{
  "title": "New Title",
  "priority": "HIGH"
}
// ✅ Priority changes, but title IGNORED (member can only update priority)
```

### Scenario 4: Admin fully edits task
```javascript
// Admin can change everything
PUT /tasks/task789?organizationId=org123
{
  "title": "Updated Title",
  "priority": "URGENT",
  "status": "IN_PROGRESS",
  "assignedTo": "member999"
}
// ✅ All fields updated
```

---

## Frontend Implementation Tips

```javascript
// Check if user is admin before showing edit button
const canEdit = userRole === 'ADMIN';

// Check if user can only update priority
const canUpdatePriority = userRole === 'MEMBER' || userRole === 'ADMIN';

// Check if user assigned to task
const isAssigned = task.assignedTo === userId;

// Show/hide buttons based on role
{userRole === 'ADMIN' && <CreateTaskButton />}
{userRole === 'ADMIN' && <DeleteTaskButton />}
{isAssigned && <MarkDoneButton />}
{isAssigned && <UpdatePriorityField />}
{userRole === 'ADMIN' && <UpdateAllFieldsForm />}
```
