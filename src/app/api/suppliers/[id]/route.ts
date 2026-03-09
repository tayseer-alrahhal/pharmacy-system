import { Supplier } from "@/app/models/Supplier";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateSupplierSchema = z.object({
    name: z.string().min(2, "اسم المورد يجب أن يكون حرفين على الأقل"),
    phone: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
    notes: z.string().optional(),
});

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const supplier = await Supplier.findById(id);
        if (!supplier) {
            return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
        }
        return NextResponse.json({ supplier });
    } catch {
        return NextResponse.json({ error: "فشل في جلب المورد" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();

        const parsed = UpdateSupplierSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "بيانات المورد غير صحيحة", details: parsed.error.format() },
                { status: 400 }
            );
        }

        const supplier = await Supplier.findByIdAndUpdate(id, parsed.data, { new: true });
        if (!supplier) {
            return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
        }

        return NextResponse.json({ message: "تم تحديث المورد بنجاح", supplier });
    } catch {
        return NextResponse.json({ error: "فشل في تحديث المورد" }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const supplier = await Supplier.findByIdAndDelete(id);
        if (!supplier) {
            return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "تم حذف المورد بنجاح" });
    } catch {
        return NextResponse.json({ error: "فشل في حذف المورد" }, { status: 500 });
    }
}
