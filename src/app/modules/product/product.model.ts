import { model } from "mongoose";

import { IProduct, IProductModel } from "./product.interface";
import productSchema from "./product.schema";

const ProductModel = model<IProduct, IProductModel>("Product", productSchema);

export default ProductModel;
