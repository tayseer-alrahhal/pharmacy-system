'use client'
import React, { useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Search, Menu, Truck } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {

    const [greeting] = useState(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'صباح الخير'
        if (hour < 18) return 'مساء الخير'
        return 'تصبح على خير'
    })

    const modules = [
        {
            title: 'نقطة البيع',
            icon: <ShoppingCart size={32} />,
            href: '/pos',
            color: 'bg-teal-600',
        },
        {
            title: 'المخزن',
            icon: <Package size={32} />,
            href: '/inventory',
            color: 'bg-teal-600',
        },
        {
            title: 'الموردون',
            icon: <Truck size={32} />,
            href: '/suppliers',
            color: 'bg-blue-600',
        },
        {
            title: 'لوحة التحكم',
            icon: <LayoutDashboard size={32} />,
            href: '/dashboard',
            color: 'bg-teal-600',
        },
    ]

    return (
        <div className="min-h-screen bg-linear-to-br from-teal-50/50 to-white font-sans text-slate-800" dir="rtl">

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md fixed top-0 left-0 right-0 z-10 shadow-sm border-b border-teal-100/50"
            >
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-teal-600 tracking-tight">
                        نظام <span className="text-slate-600">الصيدلية</span>
                    </h1>
                </div>
                <button className="p-2 hover:bg-teal-50 rounded-full transition-all text-teal-600 cursor-pointer border border-transparent hover:border-teal-100">
                    <Menu size={24} />
                </button>
            </motion.header>


            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 flex flex-col items-center mt-24">

                {/* User Greeting & Avatar */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center mb-10"
                >
                    <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl shadow-teal-900/5 mb-4 relative group">
                        <div className="w-full h-full rounded-2xl bg-linear-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                            م
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full p-1 shadow-md">
                            <div className="w-full h-full bg-green-500 rounded-full border-2 border-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-medium text-slate-600">
                        {greeting}, <span className="font-bold text-slate-800">تيسير</span>
                    </h2>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-full max-w-2xl mb-16 group"
                >
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                        <Search className="text-slate-400 group-focus-within:text-teal-600" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="بحث ..."
                        className="w-full py-5 pr-14 pl-6 rounded-2xl bg-white shadow-xl shadow-teal-900/5 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-lg placeholder:text-slate-300 transition-all"
                    />
                </motion.div>

                {/* Modules Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, staggerChildren: 0.1 }}
                    className="flex flex-wrap justify-center gap-10 w-full max-w-5xl"
                >
                    {modules.map((module, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -8 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Link
                                href={module.href}
                                className="group flex flex-col items-center gap-4 w-32"
                            >
                                <div className={`w-24 h-24 rounded-[2rem] ${module.color} shadow-2xl shadow-teal-900/20 flex items-center justify-center transform group-hover:scale-110 group-active:scale-95 transition-all duration-300 cursor-pointer relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-white group-hover:rotate-6 transition-transform">
                                        {module.icon}
                                    </div>
                                </div>
                                <span className="text-base font-bold text-slate-600 group-hover:text-teal-600 transition-colors tracking-wide text-center uppercase">
                                    {module.title}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    )
}

