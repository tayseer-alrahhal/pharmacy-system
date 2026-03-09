import z from "zod";







export const BatchSchema = z.object({
    batchNumber: z.string().min(1, "رقم الوجبة مطلوب"),
    quantity: z.coerce.number({
        message: "يجب إدخال كمية صحيحة"
    }).int("الكمية يجب أن تكون عدداً صحيحاً").min(0, "الكمية يجب أن لا تكون سالبة"),
    purchasePrice: z.coerce.number({
        message: "يجب إدخال سعر شراء صحيح"
    }).min(0, "يجب أن لا يكون السعر أقل من 0"),
    expiryDate: z.coerce.date({
        message: "تاريخ انتهاء الصلاحية غير صحيح"
    }),
});

export const AddMedicineSchema = z.object({
    name: z.string().min(2, "يجب أن يكون اسم الدواء حرفين على الأقل"),
    barcode: z.string().min(1, "الباركود مطلوب"),
    category: z.string().min(1, "يجب اختيار القسم"),
    manufacturer: z.string().min(2, "يجب إدخال اسم الشركة المصنعة"),
    prescriptionRequired: z.boolean().default(false),
    reorderLevel: z.coerce.number().default(10),
    // Initial batch info
    batchNumber: z.string().min(1, "رقم الوجبة مطلوب"),
    quantity: z.coerce.number().int("يجب إدخال عدد صحيح").min(1, "الكمية يجب أن تكون 1 على الأقل"),
    purchasePrice: z.coerce.number({ message: "سعر الشراء مطلوب" }).min(0, "يجب أن لا يكون السعر أقل من 0"),
    expiryDate: z.coerce.date({ message: "تاريخ انتهاء الصلاحية غير صحيح" }),
});

export const AddBatchSchema = BatchSchema;

export const UpdateMedicineSchema = z.object({
    name: z.string().min(1, "اسم الدواء مطلوب"),
    category: z.string().min(1, "التصنيف مطلوب"),
    manufacturer: z.string().min(1, "الشركة المصنعة مطلوبة"),
    barcode: z.string().min(1, "رقم الباركود مطلوب"),
    reorderLevel: z.number().min(0).default(10),
    prescriptionRequired: z.boolean().default(false),
});
