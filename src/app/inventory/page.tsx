import Header from '@/components/inventory/Header'
import MedicineTable from '@/components/inventory/MedicineTable'
import { StatsCards } from '@/components/inventory/StatsCards'
import SearchAndCategory from '@/components/inventory/SearchAndCategory'
import React from 'react'

export default function page() {

    return (
        <>
            <Header />
            <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <StatsCards />
                <SearchAndCategory />
                <MedicineTable />
            </main>
        </>
    )
}

