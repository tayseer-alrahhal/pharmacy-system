import mongoose, { Document, Model } from "mongoose";

export interface IStockMovement extends Document {
    medicineId: mongoose.Types.ObjectId;
    medicineName: string;
    batchId?: string;
    type: "ADD" | "REMOVE" | "ADJUST";
    quantity: number;
    note: string;
    createdAt: Date;
}

const StockMovementSchema = new mongoose.Schema<IStockMovement>({
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true, index: true },
    medicineName: { type: String, required: true },
    batchId: { type: String },
    type: { type: String, enum: ["ADD", "REMOVE", "ADJUST"], required: true },
    quantity: { type: Number, required: true },
    note: { type: String, default: "" },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const StockMovement: Model<IStockMovement> =
    mongoose.models.StockMovement ||
    mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
