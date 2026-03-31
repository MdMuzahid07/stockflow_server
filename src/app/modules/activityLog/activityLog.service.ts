import QueryBuilder from "../../builder/QueryBuilder";
import { ActivityLogType, IActivityLog } from "./activityLog.interface";
import ActivityLogModel from "./activityLog.model";

/**
 * Creates a new activity log entry.
 * @param {Object} payload - Log details.
 */
const createLog = async (payload: {
  action: string;
  user?: string;
  type: ActivityLogType;
}): Promise<IActivityLog> => {
  const log = await ActivityLogModel.create(payload);
  return log;
};

/**
 * Retrieves recent activity logs with filtering and pagination.
 * Typically used for the dashboard.
 */
const getRecentLogs = async (query: Record<string, unknown>) => {
  const logQuery = new QueryBuilder(
    ActivityLogModel.find().populate("user", "name email role"),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await logQuery.modelQuery;
  const meta = await logQuery.countTotal();

  return { meta, data };
};

export const ActivityLogService = {
  createLog,
  getRecentLogs,
};

export default ActivityLogService;
