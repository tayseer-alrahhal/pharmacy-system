import mongoose, { Document, Model } from "mongoose";

export interface IMedicine extends Document {
    pharmacyId: number;
    name: string;
    price: number;
    quantity: number;
    barcode: string;
    category?: string;
    manufacturer?: string;
    expiryDate: Date;
    prescriptionRequired: boolean;
}

const MedicineSchema = new mongoose.Schema<IMedicine>({
    pharmacyId: { type: Number, required: true },
    name: { type: String, required: true },
    barcode: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: { type: String },
    manufacturer: { type: String },
    expiryDate: { type: Date, required: true },
    prescriptionRequired: { type: Boolean, required: true },
});

export const Medicine: Model<IMedicine> =
    mongoose.models.Medicine ||
    mongoose.model<IMedicine>("Medicine", MedicineSchema);
