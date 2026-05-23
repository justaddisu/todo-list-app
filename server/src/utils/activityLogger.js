import { ActivityLog } from "../models/ActivityLog.js";

export const logActivity = async ({ actorId, entityType, entityId, action, metadata = {} }) => {
  try {
    await ActivityLog.create({
      actorId: actorId || null,
      entityType,
      entityId: entityId || null,
      action,
      metadata,
    });
  } catch {
    // Keep business flow resilient even if audit logging fails.
  }
};
