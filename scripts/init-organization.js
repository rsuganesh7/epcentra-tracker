#!/usr/bin/env node

/**
 * Organization Initialization Script
 * Run this to create your first organization with default data
 * 
 * Usage: node scripts/init-organization.js
 * 
 * Note: This script requires a Firebase service account key.
 * For now, we'll use the Web SDK instead which is easier for quick setup.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createInterface } from 'readline';
import { readFileSync } from 'fs';

// NOTE: You need a service account key file
// Download it from Firebase Console > Project Settings > Service Accounts
// Save it as 'serviceAccountKey.json' in the project root

let serviceAccount;
try {
  const serviceAccountPath = new URL('../serviceAccountKey.json', import.meta.url);
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('\n❌ Error: Service account key file not found!');
  console.error('\nPlease download your service account key from:');
  console.error('Firebase Console > Project Settings > Service Accounts > Generate New Private Key');
  console.error('\nSave it as "serviceAccountKey.json" in the epcentra-tracker folder\n');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const auth = getAuth(app);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function initializeOrganization() {
  console.log('\n🚀 EPCENTRA Organization Initialization\n');
  
  const userEmail = await question('Enter owner email: ');
  const orgName = await question('Enter organization name: ');
  const orgSlug = await question('Enter organization slug (URL-friendly): ');
  
  console.log('\n📝 Creating organization...\n');
  
  try {
    // Get user by email
    const userRecord = await auth.getUserByEmail(userEmail);
    const userId = userRecord.uid;
    
    // 1. Create organization
    const orgRef = await db.collection('organizations').add({
      name: orgName,
      slug: orgSlug,
      description: `${orgName} workspace`,
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
        features: ['custom-workflows', 'time-tracking', 'reports', 'api-access']
      },
      createdBy: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Organization created: ${orgRef.id}`);
    
    // 2. Add user as owner
    await db.collection('organizationMembers').doc(`${userId}_${orgRef.id}`).set({
      organizationId: orgRef.id,
      userId: userId,
      role: 'owner',
      teams: [],
      invitedBy: userId,
      joinedAt: FieldValue.serverTimestamp(),
      status: 'active',
      permissions: []
    });
    
    console.log(`✅ User added as owner`);
    
    // 3. Create default workflow
    const workflowRef = await db.collection('workflows').add({
      organizationId: orgRef.id,
      name: 'Default Workflow',
      description: 'Standard workflow for software development',
      isDefault: true,
      statuses: [
        { id: 'todo', name: 'To Do', category: 'todo', color: '#6B7280', order: 1, description: 'Work not started' },
        { id: 'in-progress', name: 'In Progress', category: 'in-progress', color: '#3B82F6', order: 2, description: 'Work in progress' },
        { id: 'review', name: 'In Review', category: 'in-progress', color: '#8B5CF6', order: 3, description: 'Ready for review' },
        { id: 'done', name: 'Done', category: 'done', color: '#10B981', order: 4, description: 'Work completed' }
      ],
      transitions: [
        { id: 't1', fromStatusId: 'todo', toStatusId: 'in-progress', name: 'Start Work' },
        { id: 't2', fromStatusId: 'in-progress', toStatusId: 'review', name: 'Submit for Review' },
        { id: 't3', fromStatusId: 'review', toStatusId: 'done', name: 'Approve' },
        { id: 't4', fromStatusId: 'review', toStatusId: 'in-progress', name: 'Request Changes' },
        { id: 't5', fromStatusId: 'in-progress', toStatusId: 'todo', name: 'Move Back' }
      ],
      createdBy: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Default workflow created: ${workflowRef.id}`);
    
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
    
    console.log(`✅ Created ${priorities.length} default priorities`);
    
    // 5. Create default labels
    const labels = [
      { name: 'Bug', color: '#EF4444', description: 'Something isn\'t working' },
      { name: 'Feature', color: '#3B82F6', description: 'New feature or request' },
      { name: 'Documentation', color: '#10B981', description: 'Documentation improvements' },
      { name: 'Enhancement', color: '#8B5CF6', description: 'Improvement to existing feature' }
    ];
    
    for (const label of labels) {
      await db.collection('labels').add({
        organizationId: orgRef.id,
        projectId: null, // Organization-wide
        ...label
      });
    }
    
    console.log(`✅ Created ${labels.length} default labels`);
    
    // 6. Create default project
    const projectRef = await db.collection('projects').add({
      organizationId: orgRef.id,
      name: 'Default Project',
      key: 'DEF',
      description: 'Your first project',
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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Default project created: ${projectRef.id}`);
    
    console.log('\n🎉 Organization initialized successfully!\n');
    console.log(`Organization ID: ${orgRef.id}`);
    console.log(`Organization Name: ${orgName}`);
    console.log(`Organization Slug: ${orgSlug}`);
    console.log(`Owner: ${userEmail}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

initializeOrganization();
