import { model } from "mongoose";

import { IUser, IUserModel } from "./user.interface";
import userSchema from "./user.schema";

const UserModel = model<IUser, IUserModel>("User", userSchema);

export default UserModel;
