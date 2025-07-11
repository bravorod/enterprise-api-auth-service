// rbacConfig.js
// Centralized Role-Based Access Control (RBAC) configuration for the Enterprise API Auth Service

/**
 * Defines which resources and actions each role is permitted to perform.
 * Resources correspond to logical API sections (e.g., 'users', 'auditLogs').
 */
const rbac = {
  admin: [
    { resource: 'users',      actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'auditLogs',  actions: ['read', 'delete'] },
    { resource: 'books',      actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'metrics',    actions: ['read'] },
    { resource: 'health',     actions: ['read'] }
  ],

  user: [
    { resource: 'profile',    actions: ['read', 'update'] },
    { resource: 'books',      actions: ['read'] },
    { resource: 'data',       actions: ['read'] }
  ],

  auditor: [
    { resource: 'auditLogs',  actions: ['read'] }
  ],

  guest: [
    { resource: 'auth',       actions: ['register', 'login'] }
  ]
};

/**
 * Checks if a given role has permission to perform an action on a resource.
 * @param {string} role    - The user role (e.g., 'admin').
 * @param {string} resource - The resource name (e.g., 'users').
 * @param {string} action  - The action to check (e.g., 'delete').
 * @returns {boolean} True if permitted, false otherwise.
 */
function can(role, resource, action) {
  const permissions = rbac[role] || [];
  return permissions.some(entry =>
    entry.resource === resource && entry.actions.includes(action)
  );
}

module.exports = { rbac, can };
