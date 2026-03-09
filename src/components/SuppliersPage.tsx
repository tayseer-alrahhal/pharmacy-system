"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Truck, Plus, X, Edit2, Trash2, Phone, MapPin, Mail, FileText, AlertTriangle, Search, ChevronRight } from "lucide-react"
import { gooeyToast } from "goey-toast"
import Link from "next/link"
import { SupplierType } from "@/types/MedicineTypes"

// ─── Form Modal ──────────────────────────────────────────────────────────────

interface SupplierFormModalProps {
    open: boolean
    setOpen: (v: boolean) => void
    initial?: SupplierType | null
    onSaved: (supplier: SupplierType) => void
}

function SupplierFormModal({ open, setOpen, initial, onSaved }: SupplierFormModalProps) {
    const isEdit = !!initial
    const [form, setForm] = useState({ name: "", phone: "", address: "", email: "", notes: "" })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            setForm({
                name: initial?.name ?? "",
                phone: initial?.phone ?? "",
                address: initial?.address ?? "",
                email: initial?.email ?? "",
                notes: initial?.notes ?? "",
            })
            setErrors({})
        }
    }, [open, initial])

    if (!open) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    }

    const validate = () => {
        const errs: Record<string, string> = {}
        if (!form.name.trim() || form.name.trim().length < 2) errs.name = "اسم المورد يجب أن يكون حرفين على الأقل"
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "البريد الإلكتروني غير صحيح"
        return errs
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setSubmitting(true)
        try {
            const url = isEdit ? `/api/suppliers/${initial!._id || initial!.id}` : "/api/suppliers"
            const method = isEdit ? "PATCH" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (res.ok) {
                gooeyToast.success(isEdit ? "تم تحديث المورد بنجاح" : "تم إضافة المورد بنجاح")
                onSaved(data.supplier)
                setOpen(false)
            } else {
                gooeyToast.error(data.error || "حدث خطأ")
            }
        } catch {
            gooeyToast.error("فشل الاتصال بالخادم")
        } finally {
            setSubmitting(false)
        }
    }

    const inputClass = (name: string) =>
        `w-full px-4 py-3 rounded-xl border text-sm bg-gray-50/50 focus:outline-none focus:ring-4 transition-all ${errors[name]
            ? "border-red-400 focus:ring-red-400/10 bg-red-50/30"
            : "border-gray-200 focus:border-teal-500 focus:ring-teal-500/10 hover:border-gray-300"
        }`

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" dir="rtl">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="px-6 py-5 bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{isEdit ? "تعديل المورد" : "إضافة مورد جديد"}</h2>
                            {isEdit && <p className="text-xs text-white/80">{initial?.name}</p>}
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">اسم المورد <span className="text-red-500">*</span></label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="اسم الشركة أو المورد" className={inputClass("name")} />
                        {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><Phone className="h-3 w-3" /> رقم الهاتف</label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+963 ..." className={inputClass("phone")} />
                        </div>
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><Mail className="h-3 w-3" /> البريد الإلكتروني</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@domain.com" className={inputClass("email")} />
                            {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><MapPin className="h-3 w-3" /> العنوان</label>
                        <input name="address" value={form.address} onChange={handleChange} placeholder="المدينة، الشارع..." className={inputClass("address")} />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><FileText className="h-3 w-3" /> ملاحظات</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="أي ملاحظات إضافية..." className={`${inputClass("notes")} resize-none`} />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition cursor-pointer">إلغاء</button>
                        <button type="submit" disabled={submitting} className="px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-2">
                            {submitting ? (
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                </svg>
                            ) : (
                                <>{isEdit ? "حفظ التغييرات" : <><Plus className="h-4 w-4" />إضافة المورد</>}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

interface DeleteConfirmProps {
    supplier: SupplierType | null
    onCancel: () => void
    onConfirm: () => void
    loading: boolean
}

function DeleteConfirm({ supplier, onCancel, onConfirm, loading }: DeleteConfirmProps) {
    if (!supplier) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-100 animate-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">حذف المورد</h3>
                            <p className="text-sm text-gray-500">هل أنت متأكد من حذف <strong>{supplier.name}</strong>؟</p>
                        </div>
                        <button onClick={onCancel} className="mr-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><X className="h-5 w-5" /></button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center min-h-[44px]">
                            {loading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg> : "تأكيد الحذف"}
                        </button>
                        <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all cursor-pointer">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Suppliers Page ───────────────────────────────────────────────────────────

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<SupplierType[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(null)
    const [deletingSupplier, setDeletingSupplier] = useState<SupplierType | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchSuppliers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/suppliers")
            const data = await res.json()
            setSuppliers(data.suppliers || [])
        } catch {
            gooeyToast.error("فشل في تحميل الموردين")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

    const handleSaved = (saved: SupplierType) => {
        setSuppliers(prev => {
            const id = saved._id || saved.id
            const exists = prev.find(s => (s._id || s.id) === id)
            return exists ? prev.map(s => ((s._id || s.id) === id ? saved : s)) : [saved, ...prev]
        })
    }

    const handleDelete = async () => {
        if (!deletingSupplier) return
        setIsDeleting(true)
        try {
            const id = deletingSupplier._id || deletingSupplier.id
            const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                setSuppliers(prev => prev.filter(s => (s._id || s.id) !== id))
                gooeyToast.success("تم حذف المورد بنجاح")
                setDeletingSupplier(null)
            } else {
                gooeyToast.error(data.error || "فشل الحذف")
            }
        } catch {
            gooeyToast.error("فشل الاتصال بالخادم")
        } finally {
            setIsDeleting(false)
        }
    }

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone || "").includes(searchQuery) ||
        (s.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">الموردون</h1>
                            <p className="text-xs text-gray-500">{suppliers.length} مورد مسجل</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setEditingSupplier(null); setFormOpen(true) }}
                        className="mr-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        إضافة مورد
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الهاتف، أو البريد..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pr-11 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white border border-gray-200 p-5 animate-pulse space-y-3">
                                <div className="h-5 w-32 bg-gray-200 rounded" />
                                <div className="h-4 w-24 bg-gray-100 rounded" />
                                <div className="h-4 w-40 bg-gray-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                            {searchQuery ? "لا توجد نتائج مطابقة" : "لا يوجد موردون بعد"}
                        </p>
                        {!searchQuery && (
                            <p className="text-sm text-gray-400 mt-1">ابدأ بإضافة أول مورد</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(supplier => {
                            const id = supplier._id || supplier.id
                            return (
                                <div key={id} className="group rounded-2xl bg-white border border-gray-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 p-5 transition-all duration-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                                <Truck className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm leading-tight">{supplier.name}</h3>
                                                {supplier.createdAt && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {new Date(supplier.createdAt).toLocaleDateString("ar-SA")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingSupplier(supplier); setFormOpen(true) }}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingSupplier(supplier)}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-sm text-gray-600">
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate">{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate">{supplier.address}</span>
                                            </div>
                                        )}
                                        {supplier.notes && (
                                            <div className="flex items-start gap-2">
                                                <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                                                <span className="text-xs text-gray-400 line-clamp-2">{supplier.notes}</span>
                                            </div>
                                        )}
                                        {!supplier.phone && !supplier.email && !supplier.address && !supplier.notes && (
                                            <p className="text-xs text-gray-300 italic">لا يوجد تفاصيل إضافية</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Modals */}
            <SupplierFormModal
                open={formOpen}
                setOpen={setFormOpen}
                initial={editingSupplier}
                onSaved={handleSaved}
            />
            <DeleteConfirm
                supplier={deletingSupplier}
                onCancel={() => setDeletingSupplier(null)}
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </div>
    )
}
