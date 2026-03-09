import { Medicine } from "@/app/models/Medicine";
import { StockMovement } from "@/app/models/StockMovement";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const data = await req.json();

        const {
            name,
            barcode,
            category,
            manufacturer,
            prescriptionRequired,
            reorderLevel,
            // Batch Info
            batchNumber,
            quantity,
            purchasePrice,
            expiryDate,
        } = data;

        const medicine = await Medicine.create({
            pharmacyId: 1,
            name,
            barcode,
            category,
            manufacturer,
            prescriptionRequired: prescriptionRequired || false,
            reorderLevel: reorderLevel || 10,
            batches: [{
                batchNumber,
                quantity,
                purchasePrice,
                expiryDate: new Date(expiryDate),
            }]
        });

        // Log stock movement for initial batch
        await StockMovement.create({
            medicineId: medicine._id,
            medicineName: medicine.name,
            batchId: batchNumber,
            type: "ADD",
            quantity: Number(quantity),
            note: `إضافة دواء جديد مع الوجبة الأولى (${batchNumber})`,
        });

        return NextResponse.json({
            message: "تم إضافة الدواء بنجاح مع الوجبة الأولى",
            medicine,
        });

    } catch (error: any) {
        console.error("DEBUG >> [Add Medicine Error]", error);
        return NextResponse.json({ error: "فشل في إضافة الدواء" }, { status: 500 });
    }
}

export async function GET() {


    try {
        await connectDB();

        const medicines = await Medicine.find();

        return Response.json({
            medicines,
        });

    } catch (error: any) {
        return NextResponse.json({ error: "فشل في جلب المخزون" }, { status: 500 });
    }

}
