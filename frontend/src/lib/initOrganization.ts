import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * Initialize Organization - Web SDK Version
 * This creates your first organization with default data
 * Run this from browser console or create a temporary UI component
 */

export async function initializeOrganization(
  orgName: string,
  orgSlug: string
) {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('You must be logged in to create an organization');
  }
  
  const userId = currentUser.uid;
  
  console.log('📝 Creating organization...');
  
  try {
    // 1. Create organization
    const orgRef = await addDoc(collection(db, 'organizations'), {
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Organization created: ${orgRef.id}`);
    
    // 2. Add user as owner
    await setDoc(doc(db, 'organizationMembers', `${userId}_${orgRef.id}`), {
      organizationId: orgRef.id,
      userId: userId,
      role: 'owner',
      teams: [],
      invitedBy: userId,
      joinedAt: serverTimestamp(),
      status: 'active',
      permissions: []
    });
    
    console.log(`✅ User added as owner`);
    
    // 3. Create default workflow
    const workflowRef = await addDoc(collection(db, 'workflows'), {
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
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
      await addDoc(collection(db, 'priorities'), {
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
      await addDoc(collection(db, 'labels'), {
        organizationId: orgRef.id,
        projectId: null, // Organization-wide
        ...label
      });
    }
    
    console.log(`✅ Created ${labels.length} default labels`);
    
    // 6. Create default project
    const projectRef = await addDoc(collection(db, 'projects'), {
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Default project created: ${projectRef.id}`);
    
    console.log('\n🎉 Organization initialized successfully!\n');
    console.log(`Organization ID: ${orgRef.id}`);
    console.log(`Organization Name: ${orgName}`);
    console.log(`Organization Slug: ${orgSlug}\n`);
    
    return {
      organizationId: orgRef.id,
      workflowId: workflowRef.id,
      projectId: projectRef.id
    };
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Helper function to use in browser console
// Example usage:
// import { initializeOrganization } from './lib/initOrg';
// await initializeOrganization('My Company', 'my-company');
