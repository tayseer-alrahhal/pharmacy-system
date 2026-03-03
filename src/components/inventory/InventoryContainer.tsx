"use client"

import Header from '@/components/inventory/Header'
import MedicineTable from '@/components/inventory/MedicineTable'
import { StatsCards } from '@/components/inventory/StatsCards'
import SearchAndCategory from '@/components/inventory/SearchAndCategory'
import React, { useState } from 'react'
import AddMedicineModel from './AddMedicineModel'

export interface FilterState {
    searchQuery: string;
    selectedCategory: string;
    selectedStatus: string;
    sortOrder: string;
}

export default function InventoryContainer() {
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        searchQuery: "",
        selectedCategory: "كل التصنيفات",
        selectedStatus: "كل الحالات",
        sortOrder: "الافتراضي",
    });

    return (
        <>
            <Header onAddClick={() => setOpen(true)} />
            <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <StatsCards />
                <SearchAndCategory filters={filters} onFiltersChange={setFilters} />
                <MedicineTable filters={filters} />
            </main>

            <AddMedicineModel open={open} setOpen={setOpen} />
        </>
    )
}
