import { model } from "mongoose";

import { ICategory, ICategoryModel } from "./category.interface";
import categorySchema from "./category.schema";

const CategoryModel = model<ICategory, ICategoryModel>("Category", categorySchema);

export default CategoryModel;
