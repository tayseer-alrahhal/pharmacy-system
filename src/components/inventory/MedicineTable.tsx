
"use client"
import React from 'react';
import { Edit, Trash2, FileText, ShieldCheck } from "lucide-react"
import { MedicineType } from "@/types/MedicineTypes"
import Loader from '../Loader';

interface MedicineDisplay {
    id: number
    name: string
    category: string
    manufacturer: string
    barcode: string
    quantity: number
    price: number
    expiryDate: string
    status: "متوفر" | "منخفض" | "نفذ" | "منتهي الصلاحية"
    requiresPrescription: boolean
}

// دالة لحساب الحالة من البيانات
function calculateMedicineStatus(quantity: number, expiryDate: Date): MedicineDisplay["status"] {
    const now = new Date();
    const expiry = new Date(expiryDate);

    // إذا كان منتهي الصلاحية
    if (expiry <= now) {
        return "منتهي الصلاحية";
    }

    // إذا نفذ من المخزون
    if (quantity === 0) {
        return "نفذ";
    }

    // إذا كان المخزون منخفض (أقل من أو يساوي 15)
    if (quantity <= 15) {
        return "منخفض";
    }

    // متوفر
    return "متوفر";
}

function getStatusStyle(status: MedicineDisplay["status"]) {
    switch (status) {
        case "متوفر":
            return "bg-[#dcfce7] text-[#16A34A] border-[#16A34A]/20"
        case "منخفض":
            return "bg-[#fef3c7] text-[#D97706] border-[#F59E0B]/20"
        case "نفذ":
            return "bg-[#fee2e2] text-[#EF4444] border-[#EF4444]/20"
        case "منتهي الصلاحية":
            return "bg-[#f3f4f6] text-[#6B7280] border-[#6B7280]/20"
    }
}

export default function MedicineTable() {
    const [medicines, setMedicines] = React.useState<MedicineDisplay[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMedicines = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/inventory");
                const data: { medicines: MedicineType[] } = await response.json();

                const formattedMedicines: MedicineDisplay[] = data.medicines.map(med => ({
                    id: med.id,
                    name: med.name,
                    category: med.category || "غير محدد",
                    manufacturer: med.manufacturer || "غير محدد",
                    barcode: med.barcode,
                    quantity: med.quantity,
                    price: med.price,
                    expiryDate: new Date(med.expiryDate).toISOString(),
                    status: calculateMedicineStatus(med.quantity, med.expiryDate),
                    requiresPrescription: med.prescriptionRequired
                }));

                setMedicines(formattedMedicines);
                console.log("Medicines loaded:", formattedMedicines);
            } catch (error) {
                console.error("Error fetching medicines:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMedicines();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg-card) py-16">
                <Loader />
                <p className="text-lg font-medium text-(--color-text-muted) mt-4">
                    جاري تحميل الأدوية...
                </p>
            </div>
        );
    }

    if (medicines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-(--color-border) bg-(--color-bg-card) py-16">
                <FileText className="mb-4 h-12 w-12 text-(--color-text-muted) opacity-50" />
                <p className="text-lg font-medium text-(--color-text-muted)">
                    لا توجد ادوية
                </p>
                <p className="mt-1 text-sm text-(--color-text-muted) opacity-70">
                    قم باضافة دواء جديد أو غير معايير البحث
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-card) shadow-sm" dir="rtl">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#F5F9F8] border-b border-(--color-border)">
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                اسم الدواء
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                التصنيف
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                الشركة المصنعة
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                رقم الباركود
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                الكمية
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                السعر
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                تاريخ الانتهاء
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-(--color-text-main)">
                                الحالة
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-text-main)">
                                الاجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map((medicine) => (
                            <tr
                                key={medicine.id}
                                className="border-b border-(--color-border) transition-colors hover:bg-(--color-bg-main)/30"
                            >
                                {/* اسم الدواء */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <p className="font-medium text-(--color-text-main)">
                                                {medicine.name}
                                            </p>
                                        </div>
                                        {medicine.requiresPrescription && (
                                            <div className="group relative">
                                                <ShieldCheck className="h-4 w-4 text-(--color-primary)" />
                                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                                                    <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                                                        يحتاج وصفة طبية
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* التصنيف */}
                                <td className="px-4 py-4">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-(--color-primary)/20 bg-(--color-primary-light) text-(--color-primary)">
                                        {medicine.category}
                                    </span>
                                </td>

                                {/* الشركة المصنعة */}
                                <td className="px-4 py-4">
                                    <span className="text-sm text-(--color-text-main)">
                                        {medicine.manufacturer}
                                    </span>
                                </td>

                                {/* رقم الباركود */}
                                <td className="px-4 py-4">
                                    <code className="rounded bg-(--color-bg-main) px-1.5 py-0.5 text-xs text-(--color-text-main) font-mono">
                                        {medicine.barcode}
                                    </code>
                                </td>

                                {/* الكمية */}
                                <td className="px-4 py-4">
                                    <div>
                                        <span
                                            className={`font-semibold text-sm ${medicine.quantity <= 15
                                                ? "text-(--color-danger)"
                                                : "text-(--color-text-main)"
                                                }`}
                                        >
                                            {medicine.quantity}
                                        </span>
                                    </div>
                                </td>

                                {/* السعر */}
                                <td className="px-4 py-4">
                                    <span className="text-sm font-medium text-(--color-text-main)">
                                        {medicine.price.toFixed(2)} ل.س
                                    </span>
                                </td>

                                {/* تاريخ الانتهاء */}
                                <td className="px-4 py-4">
                                    <span
                                        className={`text-sm ${new Date(medicine.expiryDate) <= new Date()
                                            ? "font-semibold text-(--color-danger)"
                                            : "text-(--color-text-main)"
                                            }`}
                                    >
                                        {new Date(medicine.expiryDate).toLocaleDateString("ar-SA")}
                                    </span>
                                </td>

                                {/* الحالة */}
                                <td className="px-4 py-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(medicine.status)}`}>
                                        {medicine.status}
                                    </span>
                                </td>

                                {/* الإجراءات */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center gap-1">
                                        {/* زر التعديل */}
                                        <div className="group relative">
                                            <button
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors text-(--color-primary) hover:bg-(--color-primary-light) hover:text-(--color-primary-dark)"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">تعديل</span>
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                                                <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                                                    تعديل
                                                </div>
                                            </div>
                                        </div>

                                        {/* زر الحذف */}
                                        <div className="group relative">
                                            <button
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors text-(--color-danger) hover:bg-[#fee2e2] hover:text-[#EF4444]"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">حذف</span>
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                                                <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                                                    حذف
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}