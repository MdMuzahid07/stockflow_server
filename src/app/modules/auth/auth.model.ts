import { model } from "mongoose";
import { IUser, IUserModel } from "./auth.interface";
import userSchema from "./auth.schema";

const UserModel = model<IUser, IUserModel>("User", userSchema);

export default UserModel;
