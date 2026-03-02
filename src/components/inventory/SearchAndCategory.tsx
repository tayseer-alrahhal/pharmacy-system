"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from "lucide-react";
import { Category } from '@/types/categoriesTypes';
import { FilterState } from './InventoryContainer';

interface SearchAndCategoryProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
}

export default function SearchAndCategory({ filters, onFiltersChange }: SearchAndCategoryProps) {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const categoryRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
                setIsStatusOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const statuses = ["كل الحالات", "متوفر", "منخفض", "نفذ", "منتهي الصلاحية"];

    const clearFilters = () => {
        onFiltersChange({
            searchQuery: "",
            selectedCategory: "كل التصنيفات",
            selectedStatus: "كل الحالات",
        });
    };

    const hasFilters =
        filters.selectedCategory !== "كل التصنيفات" ||
        filters.selectedStatus !== "كل الحالات" ||
        filters.searchQuery !== "";

    return (
        <div className="w-full flex flex-col md:flex-row gap-3 items-center mb-6" dir="rtl">
            {/* Search Input */}
            <div className="relative flex-[2.5] w-full group">
                <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
                    placeholder="ابحث عن دواء بالاسم او رقم الدفعة..."
                    className="w-full h-11 pr-5 pl-12 bg-white border border-(--color-border) rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-(--color-primary)/10 focus:border-(--color-primary) transition-all duration-200 text-[14px] placeholder:text-(--color-text-muted) group-hover:border-gray-300"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-muted) group-focus-within:text-(--color-primary) transition-colors">
                    <Search className="h-5 w-5 stroke-[1.5] opacity-70" />
                </div>
            </div>

            {/* Category Custom Dropdown */}
            <div className="relative flex-1 w-full" ref={categoryRef}>
                <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={`flex items-center justify-between w-full h-11 px-4 bg-white border ${isCategoryOpen ? 'border-(--color-primary) ring-2 ring-(--color-primary)/10' : 'border-(--color-border)'} rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 text-[14px] text-(--color-text-main) cursor-pointer hover:border-gray-300`}
                >
                    <span className="truncate">{filters.selectedCategory}</span>
                    <ChevronDown className={`h-4 w-4 text-(--color-text-muted) transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-(--color-primary)' : ''}`} />
                </button>

                {isCategoryOpen && (
                    <div className="absolute z-50 w-full mt-2 py-1.5 bg-white border border-(--color-border) rounded-xl shadow-xl animate-in fade-in zoom-in duration-200 origin-top">
                        {categories.map((cat, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onFiltersChange({ ...filters, selectedCategory: cat.name });
                                    setIsCategoryOpen(false);
                                }}
                                className={`flex items-center gap-2 w-full px-4 py-2.5 text-[14px] transition-colors ${filters.selectedCategory === cat.name ? 'bg-(--color-primary-light) text-(--color-primary) font-medium' : 'text-(--color-text-main) hover:bg-gray-50'}`}
                            >
                                {filters.selectedCategory === cat.name && <Check className="h-4 w-4 stroke-[2.5]" />}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Status Custom Dropdown */}
            <div className="relative flex-1 w-full" ref={statusRef}>
                <button
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className={`flex items-center justify-between w-full h-11 px-4 bg-white border ${isStatusOpen ? 'border-(--color-primary) ring-2 ring-(--color-primary)/10' : 'border-(--color-border)'} rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 text-[14px] text-(--color-text-main) cursor-pointer hover:border-gray-300`}
                >
                    <span className="truncate">{filters.selectedStatus}</span>
                    <ChevronDown className={`h-4 w-4 text-(--color-text-muted) transition-transform duration-200 ${isStatusOpen ? 'rotate-180 text-(--color-primary)' : ''}`} />
                </button>

                {isStatusOpen && (
                    <div className="absolute z-50 w-full mt-2 py-1.5 bg-white border border-(--color-border) rounded-xl shadow-xl animate-in fade-in zoom-in duration-200 origin-top">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    onFiltersChange({ ...filters, selectedStatus: status });
                                    setIsStatusOpen(false);
                                }}
                                className={`flex items-center gap-2 w-full px-4 py-2.5 text-[14px] transition-colors ${filters.selectedStatus === status ? 'bg-(--color-primary-light) text-(--color-primary) font-medium' : 'text-(--color-text-main) hover:bg-gray-50'}`}
                            >
                                {filters.selectedStatus === status && <Check className="h-4 w-4 stroke-[2.5]" />}
                                {status}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Clear Filters Button */}
            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium text-(--color-danger) bg-white border border-(--color-danger)/20 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                >
                    <X className="h-4 w-4" />
                    مسح الفلترة
                </button>
            )}
        </div>
    );
}
