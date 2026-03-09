export function getTotalQuantity(medicine: any): number {
    return (medicine.batches || []).reduce((sum: number, batch: any) => sum + Number(batch.quantity || 0), 0);
}

export function getExpiredBatches(medicine: any): any[] {
    const today = new Date();
    return (medicine.batches || []).filter((batch: any) => new Date(batch.expiryDate) < today);
}

export function getNearestExpiryDate(medicine: any): Date | null {
    if (!medicine.batches || medicine.batches.length === 0) return null;
    const expiryDates = medicine.batches.map((batch: any) => new Date(batch.expiryDate).getTime());
    return new Date(Math.min(...expiryDates));
}

export function getMedicineStatus(medicine: any): "متوفر" | "منخفض" | "نفذ" | "منتهي الصلاحية" {
    const totalQuantity = getTotalQuantity(medicine);
    const expiredBatchesCount = getExpiredBatches(medicine).length;

    if (expiredBatchesCount > 0) return "منتهي الصلاحية";
    if (totalQuantity === 0) return "نفذ";
    if (totalQuantity <= (medicine.reorderLevel || 10)) return "منخفض";
    return "متوفر";
}

/**
 * Calculate total inventory value for a medicine.
 * inventoryValue = Σ (batch.quantity × batch.purchasePrice)
 * NOT stored in DB — always calculated dynamically.
 */
export function getInventoryValue(medicine: any): number {
    return (medicine.batches || []).reduce(
        (sum: number, batch: any) => sum + Number(batch.quantity || 0) * Number(batch.purchasePrice || 0),
        0
    );
}

/**
 * Return batches expiring within the next 30 days (but not yet expired).
 */
export function getExpiringBatches(medicine: any): any[] {
    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    return (medicine.batches || []).filter((batch: any) => {
        const expiry = new Date(batch.expiryDate);
        return expiry >= today && expiry <= in30Days;
    });
}
