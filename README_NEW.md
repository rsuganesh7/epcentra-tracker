# EPCENTRA Tracker - Fully Customizable Multi-Organization Platform

## 🎯 Overview

EPCENTRA Tracker is a comprehensive project management platform with multi-organization support, role-based access control (RBAC), and fully customizable workflows. It's designed to scale from small teams to enterprise organizations.

## ✨ Key Features

### 🏢 Multi-Organization Architecture
- Users can belong to multiple organizations
- Each organization has complete data isolation
- Switch between organizations seamlessly
- Organization-level settings and customization

### 🔐 Role-Based Access Control (RBAC)
- **5 Built-in Roles:**
  - **Owner**: Full control over organization
  - **Admin**: Manage projects, users, and settings
  - **Manager**: Create and manage projects and teams
  - **Member**: Work on assigned tasks
  - **Guest**: Read-only access
  
- **Granular Permissions:**
  - Create, Read, Update, Delete, Assign, Comment, Manage
  - Scope-based access: All, Team, Own
  - Custom permission overrides per user

### ⚙️ Customizable Workflows
- Define custom statuses with categories (todo, in-progress, done)
- Create workflow transitions with conditions
- Multiple workflows per organization
- Assign workflows at project level

### 🎨 Customizable Elements
- **Priorities**: Define your own priority levels with colors and icons
- **Labels**: Organization-wide or project-specific tags
- **Custom Fields**: Add custom fields to tasks (coming soon)
- **Task Types**: Bug, Feature, Epic, Story, etc.

### 📊 Project Management
- **Project Hierarchy**: Organization → Projects → Tasks → Subtasks
- **Visibility Levels**: Private, Team, Organization, Public
- **Project Settings**: Per-project workflows and preferences
- **Team Assignment**: Assign teams to projects

### 📅 Timeline Features
- **Milestones**: Track major project goals
- **Sprints**: Agile sprint management
- **Epics**: Group related tasks into large features
- **Roadmaps**: Visual planning and timeline views
- **Releases**: Version management and release planning

### 👥 Team Collaboration
- **Teams**: Organize users into teams
- **Comments**: Task-level discussions with mentions
- **Watchers**: Subscribe to task updates
- **Attachments**: File uploads per task
- **Time Tracking**: Log billable and non-billable hours
- **Activity Feed**: Real-time updates on all changes

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **UI Framework**: Tailwind CSS
- **State Management**: React Context API
- **Backend**: Firebase (Firestore + Auth + Storage)
- **Build Tool**: Vite
- **Authentication**: Firebase Auth (Email + Google OAuth)

### Data Model

```
Organizations
├── Projects
│   ├── Tasks
│   │   ├── Subtasks
│   │   ├── Comments
│   │   ├── Time Entries
│   │   └── Attachments
│   ├── Milestones
│   ├── Sprints
│   └── Epics
├── Teams
├── Members
├── Workflows
├── Priorities
├── Labels
└── Roadmaps
```

### Security Model

Firestore security rules enforce:
- Organization-level data isolation
- Role-based access permissions
- Resource-level access control
- Scope-based filtering (all/team/own)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Firebase CLI installed globally

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd epcentra-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
- Create a Firebase project at https://console.firebase.google.com
- Enable Authentication (Email/Password and Google)
- Enable Firestore Database
- Enable Storage
- Copy your Firebase config to `src/lib/firebase.ts`

4. **Deploy Firestore Rules**
```bash
firebase login
firebase init firestore
# Select your project
# Use firestore.rbac.rules as the rules file
firebase deploy --only firestore:rules
```

5. **Initialize Your Organization**
```bash
# Update service account path in scripts/init-organization.js
node scripts/init-organization.js
```

6. **Start Development Server**
```bash
npm run dev
```

Visit http://localhost:3000

## 📖 Usage Guide

### Creating an Organization

1. Sign up with email or Google
2. Run the initialization script (for first org)
3. Or create via UI (coming soon)

### Managing Users

1. Navigate to Settings → Members
2. Click "Invite Member"
3. Enter email and select role
4. User receives invitation email

### Creating a Project

1. Click "New Project" button
2. Fill in project details:
   - Name, Key (e.g., "PROJ")
   - Select workflow
   - Set visibility
   - Assign team members
3. Click "Create Project"

### Creating Tasks

1. Select a project
2. Click "New Task"
3. Fill in:
   - Title and description
   - Status, Priority, Type
   - Assignees
   - Due date, estimates
   - Labels
4. Click "Create"

### Using RBAC

```typescript
// In any component
import { useOrganization } from './contexts/OrganizationContext';

function MyComponent() {
  const { hasPermission, isOwnerOrAdmin, currentMember } = useOrganization();
  
  // Check specific permission
  if (hasPermission('project', 'create')) {
    // Show create project button
  }
  
  // Check if owner/admin
  if (isOwnerOrAdmin) {
    // Show admin menu
  }
  
  // Get user's role
  console.log('Role:', currentMember?.role);
}
```

### Custom Workflows

1. Go to Settings → Workflows
2. Click "Create Workflow"
3. Add statuses (name, color, category)
4. Define transitions between statuses
5. Optionally add transition conditions
6. Save workflow
7. Assign to projects

## 🔧 Configuration

### Organization Settings

```typescript
interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStart: 'monday' | 'sunday';
  currency: string;
  language: string;
  allowPublicProjects: boolean;
  requireApprovalForTasks: boolean;
  defaultTaskPriority: string;
}
```

### Project Settings

```typescript
interface ProjectSettings {
  workflow: string; // Workflow ID
  defaultAssignee?: string;
  allowSubtasks: boolean;
  allowTimeTracking: boolean;
  allowAttachments: boolean;
  requireEstimates: boolean;
  autoAssignCreator: boolean;
  notifyOnTaskUpdate: boolean;
}
```

## 📊 Permissions Matrix

| Resource | Owner | Admin | Manager | Member | Guest |
|----------|-------|-------|---------|--------|-------|
| Organization | CRUD | RU | R | R | R |
| Projects | CRUD | CRUD | CRU (team) | R (team) | R (team) |
| Tasks | CRUD | CRUD | CRUD (team) | CRU (own) | R (team) |
| Teams | CRUD | CRUD | RU (team) | R (team) | R (team) |
| Users | CRUD | RU | R | R | R |
| Workflows | CRUD | CRUD | R | R | R |
| Settings | CRUD | RU | R | R | - |

Legend: C=Create, R=Read, U=Update, D=Delete

## 🎨 Customization

### Adding Custom Priorities

```typescript
await db.collection('priorities').add({
  organizationId: 'org-id',
  name: 'Critical',
  level: 6,
  color: '#FF0000',
  icon: '🔥',
  isDefault: false
});
```

### Creating Custom Workflows

```typescript
await db.collection('workflows').add({
  organizationId: 'org-id',
  name: 'QA Workflow',
  statuses: [
    { id: 'testing', name: 'Testing', category: 'in-progress', color: '#F59E0B' },
    { id: 'verified', name: 'Verified', category: 'done', color: '#10B981' }
  ],
  transitions: [
    { fromStatusId: 'testing', toStatusId: 'verified', name: 'Verify' }
  ]
});
```

## 🔒 Security Best Practices

1. **Use Environment Variables** for sensitive config
2. **Enable MFA** for owner/admin accounts
3. **Regular Audit** of user permissions
4. **Review Security Rules** before deployment
5. **Enable Firestore Backups**
6. **Monitor Usage** via Firebase console
7. **Rate Limiting** on sensitive operations

## 📈 Scaling Considerations

- **Firestore Limits**: 1MB per document, 1 write/second per document
- **Use Subcollections** for large datasets
- **Implement Pagination** for lists
- **Cache Frequently-Used Data** (workflows, priorities)
- **Use Firestore Indexes** for complex queries
- **Consider Firebase Functions** for background tasks

## 🧪 Testing

```bash
# Run type checking
npm run build

# Run linting
npm run lint
```

## 📝 API Documentation

See [API_REFERENCE.md](./API_REFERENCE.md) for detailed API documentation (coming soon).

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines (coming soon).

## 📄 License

[Your License Here]

## 🆘 Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Email: support@epcentra.com

## 🗺️ Roadmap

- [ ] Real-time collaboration
- [ ] Custom fields for tasks
- [ ] Advanced reporting and analytics
- [ ] API access with rate limiting
- [ ] Mobile apps (iOS/Android)
- [ ] Integrations (Slack, GitHub, etc.)
- [ ] Advanced automation rules
- [ ] Time zone support
- [ ] Multi-language support
- [ ] Dark mode

## ⭐ Star History

If you find this project useful, please consider giving it a star!
