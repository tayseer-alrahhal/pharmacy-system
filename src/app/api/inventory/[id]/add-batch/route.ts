import { Medicine } from "@/app/models/Medicine";
import { StockMovement } from "@/app/models/StockMovement";
import { connectDB } from "@/lib/db";
import { AddBatchSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AddBatchWithSupplierSchema = AddBatchSchema.extend({
    supplierId: z.string().optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();

        // Validate data
        const validatedData = AddBatchWithSupplierSchema.safeParse(data);
        if (!validatedData.success) {
            return NextResponse.json(
                { error: "بيانات الوجبة غير صحيحة", details: validatedData.error.format() },
                { status: 400 }
            );
        }

        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return NextResponse.json({ error: "الدواء غير موجود" }, { status: 404 });
        }

        // Add new batch (supplierId is optional)
        const newBatch: any = {
            batchNumber: validatedData.data.batchNumber,
            quantity: validatedData.data.quantity,
            purchasePrice: validatedData.data.purchasePrice,
            expiryDate: new Date(validatedData.data.expiryDate),
        };

        if (validatedData.data.supplierId) {
            newBatch.supplierId = validatedData.data.supplierId;
        }

        medicine.batches.push(newBatch);
        await medicine.save();

        // Log stock movement
        await StockMovement.create({
            medicineId: medicine._id,
            medicineName: medicine.name,
            batchId: validatedData.data.batchNumber,
            type: "ADD",
            quantity: validatedData.data.quantity,
            note: `إضافة وجبة جديدة (${validatedData.data.batchNumber})`,
        });

        return NextResponse.json({
            message: "تم إضافة الوجبة بنجاح",
            medicine,
        });

    } catch (error: any) {
        console.error("DEBUG >> [Add Batch Error]", error);
        return NextResponse.json({ error: "فشل في إضافة الوجبة" }, { status: 500 });
    }
}

