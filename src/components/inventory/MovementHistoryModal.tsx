"use client"

import React, { useState, useEffect } from 'react'
import { X, History, ArrowUpCircle, ArrowDownCircle, RefreshCw, Package } from 'lucide-react'
import { StockMovementType } from '@/types/MedicineTypes'

interface MovementHistoryModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    medicineId: string
    medicineName: string
}

function getTypeLabel(type: StockMovementType["type"]) {
    switch (type) {
        case "ADD": return "إضافة"
        case "REMOVE": return "إزالة"
        case "ADJUST": return "تعديل"
    }
}

function getTypeIcon(type: StockMovementType["type"]) {
    switch (type) {
        case "ADD": return <ArrowUpCircle className="h-4 w-4" />
        case "REMOVE": return <ArrowDownCircle className="h-4 w-4" />
        case "ADJUST": return <RefreshCw className="h-4 w-4" />
    }
}

function getTypeStyle(type: StockMovementType["type"]) {
    switch (type) {
        case "ADD": return "text-emerald-700 bg-emerald-50 border-emerald-200"
        case "REMOVE": return "text-red-700 bg-red-50 border-red-200"
        case "ADJUST": return "text-amber-700 bg-amber-50 border-amber-200"
    }
}

export default function MovementHistoryModal({ open, setOpen, medicineId, medicineName }: MovementHistoryModalProps) {
    const [movements, setMovements] = useState<StockMovementType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open || !medicineId) return

        const fetchMovements = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`/api/inventory/${medicineId}/movements`)
                const data = await response.json()
                if (data.success) {
                    setMovements(data.movements)
                } else {
                    setError(data.message || "فشل في جلب سجل الحركات")
                }
            } catch {
                setError("حدث خطأ أثناء الاتصال بالخادم")
            } finally {
                setIsLoading(false)
            }
        }

        fetchMovements()
    }, [open, medicineId])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 bg-linear-to-r from-slate-700 to-slate-900 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <History className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">سجل حركات المخزون</h2>
                            <p className="text-xs text-white/80">{medicineName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6" dir="rtl">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <svg className="animate-spin h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                            <p className="text-sm text-gray-400 font-medium">جاري تحميل السجل...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="p-3 bg-red-50 rounded-full">
                                <X className="h-6 w-6 text-red-400" />
                            </div>
                            <p className="text-sm text-red-500 font-medium">{error}</p>
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">لا توجد حركات مسجلة لهذا الدواء</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            التاريخ
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            النوع
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            الكمية
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            ملاحظة
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((movement, index) => (
                                        <tr
                                            key={movement._id}
                                            className={`border-b border-gray-100 transition-colors hover:bg-gray-50/70 ${index === movements.length - 1 ? 'border-b-0' : ''
                                                }`}
                                        >
                                            {/* التاريخ */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {new Date(movement.createdAt).toLocaleDateString("ar-SA", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 mt-0.5">
                                                        {new Date(movement.createdAt).toLocaleTimeString("ar-SA", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* النوع */}
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getTypeStyle(movement.type)}`}>
                                                    {getTypeIcon(movement.type)}
                                                    {getTypeLabel(movement.type)}
                                                </span>
                                            </td>

                                            {/* الكمية */}
                                            <td className="px-4 py-3.5">
                                                <span className={`text-sm font-bold ${movement.type === "REMOVE"
                                                    ? "text-red-600"
                                                    : movement.type === "ADD"
                                                        ? "text-emerald-600"
                                                        : "text-amber-600"
                                                    }`}>
                                                    {movement.type === "REMOVE" ? "-" : movement.type === "ADD" ? "+" : ""}
                                                    {Math.abs(movement.quantity)}
                                                </span>
                                            </td>

                                            {/* ملاحظة */}
                                            <td className="px-4 py-3.5">
                                                <span className="text-sm text-gray-600 leading-relaxed">
                                                    {movement.note || "---"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0" dir="rtl">
                    <p className="text-xs text-gray-400">
                        {!isLoading && !error && movements.length > 0 && (
                            <>عرض آخر <span className="font-bold text-gray-600">{movements.length}</span> حركة</>
                        )}
                    </p>
                    <button
                        onClick={() => setOpen(false)}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    )
}
