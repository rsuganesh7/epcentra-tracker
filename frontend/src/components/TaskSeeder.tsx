// TaskSeeder.tsx - Add this component to your app for easy task seeding
// Place this file at: src/components/TaskSeeder.tsx

import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Database, Loader } from 'lucide-react';

const TaskSeeder: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const tasks = [
    // Phase 1: Foundation & DMS (8 tasks)
    { title: 'Project Setup & Infrastructure', description: 'Initialize FastAPI project, PostgreSQL/MongoDB setup, Docker, CI/CD pipeline', phase: 'Phase 1: Foundation & DMS', week: 1, priority: 'urgent', hours: 40, tags: ['infrastructure', 'setup'] },
    { title: 'Authentication & Authorization', description: 'JWT auth, RBAC, user management, session handling', phase: 'Phase 1: Foundation & DMS', week: 1, priority: 'urgent', hours: 60, tags: ['auth'] },
    { title: 'Core Database Schema', description: 'Base schemas for users, companies, projects, audit logging', phase: 'Phase 1: Foundation & DMS', week: 2, priority: 'high', hours: 50, tags: ['database'] },
    { title: 'DMS Storage Layer', description: 'Azure Blob Storage, file upload/download, versioning', phase: 'Phase 1: Foundation & DMS', week: 3, priority: 'high', hours: 70, tags: ['dms'] },
    { title: 'DMS Classification & Tagging', description: 'Document classification, tags, folders, search', phase: 'Phase 1: Foundation & DMS', week: 4, priority: 'high', hours: 50, tags: ['dms'] },
    { title: 'DMS Access Control', description: 'Permissions, role-based access, sharing, audit trail', phase: 'Phase 1: Foundation & DMS', week: 5, priority: 'high', hours: 60, tags: ['dms'] },
    { title: 'DMS Frontend Interface', description: 'React UI for document management, drag-and-drop', phase: 'Phase 1: Foundation & DMS', week: 5, priority: 'medium', hours: 70, tags: ['frontend'] },
    { title: 'API Documentation & Testing', description: 'OpenAPI docs, integration tests, automation', phase: 'Phase 1: Foundation & DMS', week: 6, priority: 'medium', hours: 40, tags: ['testing'] },

    // Phase 2: Template Engine (8 tasks)
    { title: 'Template Engine Architecture', description: 'Design template system, field types, validation', phase: 'Phase 2: Template Engine', week: 7, priority: 'urgent', hours: 50, tags: ['template-engine'] },
    { title: 'Template Schema', description: 'MongoDB schema, field types, nested sections', phase: 'Phase 2: Template Engine', week: 8, priority: 'high', hours: 60, tags: ['template-engine'] },
    { title: 'Field Type System', description: '20+ field types: text, number, date, dropdown', phase: 'Phase 2: Template Engine', week: 9, priority: 'high', hours: 70, tags: ['template-engine'] },
    { title: 'Validation Engine', description: 'Required, min/max, regex, custom validators', phase: 'Phase 2: Template Engine', week: 10, priority: 'high', hours: 60, tags: ['template-engine'] },
    { title: 'Template Builder UI', description: 'Drag-and-drop builder, field config, preview', phase: 'Phase 2: Template Engine', week: 11, priority: 'high', hours: 90, tags: ['frontend'] },
    { title: 'Template Renderer', description: 'Dynamic form renderer, validation, submission', phase: 'Phase 2: Template Engine', week: 12, priority: 'high', hours: 70, tags: ['template-engine'] },
    { title: 'Template Versioning', description: 'Version control, change tracking, rollback', phase: 'Phase 2: Template Engine', week: 13, priority: 'medium', hours: 50, tags: ['template-engine'] },
    { title: 'Template Testing', description: 'Test field types, validations, edge cases', phase: 'Phase 2: Template Engine', week: 14, priority: 'medium', hours: 40, tags: ['testing'] },

    // Phase 3: Formula Engine (8 tasks)
    { title: 'Formula Parser', description: 'Excel-like parser: operators, functions, references', phase: 'Phase 3: Formula Engine', week: 15, priority: 'urgent', hours: 90, tags: ['formula-engine'] },
    { title: 'Math Functions', description: 'SUM, AVERAGE, MIN, MAX, ROUND, statistics', phase: 'Phase 3: Formula Engine', week: 16, priority: 'high', hours: 60, tags: ['formula-engine'] },
    { title: 'Logical Functions', description: 'IF, AND, OR, NOT, nested conditions', phase: 'Phase 3: Formula Engine', week: 17, priority: 'high', hours: 50, tags: ['formula-engine'] },
    { title: 'Text & Date Functions', description: 'CONCATENATE, DATE, text manipulation', phase: 'Phase 3: Formula Engine', week: 18, priority: 'high', hours: 50, tags: ['formula-engine'] },
    { title: 'Lookup Functions', description: 'VLOOKUP, HLOOKUP, INDEX, MATCH', phase: 'Phase 3: Formula Engine', week: 19, priority: 'high', hours: 70, tags: ['formula-engine'] },
    { title: 'Dependency Tracking', description: 'Dependency graph, auto-calc, circular detection', phase: 'Phase 3: Formula Engine', week: 20, priority: 'high', hours: 80, tags: ['formula-engine'] },
    { title: 'Formula Builder UI', description: 'Editor: syntax highlight, auto-complete', phase: 'Phase 3: Formula Engine', week: 20, priority: 'medium', hours: 60, tags: ['frontend'] },
    { title: 'Formula Testing', description: 'Test functions, complex formulas, performance', phase: 'Phase 3: Formula Engine', week: 21, priority: 'medium', hours: 40, tags: ['testing'] },

    // Phase 4: Master Data (7 tasks)
    { title: 'Vendor Master Data', description: 'Vendor DB: info, contacts, certifications', phase: 'Phase 4: Master Data & Projects', week: 22, priority: 'high', hours: 60, tags: ['master-data'] },
    { title: 'Client Master Data', description: 'Client DB: profiles, history, portal', phase: 'Phase 4: Master Data & Projects', week: 23, priority: 'high', hours: 60, tags: ['master-data'] },
    { title: 'Product Catalog', description: 'Materials, equipment, specs, pricing', phase: 'Phase 4: Master Data & Projects', week: 24, priority: 'high', hours: 70, tags: ['master-data'] },
    { title: 'Project Setup', description: 'Project creation: team, budget, timeline', phase: 'Phase 4: Master Data & Projects', week: 25, priority: 'high', hours: 60, tags: ['projects'] },
    { title: 'Project Dashboard', description: 'Progress, cost, team, milestones', phase: 'Phase 4: Master Data & Projects', week: 26, priority: 'high', hours: 70, tags: ['dashboard'] },
    { title: 'Multi-project Management', description: 'Portfolio view, resource allocation', phase: 'Phase 4: Master Data & Projects', week: 27, priority: 'medium', hours: 60, tags: ['projects'] },
    { title: 'Data Import/Export', description: 'Bulk import/export via Excel/CSV', phase: 'Phase 4: Master Data & Projects', week: 28, priority: 'medium', hours: 40, tags: ['utilities'] },

    // Phase 5: Core Modules (7 tasks)
    { title: 'Material Requisition', description: 'MR creation, approval workflow, tracking', phase: 'Phase 5: Core Modules', week: 29, priority: 'high', hours: 70, tags: ['procurement'] },
    { title: 'Purchase Orders', description: 'PO generation, vendor selection, approval', phase: 'Phase 5: Core Modules', week: 30, priority: 'high', hours: 80, tags: ['procurement'] },
    { title: 'Stock Control', description: 'GR, GI, transfers, warehouse management', phase: 'Phase 5: Core Modules', week: 31, priority: 'high', hours: 80, tags: ['inventory'] },
    { title: 'Serial Number Tracking', description: 'Serial/batch tracking, traceability', phase: 'Phase 5: Core Modules', week: 32, priority: 'high', hours: 60, tags: ['inventory'] },
    { title: 'Invoice Management', description: 'Invoice creation, approval, payments', phase: 'Phase 5: Core Modules', week: 33, priority: 'high', hours: 70, tags: ['finance'] },
    { title: 'Budget Management', description: 'Budget allocation, cost tracking, variance', phase: 'Phase 5: Core Modules', week: 34, priority: 'high', hours: 60, tags: ['finance'] },
    { title: 'Core Integration', description: 'End-to-end workflow testing', phase: 'Phase 5: Core Modules', week: 35, priority: 'high', hours: 50, tags: ['integration'] },

    // Phase 6: EPCC Modules (7 tasks)
    { title: 'Engineering Documents', description: 'DMS for drawings, P&IDs, specs', phase: 'Phase 6: EPCC Modules', week: 36, priority: 'high', hours: 80, tags: ['epcc'] },
    { title: 'Change Management', description: 'ECR workflow, change orders', phase: 'Phase 6: EPCC Modules', week: 37, priority: 'high', hours: 60, tags: ['epcc'] },
    { title: 'Work Package Management', description: 'WBS, work packages, progress', phase: 'Phase 6: EPCC Modules', week: 37, priority: 'high', hours: 70, tags: ['epcc'] },
    { title: 'Field Reporting', description: 'Mobile reports, safety, inspections', phase: 'Phase 6: EPCC Modules', week: 38, priority: 'high', hours: 80, tags: ['epcc'] },
    { title: 'Punchlist Management', description: 'Punchlist: tracking, photos, closeout', phase: 'Phase 6: EPCC Modules', week: 39, priority: 'high', hours: 60, tags: ['epcc'] },
    { title: 'Test & Inspection', description: 'Checklists, test results, certificates', phase: 'Phase 6: EPCC Modules', week: 39, priority: 'medium', hours: 70, tags: ['epcc'] },
    { title: 'EPCC Integration', description: 'Engineering → procurement → construction', phase: 'Phase 6: EPCC Modules', week: 40, priority: 'high', hours: 50, tags: ['integration'] },

    // Phase 7: Advanced Features (9 tasks)
    { title: 'Analytics Dashboard', description: 'KPIs, cost analysis, predictive analytics', phase: 'Phase 7: Advanced Features', week: 41, priority: 'medium', hours: 80, tags: ['analytics'] },
    { title: 'Notification System', description: 'Email, SMS, in-app alerts', phase: 'Phase 7: Advanced Features', week: 41, priority: 'medium', hours: 50, tags: ['notifications'] },
    { title: 'Mobile Application', description: 'React Native: offline, photo, sync', phase: 'Phase 7: Advanced Features', week: 42, priority: 'medium', hours: 120, tags: ['mobile'] },
    { title: 'Collaboration Tools', description: 'Chat, mentions, comments, sharing', phase: 'Phase 7: Advanced Features', week: 42, priority: 'low', hours: 60, tags: ['collaboration'] },
    { title: 'Advanced Search', description: 'Elasticsearch, full-text search', phase: 'Phase 7: Advanced Features', week: 43, priority: 'medium', hours: 60, tags: ['search'] },
    { title: 'API Gateway', description: 'REST API, webhooks, dev portal', phase: 'Phase 7: Advanced Features', week: 43, priority: 'medium', hours: 50, tags: ['api'] },
    { title: 'Performance Optimization', description: 'Caching, CDN, load testing', phase: 'Phase 7: Advanced Features', week: 44, priority: 'high', hours: 60, tags: ['performance'] },
    { title: 'Security Audit', description: 'Penetration testing, OWASP compliance', phase: 'Phase 7: Advanced Features', week: 44, priority: 'high', hours: 40, tags: ['security'] },
    { title: 'Production Launch', description: 'Deployment, migration, training, go-live!', phase: 'Phase 7: Advanced Features', week: 44, priority: 'urgent', hours: 80, tags: ['launch'] }
  ];

  const handleSeedTasks = async () => {
    if (!currentUser) {
      alert('You must be logged in to seed tasks!');
      return;
    }

    const confirmed = window.confirm(
      `This will create ${tasks.length} tasks for the EPCENTRA project. Continue?`
    );

    if (!confirmed) return;

    setLoading(true);
    setResult(null);

    let success = 0;
    let failed = 0;

    try {
      for (const taskData of tasks) {
        try {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 7);

          const task = {
            title: taskData.title,
            description: taskData.description,
            status: 'pending' as const,
            priority: taskData.priority as 'low' | 'medium' | 'high' | 'urgent',
            phase: taskData.phase as any,
            week: taskData.week,
            startDate: Timestamp.fromDate(startDate),
            endDate: Timestamp.fromDate(endDate),
            estimatedHours: taskData.hours,
            actualHours: 0,
            assignedTo: [currentUser.id],
            dependencies: [],
            tags: taskData.tags,
            progress: 0,
            createdBy: currentUser.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            completedAt: null,
            blockedReason: null
          };

          await addDoc(collection(db, 'tasks'), task);
          success++;
        } catch (error) {
          console.error(`Failed to create task: ${taskData.title}`, error);
          failed++;
        }
      }

      setResult({ success, failed });
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Error seeding tasks. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Database className="text-epcentra-teal" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-epcentra-navy">
            Seed EPCENTRA Tasks
          </h3>
          <p className="text-sm text-gray-600">
            Create {tasks.length} tasks across 7 phases (44 weeks)
          </p>
        </div>
      </div>

      {result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✅ Successfully created {result.success} tasks
          </p>
          {result.failed > 0 && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ Failed to create {result.failed} tasks
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleSeedTasks}
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="animate-spin" size={18} />
            Creating tasks...
          </>
        ) : (
          <>
            <Database size={18} />
            Create All Tasks
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-1">What will be created:</p>
        <ul className="space-y-0.5">
          <li>• Phase 1: Foundation & DMS (8 tasks)</li>
          <li>• Phase 2: Template Engine (8 tasks)</li>
          <li>• Phase 3: Formula Engine (8 tasks)</li>
          <li>• Phase 4: Master Data (7 tasks)</li>
          <li>• Phase 5: Core Modules (7 tasks)</li>
          <li>• Phase 6: EPCC Modules (7 tasks)</li>
          <li>• Phase 7: Advanced Features (9 tasks)</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskSeeder;
