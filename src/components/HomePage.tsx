'use client'
import React, { useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Search, Menu } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {

    const [greeting] = useState(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'صباح الخير'
        if (hour < 18) return 'مساء الخير'
        return 'تصبح على خير'
    })


    const modules = [
        {
            title: 'نقطة البيع', // POS
            icon: <ShoppingCart size={32} className="text-white" />,
            href: '/pos',
            color: 'bg-[var(--color-primary)]',
        },
        {
            title: 'المخزن', // Inventory
            icon: <Package size={32} className="text-white" />,
            href: '/inventory',
            color: 'bg-[var(--color-primary)]',
        },
        {
            title: 'لوحة التحكم', // Dashboard
            icon: <LayoutDashboard size={32} className="text-white" />,
            href: '/dashboard',
            color: 'bg-[var(--color-primary)]',
        },
        // {
        //     title: 'الصيدلي', // Pharmacist
        //     icon: <Briefcase size={32} className="text-white" />,
        //     href: '/pharmacist',
        //     color: 'bg-[var(--color-primary)]',
        // },
    ]

    return (
        <div className="min-h-screen bg-linear-to-br from-teal-50 to-white font-sans text-slate-800" dir="rtl">

            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md fixed top-0 left-0 right-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-(--color-primary) tracking-tight">
                        نظام <span className="text-slate-600">الصيدلية</span>
                    </h1>
                </div>
                <button className="p-2 hover:bg-teal-50/50 rounded-full transition-colors text-(--color-primary)">
                    <Menu size={24} />
                </button>
            </header>


            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 flex flex-col items-center mt-20">

                {/* User Greeting & Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden mb-4 border-4 border-white shadow-lg">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full bg-linear-to-tr from-teal-200 to-blue-200 flex items-center justify-center text-2xl font-bold text-white">
                            م
                        </div>
                    </div>
                    <h2 className="text-xl font-medium text-slate-600">{greeting}, <span className="font-bold text-slate-800">تيسير</span></h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-2xl mb-12 transform hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="بحث ..."
                        className="w-full py-4 pr-12 pl-6 rounded-full bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-slate-100 focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-lg placeholder:text-slate-300 transition-shadow"
                    />
                </div>

                {/* Modules Grid */}
                <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl">
                    {modules.map((module, index) => (
                        <Link
                            key={index}
                            href={module.href}
                            className="group flex flex-col items-center gap-3 w-28"
                        >
                            <div className={`w-20 h-20 rounded-2xl ${module.color} shadow-lg shadow-teal-900/10 flex items-center justify-center transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                                {module.icon}
                            </div>
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-(--color-primary) transition-colors uppercase tracking-wide text-center">
                                {module.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}


