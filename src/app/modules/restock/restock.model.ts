import { model } from "mongoose";

import { IRestock } from "./restock.interface";
import restockSchema from "./restock.schema";

const RestockModel = model<IRestock>("RestockQueue", restockSchema);

export default RestockModel;
