
"use client"
import React from 'react';
import { Edit, Trash2, FileText, ShieldCheck, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, AlertTriangle, X } from "lucide-react"
import { gooeyToast } from "goey-toast"
import { MedicineType } from "@/types/MedicineTypes"
import Loader from '../Loader';
import { FilterState } from './InventoryContainer';

interface MedicineDisplay {
    id: string
    name: string
    category: string
    manufacturer: string
    barcode: string
    quantity: number
    price: number
    expiryDate: string
    status: "متوفر" | "منخفض" | "نفذ" | "منتهي الصلاحية"
    requiresPrescription: boolean
    createdAt: number
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

interface MedicineTableProps {
    filters: FilterState;
}

export default function MedicineTable({ filters }: MedicineTableProps) {
    const [medicines, setMedicines] = React.useState<MedicineDisplay[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [medicineToDelete, setMedicineToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const itemsPerPage = 5;

    React.useEffect(() => {
        const fetchMedicines = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/inventory");
                const data: { medicines: MedicineType[] } = await response.json();

                const formattedMedicines: MedicineDisplay[] = data.medicines.map(med => ({
                    id: med._id || med.id || "",
                    name: med.name,
                    category: med.category || "غير محدد",
                    manufacturer: med.manufacturer || "غير محدد",
                    barcode: med.barcode,
                    quantity: med.quantity,
                    price: med.price,
                    expiryDate: new Date(med.expiryDate).toISOString(),
                    status: calculateMedicineStatus(med.quantity, med.expiryDate),
                    requiresPrescription: med.prescriptionRequired,
                    createdAt: med.createdAt ? new Date(med.createdAt).getTime() : 0
                }));

                setMedicines(formattedMedicines);
            } catch (error) {
                console.error("Error fetching medicines:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMedicines();
    }, []);

    // Reset to page 1 whenever filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Filtering logic
    const filteredMedicines = React.useMemo(() => {
        let result = medicines.filter((medicine) => {
            // Filter by search query (name or barcode)
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const matchesName = medicine.name.toLowerCase().includes(query);
                const matchesBarcode = medicine.barcode.toLowerCase().includes(query);
                if (!matchesName && !matchesBarcode) return false;
            }

            // Filter by category
            if (filters.selectedCategory !== "كل التصنيفات") {
                if (medicine.category !== filters.selectedCategory) return false;
            }

            // Filter by status
            if (filters.selectedStatus !== "كل الحالات") {
                if (medicine.status !== filters.selectedStatus) return false;
            }

            return true;
        });

        // Apply sorting
        if (filters.sortOrder === "الأحدث أولاً") {
            result = [...result].sort((a, b) => b.createdAt - a.createdAt);
        } else if (filters.sortOrder === "الأقدم أولاً") {
            result = [...result].sort((a, b) => a.createdAt - b.createdAt);
        }

        return result;
    }, [medicines, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMedicines = filteredMedicines.slice(startIndex, startIndex + itemsPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            // Scroll to top of table on page change
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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

    if (filteredMedicines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-(--color-border) bg-(--color-bg-card) py-16">
                <FileText className="mb-4 h-12 w-12 text-(--color-text-muted) opacity-50" />
                <p className="text-lg font-medium text-(--color-text-muted)">
                    لا توجد نتائج مطابقة
                </p>
                <p className="mt-1 text-sm text-(--color-text-muted) opacity-70">
                    حاول تغيير معايير البحث أو الفلترة
                </p>
            </div>
        )
    }

    // delete function
    const deleteMedicine = async (id: string, name: string) => {
        try {
            const result = await fetch(`/api/inventory/${id}`, {
                method: "DELETE",
            });
            const data = await result.json();
            if (data.success) {
                setMedicines(medicines.filter((medicine) => medicine.id !== id));
                gooeyToast.success("تم الحذف بنجاح", {
                    description: `تم حذف "${name}" نهائياً من المخزون`
                });
            } else {
                gooeyToast.error("فشل الحذف", {
                    description: data.message || "حدث خطأ أثناء محاولة حذف الدواء"
                });
            }
        } catch (error) {
            console.error(error);
            gooeyToast.error("خطأ في الاتصال", {
                description: "لم نتمكن من الوصول إلى الخادم للقيام بعملية الحذف"
            });
        }
    };

    return (
        <div>
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
                            {currentMedicines.map((medicine, index) => (
                                <tr
                                    key={index}
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
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors text-(--color-primary) hover:bg-(--color-primary-light) hover:text-(--color-primary-dark) cursor-pointer"
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
                                                    onClick={() => {
                                                        setMedicineToDelete({ id: medicine.id, name: medicine.name });
                                                        setIsDeleteConfirmOpen(true);
                                                    }}
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors text-(--color-danger) hover:bg-[#fee2e2] hover:text-[#EF4444] cursor-pointer"
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

            {/* modern pagination footer - always visible if there are medicines */}
            {filteredMedicines.length > 0 && (
                <div className='mt-6 px-4 py-3 flex items-center justify-between border border-(--color-border) bg-(--color-bg-card) rounded-xl shadow-sm' dir="rtl">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-lg border border-(--color-border) bg-white px-5 py-2 text-sm font-medium text-(--color-text-main) hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                        >
                            التالي
                        </button>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative ml-3 inline-flex items-center rounded-lg border border-(--color-border) bg-white px-5 py-2 text-sm font-medium text-(--color-text-main) hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                        >
                            السابق
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-(--color-text-muted)">
                                عرض من <span className="font-semibold text-(--color-primary)">{startIndex + 1}</span> إلى{" "}
                                <span className="font-semibold text-(--color-primary)">
                                    {Math.min(startIndex + itemsPerPage, filteredMedicines.length)}
                                </span>{" "}
                                من أصل <span className="font-semibold text-(--color-primary)">{filteredMedicines.length}</span> دواء
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
                                {/* First Page */}
                                <button
                                    onClick={() => paginate(1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-lg px-2.5 py-2.5 text-(--color-text-muted) hover:bg-(--color-primary-light) hover:text-(--color-primary) focus:z-20 focus:outline-offset-0 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer"
                                >
                                    <span className="sr-only">الأول</span>
                                    <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                                </button>

                                {/* Previous Page */}
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-lg px-2.5 py-2.5 text-(--color-text-muted) hover:bg-(--color-primary-light) hover:text-(--color-primary) focus:z-20 focus:outline-offset-0 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer"
                                >
                                    <span className="sr-only">السابق</span>
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </button>

                                {/* Page Numbers */}
                                {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                                    // Show first, last, current, and pages around current
                                    if (
                                        number === 1 ||
                                        number === totalPages ||
                                        (number >= currentPage - 1 && number <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`relative inline-flex items-center justify-center min-w-[36px] h-[36px] rounded-lg text-sm font-semibold transition-all duration-200 focus:z-20 focus:outline-offset-0 cursor-pointer ${currentPage === number
                                                    ? "bg-(--color-primary) text-white shadow-md shadow-teal-500/20"
                                                    : "text-(--color-text-main) hover:bg-(--color-primary-light) hover:text-(--color-primary)"
                                                    }`}
                                            >
                                                {number}
                                            </button>
                                        );
                                    } else if (
                                        number === currentPage - 2 ||
                                        number === currentPage + 2
                                    ) {
                                        return (
                                            <span
                                                key={number}
                                                className="relative inline-flex items-center px-2 py-2 text-sm font-semibold text-gray-400"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}

                                {/* Next Page */}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-lg px-2.5 py-2.5 text-(--color-text-muted) hover:bg-(--color-primary-light) hover:text-(--color-primary) focus:z-20 focus:outline-offset-0 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer"
                                >
                                    <span className="sr-only">التالي</span>
                                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                </button>

                                {/* Last Page */}
                                <button
                                    onClick={() => paginate(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-lg px-2.5 py-2.5 text-(--color-text-muted) hover:bg-(--color-primary-light) hover:text-(--color-primary) focus:z-20 focus:outline-offset-0 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer"
                                >
                                    <span className="sr-only">الأخير</span>
                                    <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsDeleteConfirmOpen(false)}
                    />
                    <div
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100 animate-in fade-in zoom-in duration-200"
                        dir="rtl"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">حذف الدواء</h3>
                                    <p className="text-sm text-gray-500 font-medium">هل أنت متأكد من رغبتك في حذف هذا الدواء؟ لا يمكن التراجع عن هذا الإجراء.</p>
                                </div>
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="bg-red-50/50 rounded-xl p-4 mb-6 border border-red-100/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-red-900/60 font-medium">الاسم:</span>
                                    <span className="text-red-900 font-bold">{medicineToDelete?.name}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={async () => {
                                        if (medicineToDelete) {
                                            await deleteMedicine(medicineToDelete.id, medicineToDelete.name);
                                            setIsDeleteConfirmOpen(false);
                                            setMedicineToDelete(null);
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
                                >
                                    تأكيد الحذف
                                </button>
                                <button
                                    onClick={() => {
                                        setIsDeleteConfirmOpen(false);
                                        setMedicineToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}