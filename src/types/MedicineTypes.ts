



export interface BatchType {
    _id?: string;
    batchNumber: string;
    quantity: number;
    purchasePrice: number;
    expiryDate: Date;
    supplierId?: string;
    createdAt?: Date;
}

export interface MedicineType {
    id?: string;
    _id?: string;
    pharmacyId: number;
    name: string;
    barcode: string;
    category?: string;
    manufacturer?: string;
    prescriptionRequired: boolean;
    reorderLevel?: number;
    batches: BatchType[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface StockMovementType {
    _id: string;
    medicineId: string;
    medicineName: string;
    batchId?: string;
    type: "ADD" | "REMOVE" | "ADJUST";
    quantity: number;
    note: string;
    createdAt: string;
}

export interface SupplierType {
    _id?: string;
    id?: string;
    name: string;
    phone?: string;
    address?: string;
    email?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}