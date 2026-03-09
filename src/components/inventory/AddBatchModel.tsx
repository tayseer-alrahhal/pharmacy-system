"use client"
import React, { useState, useEffect } from 'react'
import { X, Plus, Package, Barcode, Calendar, DollarSign, Truck } from 'lucide-react'
import { gooeyToast } from "goey-toast"
import { AddBatchSchema } from '@/lib/validation'
import { MedicineType, SupplierType } from '@/types/MedicineTypes'
import { z } from 'zod'

const AddBatchWithSupplierSchema = AddBatchSchema.extend({
    supplierId: z.string().optional(),
})

interface AddBatchModelProps {
    open: boolean
    setOpen: (open: boolean) => void
    medicine: MedicineType | null
    onUpdate?: (updatedMedicine: MedicineType) => void
}

export default function AddBatchModel({ open, setOpen, medicine, onUpdate }: AddBatchModelProps) {
    const [formData, setFormData] = useState({
        batchNumber: '',
        quantity: '',
        purchasePrice: '',
        expiryDate: '',
        supplierId: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [suppliers, setSuppliers] = useState<SupplierType[]>([])
    const [loadingSuppliers, setLoadingSuppliers] = useState(false)

    // Fetch suppliers on mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            setLoadingSuppliers(true)
            try {
                const res = await fetch('/api/suppliers')
                const data = await res.json()
                setSuppliers(data.suppliers || [])
            } catch {
                // Non-critical — supplier field is optional
            } finally {
                setLoadingSuppliers(false)
            }
        }
        fetchSuppliers()
    }, [])

    // Reset form when modal opens with a new medicine
    useEffect(() => {
        if (open) {
            setFormData({
                batchNumber: '',
                quantity: '',
                purchasePrice: '',
                expiryDate: '',
                supplierId: '',
            })
            setErrors({})
        }
    }, [open])

    if (!open || !medicine) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const validationData = {
                batchNumber: formData.batchNumber,
                quantity: Number(formData.quantity),
                purchasePrice: Number(formData.purchasePrice),
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
                supplierId: formData.supplierId || undefined,
            }

            const result = AddBatchWithSupplierSchema.safeParse(validationData)

            if (!result.success) {
                const formattedErrors: Record<string, string> = {}
                result.error.issues.forEach(issue => {
                    formattedErrors[issue.path[0] as string] = issue.message
                })
                setErrors(formattedErrors)
                setIsSubmitting(false)
                return
            }

            const response = await fetch(`/api/inventory/${medicine._id || medicine.id}/add-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validationData)
            })

            const data = await response.json()

            if (response.ok) {
                gooeyToast.success(`تم إضافة الوجبة بنجاح لدواء ${medicine.name}`)
                if (onUpdate && data.medicine) {
                    onUpdate(data.medicine)
                }
                setOpen(false)
            } else {
                gooeyToast.error(data.error || "فشل إضافة الوجبة")
            }
        } catch (error) {
            gooeyToast.error("حدث خطأ أثناء الاتصال بالخادم")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getInputClass = (name: string) => `
        w-full pr-10 pl-4 py-3 rounded-xl border transition-all text-sm bg-gray-50/50 focus:outline-none focus:ring-4
        ${errors[name]
            ? 'border-red-400 focus:ring-red-400/10 bg-red-50/30'
            : 'border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/10 hover:border-gray-300'
        }
    `

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="px-6 py-5 bg-linear-to-r from-teal-500 to-emerald-600 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">إضافة وجبة جديدة</h2>
                            <p className="text-xs text-white/80">{medicine.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5" dir="rtl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Batch Number */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                رقم الوجبة <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                                <input
                                    type="text"
                                    name="batchNumber"
                                    value={formData.batchNumber}
                                    onChange={handleChange}
                                    placeholder="مثلاً: B1-2024"
                                    className={getInputClass("batchNumber")}
                                />
                            </div>
                            {errors.batchNumber && <p className="text-[10px] text-red-500 font-medium pr-1">{errors.batchNumber}</p>}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                الكمية <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={getInputClass("quantity")}
                                />
                            </div>
                            {errors.quantity && <p className="text-[10px] text-red-500 font-medium pr-1">{errors.quantity}</p>}
                        </div>

                        {/* Purchase Price */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                سعر الشراء (ل.س) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                                <input
                                    type="number"
                                    name="purchasePrice"
                                    value={formData.purchasePrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={getInputClass("purchasePrice")}
                                />
                            </div>
                            {errors.purchasePrice && <p className="text-[10px] text-red-500 font-medium pr-1">{errors.purchasePrice}</p>}
                        </div>

                        {/* Expiry Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                تاريخ الانتهاء <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    className={getInputClass("expiryDate")}
                                />
                            </div>
                            {errors.expiryDate && <p className="text-[10px] text-red-500 font-medium pr-1">{errors.expiryDate}</p>}
                        </div>
                    </div>

                    {/* Supplier */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-(--color-text-main) pr-1">
                            المورد <span className="text-gray-400 font-normal">(اختياري)</span>
                        </label>
                        <div className="relative">
                            <Truck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 pointer-events-none" />
                            <select
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                disabled={loadingSuppliers}
                                className="w-full pr-10 pl-4 py-3 rounded-xl border border-(--color-border) text-sm bg-gray-50/50 focus:outline-none focus:ring-4 focus:border-(--color-primary) focus:ring-(--color-primary)/10 hover:border-gray-300 transition-all cursor-pointer appearance-none disabled:opacity-60"
                            >
                                <option value="">— بدون مورد —</option>
                                {suppliers.map(s => (
                                    <option key={s._id || s.id} value={s._id || s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                </svg>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    إضافة الوجبة
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
