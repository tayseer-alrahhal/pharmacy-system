import { Medicine } from "@/app/models/Medicine";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/medicines/expiring
 * Returns medicines that have batches expiring within the next 30 days.
 * Sorted by nearest expiry date ascending.
 */
export async function GET() {
    try {
        await connectDB();

        const today = new Date();
        const in30Days = new Date(today);
        in30Days.setDate(in30Days.getDate() + 30);

        // Fetch all medicines and filter in-memory so we can include batch details
        const allMedicines = await Medicine.find();

        const expiringMedicines = allMedicines
            .map((medicine) => {
                const expiringBatches = (medicine.batches || []).filter((batch) => {
                    const expiryDate = new Date(batch.expiryDate);
                    return expiryDate >= today && expiryDate <= in30Days;
                });

                if (expiringBatches.length === 0) return null;

                // Sort batches by nearest expiry first
                const sortedBatches = [...expiringBatches].sort(
                    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
                );

                return {
                    _id: medicine._id,
                    name: medicine.name,
                    barcode: medicine.barcode,
                    category: medicine.category,
                    expiringBatches: sortedBatches,
                    nearestExpiry: sortedBatches[0].expiryDate,
                };
            })
            .filter(Boolean)
            // Sort medicines by nearest expiry date
            .sort(
                (a: any, b: any) =>
                    new Date(a.nearestExpiry).getTime() - new Date(b.nearestExpiry).getTime()
            );

        return NextResponse.json({
            count: expiringMedicines.length,
            medicines: expiringMedicines,
        });
    } catch (error) {
        return NextResponse.json({ error: "فشل في جلب الأدوية المنتهية قريباً" }, { status: 500 });
    }
}
