/**
 * Audit Logging Module
 * 
 * Exports audit logging utilities for tracking administrative actions
 * and ensuring compliance with HIPAA and GDPR requirements.
 */

export { AuditLogger, auditLogger } from './AuditLogger';
export { getIpAddress, getUserAgent, getRequestMetadata, getClientUserAgent } from './requestUtils';
