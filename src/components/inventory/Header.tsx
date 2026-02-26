"use client"

import React, { useState } from 'react'
import { Plus, Pill, RefreshCw, LogOut } from "lucide-react"
import Link from 'next/link'
import AddMedicineModel from './AddMedicineModel'

interface HeaderProps {
    onAddClick: () => void;
}

export default function Header({ onAddClick }: HeaderProps) {
    return (
        <header className="relative top-0 z-40 border-b bg-(--color-bg-card) backdrop-blur border-(--color-border)">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-primary)">
                        <Pill className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-(--color-text-main)">
                            ادارة المخزون
                        </h1>
                        <p className="text-xs text-(--color-text-muted)">
                            نظام ادارة مخزون الصيدلية
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.location.reload()}
                        aria-label="تحديث"
                        className="flex items-center justify-center w-10 h-10 rounded-md transition cursor-pointer text-(--color-text-muted) border border-(--color-border) hover:bg-(--color-bg-hover)"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>

                    <button
                        onClick={onAddClick}
                        className="flex items-center px-4 py-2 rounded-md text-white transition bg-(--color-primary-dark) hover:bg-(--color-primary) cursor-pointer"
                    >
                        <Plus className="ml-2 h-4 w-4" />
                        اضافة دواء
                    </button>

                    <Link href="/" className='flex items-center px-4 py-3 rounded-md text-white transition bg-(--color-danger) hover:bg-(--color-danger)/80 cursor-pointer'>
                        <LogOut className=" h-4 w-4" />
                    </Link>
                </div>
            </div>
        </header>

    )
}
