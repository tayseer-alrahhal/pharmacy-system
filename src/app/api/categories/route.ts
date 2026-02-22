import { Category } from "@/app/models/Category";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";





export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({});
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: "فشل في جلب الفئات" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const data = await req.json();
        const { name, slug, status } = data;

        if (!name) {
            return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
        }

        const category = await Category.create({
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            status: status || 'active'
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "فشل في إضافة الفئة" }, { status: 500 });
    }
}
