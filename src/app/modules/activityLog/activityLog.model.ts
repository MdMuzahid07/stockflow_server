import { model } from "mongoose";

import { IActivityLog } from "./activityLog.interface";
import activityLogSchema from "./activityLog.schema";

const ActivityLogModel = model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLogModel;
