import Header from '@/components/inventory/Header'
import Medicine from '@/components/inventory/Medicine'
import MedicineTable from '@/components/inventory/MedicineTable'
import { StatsCards } from '@/components/inventory/StatsCards'
import React from 'react'

export default function page() {



    return (
        <>
            <Header />
            <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <StatsCards />
                <MedicineTable />
                {/* <Medicine /> */}
            </main>
        </>
    )
}
