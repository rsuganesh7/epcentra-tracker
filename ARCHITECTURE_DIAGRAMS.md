# Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EPCENTRA Tracker                          │
│                   Multi-Organization Platform                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Tailwind CSS                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Context │  │  Org Context │  │ Project Hooks│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │           React Router (Pages)                      │         │
│  │  • Dashboard  • Projects  • Tasks  • Settings       │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Firebase SDK
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Firebase Services                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Authentication   │  │   Firestore DB   │  │   Storage    │  │
│  │                  │  │                  │  │              │  │
│  │ • Email/Password │  │ • Organizations  │  │ • Files      │  │
│  │ • Google OAuth   │  │ • Projects       │  │ • Images     │  │
│  │ • User Sessions  │  │ • Tasks          │  │ • Documents  │  │
│  └──────────────────┘  │ • Comments       │  └──────────────┘  │
│                         │ • RBAC Rules     │                     │
│                         └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Creating a Task

```
User Action
    │
    ▼
┌────────────────────┐
│  Task Form (UI)    │
│  • Title           │
│  • Description     │
│  • Status          │
│  • Priority        │
│  • Assignees       │
└────────────────────┘
    │
    │ Submit
    ▼
┌────────────────────────────────────┐
│  RBAC Check (OrganizationContext)  │
│  hasPermission('task', 'create')   │
└────────────────────────────────────┘
    │
    │ Authorized ✓
    ▼
┌────────────────────────────────────┐
│  Firestore Security Rules          │
│  • Check org membership            │
│  • Verify project access           │
│  • Validate permissions            │
└────────────────────────────────────┘
    │
    │ Allowed ✓
    ▼
┌────────────────────────────────────┐
│  Create Task Document              │
│  collection('tasks').add({...})    │
└────────────────────────────────────┘
    │
    │ Success
    ▼
┌────────────────────────────────────┐
│  Log Activity                      │
│  • Task created                    │
│  • Notify assignees                │
│  • Update counters                 │
└────────────────────────────────────┘
    │
    ▼
 UI Updates (Real-time)
```

## Organization Hierarchy

```
┌─────────────────────────────────────────────┐
│              ORGANIZATION                    │
│  • Settings                                  │
│  • Subscription                              │
│  • Members with Roles                        │
└─────────────────────────────────────────────┘
              │
              ├─────────────┬─────────────┬──────────────
              │             │             │
              ▼             ▼             ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   TEAMS      │ │  WORKFLOWS   │ │  PRIORITIES  │
    │              │ │              │ │              │
    │ • Members    │ │ • Statuses   │ │ • Levels     │
    │ • Lead       │ │ • Transitions│ │ • Colors     │
    └──────────────┘ └──────────────┘ └──────────────┘
              │
              ▼
        ┌──────────────┐
        │  PROJECTS    │
        │              │
        │ • Workflow   │
        │ • Teams      │
        │ • Members    │
        │ • Visibility │
        └──────────────┘
              │
              ├─────────────┬─────────────┬──────────────
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  TASKS   │  │MILESTONES│  │ SPRINTS  │
        │          │  │          │  │          │
        │• Status  │  │• Target  │  │• Active  │
        │• Priority│  │• Progress│  │• Tasks   │
        │• Assignee│  │• Tasks   │  │• Goals   │
        └──────────┘  └──────────┘  └──────────┘
              │
              ├───────────┬───────────
              │           │
              ▼           ▼
        ┌──────────┐ ┌──────────┐
        │SUBTASKS  │ │ COMMENTS │
        └──────────┘ └──────────┘
```

## RBAC Permission Flow

```
┌──────────────────────────────────────────────────────┐
│  User attempts action on resource                     │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  Get user's organization membership                   │
│  • Role (owner/admin/manager/member/guest)           │
│  • Teams                                              │
│  • Custom permissions                                 │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  Get permissions for role                             │
│  • System role permissions (SYSTEM_ROLES)            │
│  • Custom permission overrides                        │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  Check if action is allowed                           │
│  • Does permission exist for (resource, action)?     │
│  • Check scope: all / team / own                     │
└──────────────────────────────────────────────────────┘
                        │
                        ├─────────────┬─────────────
                        │             │
                        ▼             ▼
                  ✅ ALLOWED    ❌ DENIED
                        │             │
                        │             └──> Show error
                        │                  Hide UI
                        │
                        ▼
                  Perform Action
                  Update Firestore
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│          1. Frontend Checks                  │
│  • hasPermission() hook                     │
│  • Conditional UI rendering                 │
│  • User feedback                            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       2. Firebase Auth Verification          │
│  • Valid JWT token                          │
│  • User authenticated                       │
│  • Session not expired                      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│      3. Firestore Security Rules            │
│  • Organization membership                  │
│  • Role-based permissions                   │
│  • Scope validation (all/team/own)         │
│  • Resource-level access                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
            ✅ Action Executed
```

## Workflow System

```
┌─────────────────────────────────────────────┐
│           WORKFLOW                           │
│  • Name: "Development Workflow"             │
│  • isDefault: true                          │
└─────────────────────────────────────────────┘
                    │
                    │ contains
                    ▼
        ┌─────────────────────────┐
        │      STATUSES            │
        │                          │
        │  ┌────────────────┐     │
        │  │   To Do        │     │
        │  │  Category: todo│     │
        │  │  Color: gray   │     │
        │  └────────────────┘     │
        │          │               │
        │          ▼               │
        │  ┌────────────────┐     │
        │  │  In Progress   │     │
        │  │  Category: wip │     │
        │  │  Color: blue   │     │
        │  └────────────────┘     │
        │          │               │
        │          ▼               │
        │  ┌────────────────┐     │
        │  │   In Review    │     │
        │  │  Category: wip │     │
        │  │  Color: purple │     │
        │  └────────────────┘     │
        │          │               │
        │          ▼               │
        │  ┌────────────────┐     │
        │  │     Done       │     │
        │  │  Category: done│     │
        │  │  Color: green  │     │
        │  └────────────────┘     │
        └─────────────────────────┘
                    │
                    │ defines
                    ▼
        ┌─────────────────────────┐
        │     TRANSITIONS          │
        │                          │
        │  To Do → In Progress     │
        │  In Progress → Review    │
        │  Review → Done           │
        │  Review → In Progress    │
        │                          │
        │  Optional Conditions:    │
        │  • Required role         │
        │  • Field validation      │
        │  • Approval needed       │
        └─────────────────────────┘
```

## Task Lifecycle

```
        [CREATED]
            │
            │ assigned
            ▼
        [TO DO]
            │
            │ start work
            ▼
    [IN PROGRESS]
            │
            ├──────┬──────────┐
            │      │          │
    time    │      │ comment  │ assign
    logged  │      │ added    │ to user
            │      │          │
            │      ▼          │
            │  [REVIEW]       │
            │      │          │
            │      ├─────┐    │
            │      │     │    │
            │  approve reject │
            │      │     │    │
            ▼      ▼     ▼    ▼
        [DONE] [IN PROGRESS]
            │
            │ close
            ▼
      [ARCHIVED]
```
