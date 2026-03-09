import { StockMovement } from "@/app/models/StockMovement";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
    req: NextRequest,
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

        const movements = await StockMovement.find({ medicineId: id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            success: true,
            movements,
        });

    } catch (error) {
        console.error("DEBUG >> [Get Movements Error]", error);
        return NextResponse.json(
            { success: false, message: "حدث خطأ أثناء جلب سجل الحركات" },
            { status: 500 }
        );
    }
}
