


import mongoose, { Document, Model } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    status: string;

}

const CategorySchema = new mongoose.Schema<ICategory>({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: String, required: true },
});

export const Category: Model<ICategory> =
    mongoose.models.Category ||
    mongoose.model<ICategory>("Category", CategorySchema);
