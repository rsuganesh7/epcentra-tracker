# Migration Guide: From Hardcoded to Fully Customizable Multi-Organization App

## 🎯 Overview

This guide will help you migrate from a hardcoded single-tenant app to a fully customizable multi-organization app with RBAC (Role-Based Access Control).

## 📋 What's Changed

### 1. **Multi-Organization Support**
- Users can belong to multiple organizations
- Each organization has its own projects, workflows, and settings
- Organization-level isolation and security

### 2. **Role-Based Access Control (RBAC)**
- 5 predefined roles: Owner, Admin, Manager, Member, Guest
- Granular permissions for each resource
- Scope-based access (all, team, own)

### 3. **Customizable Workflows**
- Define custom statuses for your projects
- Create workflow transitions
- Multiple workflows per organization

### 4. **Customizable Priorities & Labels**
- Define your own priority levels with colors
- Create organization-wide or project-specific labels
- No more hardcoded task types

### 5. **Project-Based Organization**
- Projects can be private, team-specific, or organization-wide
- Each project can have its own workflow
- Project-level settings and customization

### 6. **Timeline Features**
- Milestones
- Sprints (for Agile teams)
- Epics (for large features)
- Roadmaps (visual planning)
- Releases

## 🗂️ New Data Structure

### Collections in Firestore:

```
/organizations/{orgId}
/organizationMembers/{memberId}
/teams/{teamId}
/users/{userId}
/userPreferences/{userId}
/projects/{projectId}
/workflows/{workflowId}
/priorities/{priorityId}
/labels/{labelId}
/tasks/{taskId}
/subtasks/{subtaskId}
/comments/{commentId}
/timeEntries/{entryId}
/activities/{activityId}
/milestones/{milestoneId}
/sprints/{sprintId}
/epics/{epicId}
/roadmaps/{roadmapId}
/releases/{releaseId}
```

## 🔧 Setup Steps

### Step 1: Deploy New Firestore Rules

```bash
cd epcentra-tracker
firebase deploy --only firestore:rules --config firestore.rbac.rules
```

### Step 2: Create Default Organization Data

You'll need to initialize your first organization. Here's a Firebase Cloud Function or manual script:

```typescript
// scripts/initializeOrganization.ts
import { getFirestore } from 'firebase-admin/firestore';

async function initializeOrganization(userId: string, userEmail: string) {
  const db = getFirestore();
  
  // 1. Create organization
  const orgRef = await db.collection('organizations').add({
    name: 'EPCENTRA',
    slug: 'epcentra',
    description: 'EPCENTRA Development Tracker',
    settings: {
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      weekStart: 'monday',
      currency: 'USD',
      language: 'en',
      allowPublicProjects: false,
      requireApprovalForTasks: false,
      defaultTaskPriority: 'medium'
    },
    subscription: {
      plan: 'professional',
      maxUsers: 50,
      maxProjects: 100,
      features: ['custom-workflows', 'time-tracking', 'reports']
    },
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // 2. Add user as owner
  await db.collection('organizationMembers').doc(`${userId}_${orgRef.id}`).set({
    organizationId: orgRef.id,
    userId: userId,
    role: 'owner',
    teams: [],
    invitedBy: userId,
    joinedAt: new Date(),
    status: 'active',
    permissions: []
  });
  
  // 3. Create default workflow
  const workflowRef = await db.collection('workflows').add({
    organizationId: orgRef.id,
    name: 'Default Workflow',
    description: 'Standard workflow for software development',
    isDefault: true,
    statuses: [
      { id: 'todo', name: 'To Do', category: 'todo', color: '#6B7280', order: 1 },
      { id: 'in-progress', name: 'In Progress', category: 'in-progress', color: '#3B82F6', order: 2 },
      { id: 'review', name: 'In Review', category: 'in-progress', color: '#8B5CF6', order: 3 },
      { id: 'done', name: 'Done', category: 'done', color: '#10B981', order: 4 }
    ],
    transitions: [
      { id: 't1', fromStatusId: 'todo', toStatusId: 'in-progress', name: 'Start Work' },
      { id: 't2', fromStatusId: 'in-progress', toStatusId: 'review', name: 'Submit for Review' },
      { id: 't3', fromStatusId: 'review', toStatusId: 'done', name: 'Approve' },
      { id: 't4', fromStatusId: 'review', toStatusId: 'in-progress', name: 'Request Changes' }
    ],
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // 4. Create default priorities
  const priorities = [
    { name: 'Lowest', level: 1, color: '#64748B', icon: '⬇️', isDefault: false },
    { name: 'Low', level: 2, color: '#3B82F6', icon: '↘️', isDefault: false },
    { name: 'Medium', level: 3, color: '#F59E0B', icon: '➡️', isDefault: true },
    { name: 'High', level: 4, color: '#EF4444', icon: '↗️', isDefault: false },
    { name: 'Urgent', level: 5, color: '#DC2626', icon: '⬆️', isDefault: false }
  ];
  
  for (const priority of priorities) {
    await db.collection('priorities').add({
      organizationId: orgRef.id,
      ...priority
    });
  }
  
  // 5. Create default project
  await db.collection('projects').add({
    organizationId: orgRef.id,
    name: 'EPCENTRA Core Development',
    key: 'EPC',
    description: 'Core platform development',
    icon: '🚀',
    color: '#3B82F6',
    visibility: 'organization',
    status: 'active',
    lead: userId,
    members: [userId],
    teams: [],
    settings: {
      workflow: workflowRef.id,
      allowSubtasks: true,
      allowTimeTracking: true,
      allowAttachments: true,
      requireEstimates: false,
      autoAssignCreator: true,
      notifyOnTaskUpdate: true
    },
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Organization initialized successfully!');
  console.log('Organization ID:', orgRef.id);
}
```

### Step 3: Update AuthContext

The AuthContext has been updated to remove hardcoded roles. Users now get roles per organization through `OrganizationMember` records.

### Step 4: Wrap App with OrganizationProvider

Update your `App.tsx`:

```typescript
import { OrganizationProvider } from './contexts/OrganizationContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          {/* Your routes */}
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Step 5: Use RBAC in Components

```typescript
import { useOrganization } from '../contexts/OrganizationContext';

function MyComponent() {
  const { hasPermission, isOwnerOrAdmin } = useOrganization();
  
  // Check specific permission
  const canCreateTask = hasPermission('task', 'create');
  
  // Check if user is owner/admin
  if (isOwnerOrAdmin) {
    // Show admin features
  }
  
  return (
    <>
      {canCreateTask && (
        <button>Create Task</button>
      )}
    </>
  );
}
```

## 🎨 UI Components to Build

### 1. Organization Selector
- Dropdown to switch between organizations
- Show current organization name and logo

### 2. Project Selector
- List all accessible projects
- Filter by status, team, etc.

### 3. Settings Pages
- Organization Settings
- Workflow Editor
- Priority Manager
- Label Manager
- Team Management
- Member Management

### 4. Admin Pages
- User roles and permissions
- Invite members
- Create/edit teams
- Manage workflows

## 📊 Key Benefits

1. **Multi-Tenancy**: Support multiple clients/organizations in one app
2. **Scalability**: Each organization's data is isolated
3. **Flexibility**: Customize workflows, statuses, priorities per organization
4. **Security**: RBAC ensures users only see/edit what they should
5. **Team Collaboration**: Teams can work independently within organizations
6. **Enterprise-Ready**: Subscription tiers, usage limits, feature flags

## 🚀 Next Steps

1. Create organization onboarding flow
2. Build organization settings UI
3. Implement workflow editor
4. Create team management interface
5. Build project creation wizard
6. Migrate existing data (if any)
7. Test RBAC thoroughly
8. Deploy and monitor

## 📝 Migration Checklist

- [ ] Deploy new Firestore rules
- [ ] Create initialization script
- [ ] Test organization creation
- [ ] Test user invitation flow
- [ ] Test RBAC permissions
- [ ] Build organization switcher UI
- [ ] Build settings pages
- [ ] Migrate existing data
- [ ] Update all components to use new hooks
- [ ] Test thoroughly
- [ ] Deploy to production

## 🔍 Testing RBAC

Create test users with different roles and verify:
- Owners can do everything
- Admins can manage most things except billing
- Managers can create projects and tasks
- Members can work on assigned tasks
- Guests can only view

## 💡 Tips

1. Always check permissions before showing UI elements
2. Use `hasPermission` hook for granular control
3. Use `isOwnerOrAdmin` for admin-only features
4. Log permission checks during development
5. Test with multiple roles extensively
