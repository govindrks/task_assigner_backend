# Task Authorization - API Testing Guide

## Setup
Replace the following placeholders in examples:
- `{ADMIN_TOKEN}` - JWT token of organization admin
- `{MEMBER_TOKEN}` - JWT token of organization member
- `{ORG_ID}` - Organization ID
- `{TASK_ID}` - Task ID
- `{MEMBER_USER_ID}` - User ID of a member

## Test Cases

### 1. Admin Creates Task and Assigns to Member

#### Request:
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Homepage",
    "description": "Create mockups for the homepage",
    "organizationId": "{ORG_ID}",
    "assignedTo": "{MEMBER_USER_ID}",
    "priority": "HIGH",
    "dueDate": "2026-02-15"
  }'
```

#### Expected Response (201):
```json
{
  "_id": "{TASK_ID}",
  "title": "Design Homepage",
  "description": "Create mockups for the homepage",
  "status": "TODO",
  "priority": "HIGH",
  "organization": "{ORG_ID}",
  "createdBy": "{ADMIN_USER_ID}",
  "assignedTo": "{MEMBER_USER_ID}",
  "dueDate": "2026-02-15T00:00:00.000Z",
  "createdAt": "2026-01-29T...",
  "updatedAt": "2026-01-29T..."
}
```

---

### 2. Member Cannot Create Task

#### Request:
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer {MEMBER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Impossible Task",
    "organizationId": "{ORG_ID}"
  }'
```

#### Expected Response (403):
```json
{
  "message": "Only organization admins can create tasks"
}
```

---

### 3. Admin Views All Tasks in Organization

#### Request:
```bash
curl -X GET "http://localhost:5000/api/tasks?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

#### Expected Response (200):
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "task1",
      "title": "Design Homepage",
      "assignedTo": "{MEMBER_USER_ID}",
      "status": "TODO",
      "priority": "HIGH"
    },
    {
      "_id": "task2",
      "title": "Setup Database",
      "assignedTo": "{ANOTHER_MEMBER_ID}",
      "status": "IN_PROGRESS",
      "priority": "URGENT"
    }
  ]
}
```

---

### 4. Member Views Only Their Assigned Tasks

#### Request:
```bash
curl -X GET "http://localhost:5000/api/tasks?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {MEMBER_TOKEN}"
```

#### Expected Response (200):
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "task1",
      "title": "Design Homepage",
      "assignedTo": "{MEMBER_USER_ID}",
      "status": "TODO",
      "priority": "HIGH"
    }
  ]
}
```

Note: Only shows tasks assigned to this member, not the other task assigned to another member.

---

### 5. Get Single Task - Admin Access

#### Request:
```bash
curl -X GET "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

#### Expected Response (200):
```json
{
  "_id": "{TASK_ID}",
  "title": "Design Homepage",
  "description": "Create mockups for the homepage",
  "status": "TODO",
  "priority": "HIGH",
  "assignedTo": "{MEMBER_USER_ID}",
  "createdBy": "{ADMIN_USER_ID}",
  "organization": "{ORG_ID}"
}
```

---

### 6. Get Single Task - Assigned Member Can View

#### Request:
```bash
curl -X GET "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {MEMBER_TOKEN}"
```

#### Expected Response (200):
```json
{
  "_id": "{TASK_ID}",
  "title": "Design Homepage",
  ...
}
```

---

### 7. Get Task - Unauthorized Member Cannot View

#### Request:
```bash
curl -X GET "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {OTHER_MEMBER_TOKEN}"
```

Note: OTHER_MEMBER_TOKEN is from a member not assigned to this task

#### Expected Response (403):
```json
{
  "message": "Not authorized to view this task"
}
```

---

### 8. Admin Updates All Task Fields

#### Request:
```bash
curl -X PUT "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Update: Design Complete Homepage",
    "description": "Create full mockups including all pages",
    "priority": "MEDIUM",
    "status": "IN_PROGRESS",
    "dueDate": "2026-02-28",
    "assignedTo": "{DIFFERENT_MEMBER_ID}"
  }'
```

#### Expected Response (200):
```json
{
  "_id": "{TASK_ID}",
  "title": "Update: Design Complete Homepage",
  "description": "Create full mockups including all pages",
  "priority": "MEDIUM",
  "status": "IN_PROGRESS",
  "assignedTo": "{DIFFERENT_MEMBER_ID}",
  "updatedBy": "{ADMIN_USER_ID}",
  "updatedAt": "2026-01-29T..."
}
```

---

### 9. Member Updates Only Priority

#### Request:
```bash
curl -X PUT "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {MEMBER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "URGENT"
  }'
```

#### Expected Response (200):
```json
{
  "_id": "{TASK_ID}",
  "title": "Design Homepage",
  "priority": "URGENT",
  "status": "TODO",
  "updatedBy": "{MEMBER_USER_ID}",
  "updatedAt": "2026-01-29T..."
}
```

---

### 10. Member Tries to Update Other Fields (Fails)

#### Request:
```bash
curl -X PUT "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {MEMBER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "I Want to Change the Title"
  }'
```

#### Expected Response (200):
```json
{
  "_id": "{TASK_ID}",
  "title": "Design Homepage",
  "status": "TODO"
}
```

Note: The title is not updated, only priority field is processed by members.

---

### 11. Member Marks Task as Done

#### Request:
```bash
curl -X PATCH "http://localhost:5000/api/tasks/{TASK_ID}/mark-done?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {MEMBER_TOKEN}"
```

#### Expected Response (200):
```json
{
  "_id": "{TASK_ID}",
  "title": "Design Homepage",
  "status": "DONE",
  "priority": "URGENT",
  "updatedBy": "{MEMBER_USER_ID}",
  "updatedAt": "2026-01-29T..."
}
```

---

### 12. Non-Assigned User Cannot Mark Task as Done

#### Request:
```bash
curl -X PATCH "http://localhost:5000/api/tasks/{TASK_ID}/mark-done?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {OTHER_MEMBER_TOKEN}"
```

#### Expected Response (403):
```json
{
  "message": "Only the assigned user can mark this task as done"
}
```

---

### 13. Admin Deletes Task

#### Request:
```bash
curl -X DELETE "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

#### Expected Response (200):
```json
{
  "message": "Task deleted successfully"
}
```

---

### 14. Member Cannot Delete Task

#### Request:
```bash
curl -X DELETE "http://localhost:5000/api/tasks/{TASK_ID}?organizationId={ORG_ID}" \
  -H "Authorization: Bearer {MEMBER_TOKEN}"
```

#### Expected Response (403):
```json
{
  "message": "Only organization admins can delete tasks"
}
```

---

### 15. Admin Assigns Task to Non-Member (Fails)

#### Request:
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task for Random Person",
    "organizationId": "{ORG_ID}",
    "assignedTo": "{NON_MEMBER_USER_ID}"
  }'
```

#### Expected Response (400):
```json
{
  "message": "Assigned user must be a member of the organization"
}
```

---

## Common Error Scenarios

### Missing organizationId
```
Status: 400
{
  "message": "organizationId is required"
}
```

### Not Authenticated
```
Status: 401
{
  "message": "Unauthorized"
}
```

### Task Not Found
```
Status: 404
{
  "message": "Task not found"
}
```

### Insufficient Permissions
```
Status: 403
{
  "message": "Not authorized to [action] this task"
}
```

## Testing Tips

1. **Use Postman or Insomnia** for testing REST APIs
2. **Get tokens** by logging in as different users
3. **Keep track of User IDs** for test members
4. **Test with admin token first** to create tasks and members
5. **Then test with member tokens** to verify restrictions
6. **Check error messages** to understand permission boundaries
7. **Verify notifications** are sent when admin updates tasks
8. **Check activity logs** for task creation/deletion
