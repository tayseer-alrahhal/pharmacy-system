import { Supplier } from "@/app/models/Supplier";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SupplierSchema = z.object({
    name: z.string().min(2, "اسم المورد يجب أن يكون حرفين على الأقل"),
    phone: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
    notes: z.string().optional(),
});

export async function GET() {
    try {
        await connectDB();
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        return NextResponse.json({ suppliers });
    } catch (error) {
        return NextResponse.json({ error: "فشل في جلب الموردين" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const data = await req.json();

        const parsed = SupplierSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "بيانات المورد غير صحيحة", details: parsed.error.format() },
                { status: 400 }
            );
        }

        const supplier = await Supplier.create(parsed.data);
        return NextResponse.json({ message: "تم إضافة المورد بنجاح", supplier }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "فشل في إضافة المورد" }, { status: 500 });
    }
}
