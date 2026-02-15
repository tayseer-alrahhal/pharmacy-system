"use client"

import { MedicineType } from "@/types/MedicineTypes"
import { Package, AlertTriangle, XCircle, Clock, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsData {
    total: number
    available: number
    low: number
    outOfStock: number
    expired: number
    totalValue: number
}

export function StatsCards() {
    const [statsData, setStatsData] = useState<MedicineType[]>();


    useEffect(() => {
        const fetchStats = async () => {
            const response = await fetch("/api/inventory")
            const data = await response.json();
            setStatsData(data.medicines);
            console.log(data.medicines.length);
        }
        fetchStats();
    }, [])




    const stats: StatsData = {
        total: statsData ? statsData.length : 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        available: statsData ? statsData.filter((med: any) => med.quantity > 0 && new Date(med.expiryDate) > new Date()).length : 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        low: statsData ? statsData.filter((med: any) => med.quantity > 0 && med.quantity <= 15 && new Date(med.expiryDate) > new Date()).length : 0,
        outOfStock: statsData
            ? statsData.filter((med) => med.quantity === 0).length
            : 0,


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expired: statsData ? statsData.filter((med: any) => new Date(med.expiryDate) < new Date()).length : 0,
        totalValue: statsData
            ? statsData.reduce((total, med) => total + med.price, 0)
            : 0,

    }


    const cards = [
        {
            title: "اجمالي الادوية",
            value: stats?.total ?? 0,
            icon: Package,
            color: "text-(--color-primary)",
            bg: "bg-(--color-primary-light)",
        },
        {
            title: "متوفر",
            value: stats?.available ?? 0,
            icon: Package,
            color: "text-(--color-success)",
            bg: "bg-(--color-primary-light)",
        },
        {
            title: "مخزون منخفض",
            value: stats?.low ?? 0,
            icon: AlertTriangle,
            color: "text-(--color-warning)",
            bg: "bg-(--color-warning)/10",
        },
        {
            title: "نفذ من المخزون",
            value: stats?.outOfStock ?? 0,
            icon: XCircle,
            color: "text-(--color-danger)",
            bg: "bg-(--color-danger)/10",
        },
        {
            title: "منتهي الصلاحية",
            value: stats?.expired ?? 0,
            icon: Clock,
            color: "text-(--color-text-muted)",
            bg: "bg-(--color-border)",
        },
        {
            title: "القيمة الاجمالية",
            value: stats
                ? `${stats.totalValue.toLocaleString("ar-SA")} ل.س`
                : "0 ل.س",
            icon: DollarSign,
            color: "text-(--color-primary)",
            bg: "bg-(--color-primary-light)",
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="rounded-xl bg-(--color-bg-card) p-4 shadow-sm border border-(--color-border) hover:shadow-md transition"
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

                            <p className="text-lg font-bold text-(--color-text-main)">
                                {!statsData ? (
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
