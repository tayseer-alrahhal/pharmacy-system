import mongoose, { Document, Model } from "mongoose";

export interface IBatch {
    batchNumber: string;
    quantity: number;
    purchasePrice: number;
    expiryDate: Date;
    supplierId?: mongoose.Types.ObjectId | string;
    createdAt?: Date;
}

export interface IMedicine extends Document {
    pharmacyId: number;
    name: string;
    barcode: string;
    category?: string;
    manufacturer?: string;
    prescriptionRequired: boolean;
    batches: IBatch[];
    reorderLevel: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const BatchSchema = new mongoose.Schema<IBatch>({
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
}, { timestamps: { createdAt: true, updatedAt: false } });

const MedicineSchema = new mongoose.Schema<IMedicine>({
    pharmacyId: { type: Number, required: true },
    name: { type: String, required: true },
    barcode: { type: String, required: true, unique: true },
    category: { type: String },
    manufacturer: { type: String },
    prescriptionRequired: { type: Boolean, required: true },
    batches: [BatchSchema],
    reorderLevel: { type: Number, default: 10 },
}, { timestamps: true });

export const Medicine: Model<IMedicine> =
    mongoose.models.Medicine ||
    mongoose.model<IMedicine>("Medicine", MedicineSchema);
