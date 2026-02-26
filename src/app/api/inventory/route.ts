import { Medicine } from "@/app/models/Medicine";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {

        await connectDB();

        const data = await req.json();

        const {
            name,
            barcode,
            price,
            quantity,
            expiryDate,
            prescriptionRequired,
            category,
            manufacturer,
        } = data;

        const medicine = await Medicine.create({
            pharmacyId: 1,
            name,
            barcode,
            price,
            quantity,
            expiryDate,
            prescriptionRequired,
            category,
            manufacturer,
        });

        return Response.json({
            message: "تم إضافة الدواء بنجاح",
            medicine,
        });

    } catch (error: any) {
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