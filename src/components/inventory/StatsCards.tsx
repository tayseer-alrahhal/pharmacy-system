"use client"

import { MedicineType, SupplierType } from "@/types/MedicineTypes"
import { Package, AlertTriangle, XCircle, Clock, DollarSign, CalendarClock, Truck, Layers } from "lucide-react"
import { useEffect, useState } from "react"
import { getTotalQuantity, getMedicineStatus, getInventoryValue, getExpiringBatches } from "@/lib/inventoryUtils"

interface StatsCardsProps {
    refreshKey?: number
}

export function StatsCards({ refreshKey }: StatsCardsProps) {
    const [medicines, setMedicines] = useState<MedicineType[] | undefined>(undefined)
    const [supplierCount, setSupplierCount] = useState<number | undefined>(undefined)

    useEffect(() => {
        const fetchData = async () => {
            const [medRes, supRes] = await Promise.all([
                fetch("/api/inventory"),
                fetch("/api/suppliers"),
            ])
            const [medData, supData] = await Promise.all([medRes.json(), supRes.json()])
            setMedicines(medData.medicines)
            setSupplierCount((supData.suppliers || []).length)
        }
        fetchData()
    }, [refreshKey])

    const isLoading = medicines === undefined || supplierCount === undefined

    const totalMedicines = medicines?.length ?? 0
    const available = medicines ? medicines.filter(m => getMedicineStatus(m) === "متوفر").length : 0
    const low = medicines ? medicines.filter(m => getMedicineStatus(m) === "منخفض").length : 0
    const outOfStock = medicines ? medicines.filter(m => getMedicineStatus(m) === "نفذ").length : 0
    const expired = medicines ? medicines.filter(m => getMedicineStatus(m) === "منتهي الصلاحية").length : 0

    // New metrics
    const totalInventoryValue = medicines
        ? medicines.reduce((sum, m) => sum + getInventoryValue(m), 0)
        : 0

    const medicinesExpiringSoon = medicines
        ? medicines.filter(m => getExpiringBatches(m).length > 0).length
        : 0

    const batchesExpiringSoon = medicines
        ? medicines.reduce((sum, m) => sum + getExpiringBatches(m).length, 0)
        : 0

    const formatValue = (val: number) =>
        val.toLocaleString("ar-SA", { maximumFractionDigits: 0 })

    const cards = [
        {
            title: "اجمالي الادوية",
            value: totalMedicines,
            icon: Package,
            color: "text-(--color-primary)",
            bg: "bg-(--color-primary-light)",
        },
        {
            title: "متوفر",
            value: available,
            icon: Package,
            color: "text-(--color-success)",
            bg: "bg-(--color-primary-light)",
        },
        {
            title: "مخزون منخفض",
            value: low,
            icon: AlertTriangle,
            color: "text-(--color-warning)",
            bg: "bg-(--color-warning)/10",
        },
        {
            title: "نفذ من المخزون",
            value: outOfStock,
            icon: XCircle,
            color: "text-(--color-danger)",
            bg: "bg-(--color-danger)/10",
        },
        {
            title: "منتهي الصلاحية",
            value: expired,
            icon: Clock,
            color: "text-(--color-text-muted)",
            bg: "bg-(--color-border)",
        },
        {
            title: "قيمة المخزون (ل.س)",
            value: formatValue(totalInventoryValue),
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            title: "أدوية تنتهي قريباً",
            value: medicinesExpiringSoon,
            icon: CalendarClock,
            color: "text-orange-500",
            bg: "bg-orange-50",
        },
        {
            title: "عدد الموردين",
            value: supplierCount ?? 0,
            icon: Truck,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "وجبات تنتهي خلال 30 يوم",
            value: batchesExpiringSoon,
            icon: Layers,
            color: "text-rose-500",
            bg: "bg-rose-50",
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="rounded-xl bg-(--color-bg-card) p-4 shadow-sm border border-(--color-border) hover:shadow-md transition cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}
                        >
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-xs text-(--color-text-muted)">
                                {card.title}
                            </p>

                            <p className="font-bold text-(--color-text-main) text-lg">
                                {isLoading ? (
                                    <span className="inline-block h-3 w-14 rounded bg-(--color-border) animate-pulse " />
                                ) : (
                                    card.value
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
