import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Medicine } from "@/app/models/Medicine";
import { StockMovement } from "@/app/models/StockMovement";
import { connectDB } from "@/lib/db";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        // تحقق أن الـ id صالح
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "رقم تعريفي غير صالح" },
                { status: 400 }
            );
        }

        const deletedMedicine = await Medicine.findByIdAndDelete(id);

        if (!deletedMedicine) {
            return NextResponse.json(
                { success: false, message: "الدواء غير موجود" },
                { status: 404 }
            );
        }

        // Log stock movement for deletion
        const totalQuantity = (deletedMedicine.batches || []).reduce(
            (sum, batch) => sum + Number(batch.quantity || 0), 0
        );
        if (totalQuantity > 0) {
            await StockMovement.create({
                medicineId: deletedMedicine._id,
                medicineName: deletedMedicine.name,
                type: "REMOVE",
                quantity: totalQuantity,
                note: `حذف الدواء من المخزون`,
            });
        }

        return NextResponse.json({
            success: true,
            message: "تم حذف الدواء بنجاح",
            data: deletedMedicine,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ أثناء الحذف", error },
            { status: 500 }
        );
    }
}



export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "رقم تعريفي غير صالح" },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Get current state before update for comparison
        const currentMedicine = await Medicine.findById(id);
        if (!currentMedicine) {
            return NextResponse.json(
                { success: false, message: "الدواء غير موجود" },
                { status: 404 }
            );
        }

        const updatedMedicine = await Medicine.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!updatedMedicine) {
            return NextResponse.json(
                { success: false, message: "الدواء غير موجود" },
                { status: 404 }
            );
        }

        // Log ADJUST movements if batch quantities changed
        if (body.batches) {
            const oldBatches = currentMedicine.batches || [];
            const newBatches = updatedMedicine.batches || [];

            for (const newBatch of newBatches) {
                const oldBatch = oldBatches.find(
                    (b) => b.batchNumber === newBatch.batchNumber
                );
                if (oldBatch && oldBatch.quantity !== newBatch.quantity) {
                    const diff = newBatch.quantity - oldBatch.quantity;
                    await StockMovement.create({
                        medicineId: updatedMedicine._id,
                        medicineName: updatedMedicine.name,
                        batchId: newBatch.batchNumber,
                        type: "ADJUST",
                        quantity: diff,
                        note: `تعديل كمية الوجبة (${newBatch.batchNumber}): ${oldBatch.quantity} → ${newBatch.quantity}`,
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "تم تحديث الدواء بنجاح",
            data: updatedMedicine,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ أثناء التحديث", error },
            { status: 500 }
        );
    }
}

