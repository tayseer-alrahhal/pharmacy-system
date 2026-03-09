import mongoose, { Document, Model } from "mongoose";

export interface ISupplier extends Document {
    name: string;
    phone?: string;
    address?: string;
    email?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const SupplierSchema = new mongoose.Schema<ISupplier>(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        email: { type: String, trim: true },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

export const Supplier: Model<ISupplier> =
    mongoose.models.Supplier ||
    mongoose.model<ISupplier>("Supplier", SupplierSchema);
