import { Medicine } from "@/app/models/Medicine";
import { connectDB } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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
}

export async function GET() {
    await connectDB();

    const medicines = await Medicine.find();

    return Response.json({
        medicines,
    });
}