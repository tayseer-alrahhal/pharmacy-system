



export interface MedicineType {
    id: number;
    pharmacyId: number;
    name: string;
    barcode: string;
    price: number;
    quantity: number;
    category?: string;
    manufacturer?: string;
    expiryDate: Date;
    prescriptionRequired: boolean;
}