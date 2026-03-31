import { model } from "mongoose";

import { IOrder } from "./order.interface";
import orderSchema from "./order.schema";

const OrderModel = model<IOrder>("Order", orderSchema);

export default OrderModel;
