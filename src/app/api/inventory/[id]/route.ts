import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Medicine } from "@/app/models/Medicine";
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