/**
 * Audit logging utility for security events
 * Logs important actions for compliance and security monitoring
 */

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_LOCKED'
  | 'EXAM_STARTED'
  | 'EXAM_SUBMITTED'
  | 'ADMIN_ACTION'
  | 'UNAUTHORIZED_ACCESS';

export interface AuditLogEntry {
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  success: boolean;
}

// In-memory audit log (in production, use database or external logging service)
const auditLogs: AuditLogEntry[] = [];
const MAX_LOGS = 10000; // Keep last 10k logs in memory

/**
 * Log an audit event
 */
export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };

  auditLogs.push(logEntry);

  // Keep only last MAX_LOGS entries
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.shift();
  }

  // In production, also send to external logging service
  console.log('[AUDIT]', JSON.stringify(logEntry));
}

/**
 * Get audit logs with optional filtering
 */
export function getAuditLogs(filter?: {
  eventType?: AuditEventType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): AuditLogEntry[] {
  let filtered = [...auditLogs];

  if (filter?.eventType) {
    filtered = filtered.filter(log => log.eventType === filter.eventType);
  }

  if (filter?.userId) {
    filtered = filtered.filter(log => log.userId === filter.userId);
  }

  if (filter?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filter.startDate!);
  }

  if (filter?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filter.endDate!);
  }

  // Sort by timestamp descending (newest first)
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}

/**
 * Get failed login attempts for a user
 */
export function getFailedLoginAttempts(username: string, since: Date): number {
  return auditLogs.filter(
    log =>
      log.eventType === 'LOGIN_FAILURE' &&
      log.username === username &&
      log.timestamp >= since
  ).length;
}

/**
 * Clear old audit logs (for maintenance)
 */
export function clearOldAuditLogs(olderThan: Date): number {
  const initialLength = auditLogs.length;
  const filtered = auditLogs.filter(log => log.timestamp >= olderThan);
  auditLogs.length = 0;
  auditLogs.push(...filtered);
  return initialLength - auditLogs.length;
}
