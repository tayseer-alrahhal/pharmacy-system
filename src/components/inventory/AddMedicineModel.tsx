
"use client"

import React, { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { X, Pill, Barcode, DollarSign, Package, Tag, Building2, Calendar, ShieldCheck, Plus, CheckCircle2, XCircle, ChevronDown, Check } from "lucide-react"
import { AddMedicineSchema } from '@/lib/validation'
import { Category } from '@/types/categoriesTypes'

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | null;

interface ToastState {
    type: ToastType;
    message: string;
    visible: boolean;
}

interface AddMedicineModelProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

type FormFields = {
    name: string;
    barcode: string;
    price: string;
    quantity: string;
    category: string;
    manufacturer: string;
    expiryDate: string;
    prescriptionRequired: boolean;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

const initialFormState: FormFields = {
    name: "",
    barcode: "",
    price: "",
    quantity: "",
    category: "",
    manufacturer: "",
    expiryDate: "",
    prescriptionRequired: false,
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddMedicineModel({ open, setOpen }: AddMedicineModelProps) {
    const [formData, setFormData] = useState<FormFields>(initialFormState);
    const [errors, setErrors] = useState<FormErrors>({});
    const [toast, setToast] = useState<ToastState>({ type: null, message: "", visible: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    // Close category dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Show toast at bottom-right, auto-dismiss after 3s
    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message, visible: true });
        setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
        setTimeout(() => setToast({ type: null, message: "", visible: false }), 3400);
    };

    const onClose = () => {
        setOpen(false);
        setFormData(initialFormState);
        setErrors({});
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCategorySelect = (categoryName: string) => {
        setFormData((prev) => ({ ...prev, category: categoryName }));
        setIsCategoryOpen(false);
        if (errors.category) {
            setErrors((prev) => ({ ...prev, category: undefined }));
        }
    };


    // ─── Fetch Categories ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                setCategories(data);
                console.log(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = AddMedicineSchema.safeParse({
            ...formData,
            price: formData.price,
            quantity: formData.quantity,
            expiryDate: formData.expiryDate || undefined,
        });

        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue: z.ZodIssue) => {
                const field = issue.path[0] as keyof FormErrors;
                if (field && !fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.data),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || "فشل في إضافة الدواء");
            }

            // 1. Close modal first
            const medicineName = result.data.name;
            onClose();
            // 2. Show success toast after modal disappears
            setTimeout(() => showToast("success", `تمت إضافة "${medicineName}" إلى المخزون بنجاح`), 300);

        } catch (error) {
            const msg = error instanceof Error ? error.message : "حدث خطأ غير متوقع، حاول مرة أخرى";
            // 1. Close modal first
            onClose();
            // 2. Show error toast after modal disappears
            setTimeout(() => showToast("error", msg), 300);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Input Styles ─────────────────────────────────────────────────────────
    const inputBase =
        "w-full pr-10 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-4 transition-all bg-gray-50/50 text-sm";
    const inputNormal =
        `${inputBase} border-(--color-border) focus:ring-(--color-primary)/10 focus:border-(--color-primary)`;
    const inputError =
        `${inputBase} border-red-400 focus:ring-red-400/10 focus:border-red-400 bg-red-50/30`;

    const getInputClass = (field: keyof FormErrors) =>
        errors[field] ? inputError : inputNormal;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── Toast: always rendered, independent of modal ── */}
            {toast.type && (
                <div
                    dir="rtl"
                    className={`fixed bottom-6 right-6 z-200 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm w-full transition-all duration-400
                        ${toast.visible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none"
                        }
                        ${toast.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <p className="text-sm font-semibold flex-1">{toast.message}</p>
                    <button
                        onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                        className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
                    >
                        <X className="h-4 w-4 opacity-50" />
                    </button>
                </div>
            )}

            {/* ── Modal ── */}
            {open && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 min-h-screen w-screen overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <div
                        className="relative my-auto w-full max-w-2xl bg-(--color-bg-card) rounded-2xl shadow-2xl overflow-hidden border border-(--color-border) flex flex-col animate-in fade-in zoom-in duration-200"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-(--color-border) flex items-center justify-between bg-linear-to-l from-(--color-primary-light)/30 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary) text-white shadow-lg shadow-teal-500/20">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-(--color-text-main)">إضافة دواء جديد</h2>
                                    <p className="text-xs text-(--color-text-muted) font-medium">أدخل تفاصيل الدواء لإضافته إلى المخزون</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-gray-100 text-(--color-text-muted) transition-colors border border-transparent hover:border-(--color-border) cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form className="space-y-8" onSubmit={handleSubmit} noValidate>

                                {/* Section 1: Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-(--color-primary) flex items-center gap-2 mb-2">
                                        <span className="w-1.5 h-4 bg-(--color-primary) rounded-full" />
                                        المعلومات الأساسية
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                                اسم الدواء <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                <Pill className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-primary) group-focus-within:scale-110 transition-transform" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="مثلاً: بنادول إكسترا"
                                                    className={getInputClass("name")}
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="text-xs text-red-500 font-medium pr-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Barcode */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                                رقم الباركود <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-primary) group-focus-within:scale-110 transition-transform" />
                                                <input
                                                    type="text"
                                                    name="barcode"
                                                    value={formData.barcode}
                                                    onChange={handleChange}
                                                    placeholder="أدخل رقم الباركود"
                                                    className={`${getInputClass("barcode")} font-mono`}
                                                />
                                            </div>
                                            {errors.barcode && (
                                                <p className="text-xs text-red-500 font-medium pr-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.barcode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Inventory & Price */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-sm font-bold text-(--color-primary) flex items-center gap-2 mb-2">
                                        <span className="w-1.5 h-4 bg-(--color-primary) rounded-full" />
                                        المخزون والتسعير
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {/* Price */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                                السعر (ل.س) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-primary)" />
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    min={0}
                                                    step="0.01"
                                                    className={getInputClass("price")}
                                                />
                                            </div>
                                            {errors.price && (
                                                <p className="text-xs text-red-500 font-medium pr-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.price}
                                                </p>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                                الكمية <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-primary)" />
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    min={1}
                                                    step="1"
                                                    className={getInputClass("quantity")}
                                                />
                                            </div>
                                            {errors.quantity && (
                                                <p className="text-xs text-red-500 font-medium pr-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.quantity}
                                                </p>
                                            )}
                                        </div>

                                        {/* Category Custom Dropdown */}
                                        <div className="space-y-1.5" ref={categoryRef}>
                                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                                التصنيف <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                                    className={`flex items-center justify-between w-full pr-10 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-4 transition-all bg-gray-50/50 text-sm cursor-pointer
                                                        ${errors.category
                                                            ? 'border-red-400 focus:ring-red-400/10 bg-red-50/30'
                                                            : isCategoryOpen
                                                                ? 'border-(--color-primary) ring-4 ring-(--color-primary)/10'
                                                                : 'border-(--color-border) hover:border-gray-300'
                                                        }`}
                                                >
                                                    <ChevronDown className={`h-4 w-4 text-(--color-text-muted) transition-transform duration-200 shrink-0 ${isCategoryOpen ? 'rotate-180 text-(--color-primary)' : ''
                                                        }`} />
                                                    <span className={`truncate text-right flex-1 px-2 ${!formData.category ? 'text-(--color-text-muted)' : 'text-(--color-text-main)'}`}>
                                                        {formData.category || 'اختر التصنيف'}
                                                    </span>
                                                    <Tag className="h-4 w-4 text-(--color-primary) shrink-0" />
                                                </button>

                                                {isCategoryOpen && (
                                                    <div className="absolute z-50 w-full mt-2 py-1.5 bg-white border border-(--color-border) rounded-xl shadow-xl animate-in fade-in zoom-in duration-200 origin-top">
                                                        {categories.length === 0 ? (
                                                            <p className="px-4 py-3 text-sm text-(--color-text-muted) text-center">لا توجد تصنيفات</p>
                                                        ) : (
                                                            categories.map((cat, index) => (
                                                                <button
                                                                    key={index}
                                                                    type="button"
                                                                    onClick={() => handleCategorySelect(cat.name)}
                                                                    className={`flex items-center gap-2 w-full px-4 py-2.5 text-[14px] transition-colors ${formData.category === cat.name
                                                                            ? 'bg-(--color-primary-light) text-(--color-primary) font-medium'
                                                                            : 'text-(--color-text-main) hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {formData.category === cat.name && <Check className="h-4 w-4 stroke-[2.5]" />}
                                                                    {cat.name}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {errors.category && (
                                                <p className="text-xs text-red-500 font-medium pr-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.category}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Extra Details */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-sm font-bold text-(--color-primary) flex items-center gap-2 mb-2">
                                        <span className="w-1.5 h-4 bg-(--color-primary) rounded-full" />
                                        تفاصيل إضافية
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Manufacturer */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                                الشركة المصنعة <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-primary)" />
                                                <input
                                                    type="text"
                                                    name="manufacturer"
                                                    value={formData.manufacturer}
                                                    onChange={handleChange}
                                                    placeholder="اسم الشركة"
                                                    className={getInputClass("manufacturer")}
                                                />
                                            </div>
                                            {errors.manufacturer && (
                                                <p className="text-xs text-red-500 font-medium pr-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.manufacturer}
                                                </p>
                                            )}
                                        </div>

                                        {/* Expiry Date */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-(--color-text-main) pr-1">
                                                تاريخ الانتهاء <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative group">
                                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-primary)" />
                                                <input
                                                    type="date"
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleChange}
                                                    className={getInputClass("expiryDate")}
                                                />
                                            </div>
                                            {errors.expiryDate && (
                                                <p className="text-xs text-red-500 font-medium pr-1 flex items-center gap-1">
                                                    <span>⚠</span> {errors.expiryDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Prescription Switch */}
                                <div className="flex items-center justify-between p-4 bg-(--color-primary-light)/20 rounded-2xl border border-(--color-primary)/10">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-(--color-primary) shadow-sm">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-(--color-text-main)">يحتاج وصفة طبية</p>
                                            <p className="text-xs text-(--color-text-muted)">هل يتطلب صرف هذا الدواء وصفة طبية؟</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="prescriptionRequired"
                                            checked={formData.prescriptionRequired}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                                    </label>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 bg-gray-50/80 border-t border-(--color-border) flex items-center justify-end gap-3 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-(--color-text-muted) hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-(--color-primary) hover:bg-(--color-primary-dark) shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                        </svg>
                                        جارٍ الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        حفظ الدواء
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
