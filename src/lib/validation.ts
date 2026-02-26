import z from "zod";







export const AddMedicineSchema = z.object({
    name: z.string().min(2, "يجب أن يكون اسم الدواء حرفين على الأقل"),
    barcode: z.string().min(1, "الباركود مطلوب"),
    price: z.coerce.number({
        message: "يجب إدخال سعر صحيح"
    }).min(0.01, "يجب أن يكون السعر أكبر من 0"),
    quantity: z.coerce.number({
        message: "يجب إدخال كمية صحيحة"
    }).int("الكمية يجب أن تكون عدداً صحيحاً").min(1, "الكمية يجب أن تكون 1 على الأقل"),
    category: z.string().min(1, "يجب اختيار القسم"),
    manufacturer: z.string().min(2, "يجب إدخال اسم الشركة المصنعة"),
    expiryDate: z.coerce.date({
        message: "تاريخ انتهاء الصلاحية غير صحيح"
    }),
    prescriptionRequired: z.boolean().default(false),
})