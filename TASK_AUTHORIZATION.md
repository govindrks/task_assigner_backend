# Task Authorization and Access Control Implementation

## Overview
This document describes the role-based authorization system for task management in the Task Assigner App.

## Role Hierarchy

### Organization Admin
- **Definition**: The person who creates an organization OR is explicitly assigned the ADMIN role
- **Permissions**:
  - Create tasks and assign them to any organization member
  - Update ANY field of any task (title, description, dueDate, priority, status, assignedTo)
  - Delete tasks
  - View all tasks in the organization
  - Manage organization members (invite, remove, update roles)

### Organization Member
- **Definition**: A user who is invited to and has accepted an invitation to the organization
- **Permissions**:
  - View only tasks assigned to them
  - Update ONLY the priority field of assigned tasks
  - Mark assigned tasks as done
  - Cannot create, delete, or fully edit tasks
  - Cannot assign tasks to others

## Authorization Flow

### Creating a Task
```
Only organization admins can create tasks
  ├─ Verify user is admin of the organization
  ├─ If assignedTo is specified:
  │  └─ Validate assignee is a member of the organization
  └─ Create task and set assignedTo accordingly
```

### Viewing Tasks
```
GET /tasks?organizationId=<id>
  ├─ Verify user is member of organization
  ├─ If admin:
  │  └─ Return all tasks in organization
  └─ If member:
     └─ Return only tasks assigned to the user
```

### Getting a Single Task
```
GET /tasks/:id?organizationId=<id>
  ├─ Find task in organization
  ├─ Verify user is authorized to view:
  │  ├─ Admin of organization OR
  │  └─ Task is assigned to the user
  └─ Return task or 403 Unauthorized
```

### Updating a Task
```
PUT /tasks/:id?organizationId=<id>
  ├─ Find task in organization
  ├─ If user is admin:
  │  ├─ Can update: title, description, dueDate, priority, status, assignedTo
  │  ├─ If changing assignedTo:
  │  │  └─ Validate new assignee is organization member
  │  └─ Apply updates
  ├─ If user is the assignee (member):
  │  ├─ Can update: priority only
  │  └─ Apply priority update
  └─ Otherwise: return 403 Unauthorized
```

### Deleting a Task
```
DELETE /tasks/:id?organizationId=<id>
  ├─ Find task in organization
  ├─ Verify user is admin of organization
  ├─ Delete task and log activity
  └─ If not admin: return 403 Unauthorized
```

### Marking Task as Done
```
PATCH /tasks/:id/mark-done?organizationId=<id>
  ├─ Find task in organization
  ├─ Verify user is the assigned user
  ├─ Update status to DONE
  └─ If not assigned: return 403 Unauthorized
```

## Database Schema Changes

### Task Model
- No changes required - existing schema is compatible

### Organization Model
- Already has `members[].role` field supporting "ADMIN" and "MEMBER"
- `createdBy` field designates the organization creator (always admin)

### User Model
- Already has `organizations[].role` field supporting "USER" and "ADMIN"
- This mirrors the organization members structure

## Helper Functions

### roleCheck.js Utilities

#### `isOrganizationAdmin(userId, organizationId)`
- Returns: `boolean`
- Checks if a user is an admin of an organization
- Organization creator is always considered admin

#### `isOrganizationMember(userId, organizationId)`
- Returns: `boolean`
- Checks if a user is a member of an organization
- Organization creator is always considered a member

#### `getUserRoleInOrganization(userId, organizationId)`
- Returns: `"ADMIN" | "MEMBER" | null`
- Returns the user's role in the organization
- Creator returns "ADMIN"

## Required Request Parameters

All task operations require:
- **Authentication**: User must be logged in (via requireAuth middleware)
- **organizationId**: Must be passed as query parameter for:
  - GET /tasks (list)
  - GET /tasks/:id
  - PUT /tasks/:id
  - DELETE /tasks/:id
  - PATCH /tasks/:id/mark-done

Example: `GET /tasks/:id?organizationId=507f1f77bcf86cd799439011`

## Error Responses

### 400 Bad Request
- Missing required fields (organizationId)
- Invalid assignee (not a member)
- Invalid input

### 403 Forbidden
- User is not an organization member
- User lacks permission for the operation
- Admin-only operation attempted by member

### 404 Not Found
- Task not found in organization
- Organization not found

## Notifications

When a task is updated by an admin, the assigned user receives a notification with:
- Change details (what was updated and old/new values)
- Type: TASK_UPDATED
- Message describing the update

## Migration Notes

If upgrading from previous versions:

1. **Task Creation**: Tasks can now only be created by admins (previously anyone could create)
   - Existing tasks maintain their createdBy and assignedTo values

2. **Task Updates**: Non-admin users can now ONLY update priority
   - This is more restrictive than before
   - Admins have full update access

3. **Task Deletion**: Only admins can delete tasks
   - More restrictive than before

4. **organizationId Parameter**: Required for task endpoints
   - Update all clients to include this in query parameters

## Testing Checklist

- [ ] Admin can create task and assign to any member
- [ ] Admin can create task without assignedTo (defaults to self)
- [ ] Admin cannot assign task to non-member
- [ ] Member cannot create task
- [ ] Member can view only assigned tasks
- [ ] Member can update only priority of assigned task
- [ ] Member cannot update other fields
- [ ] Member cannot assign task
- [ ] Member cannot delete task
- [ ] Member can mark assigned task as done
- [ ] Member cannot mark other's task as done
- [ ] Admin can update any field of any task
- [ ] Admin can change task assignment
- [ ] Admin can delete any task
- [ ] Admin can view all tasks in organization
- [ ] Unauthorized users cannot access tasks
