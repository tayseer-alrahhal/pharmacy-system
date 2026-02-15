"use client";

import { MedicineType } from '@/types/MedicineTypes';
import React, { useEffect, useState } from 'react'

export default function Medicine() {
    const [medicines, setMedicines] = useState([]);



    useEffect(() => {
        const fetchMedicines = async () => {
            const res = await fetch("/api/inventory");
            const data = await res.json();
            setMedicines(data.medicines);
        }

        fetchMedicines();
    }, [])



    return (
        <div>
            {medicines.map((medicines: MedicineType) => (
                <div key={medicines.id}>
                    <h2>{medicines.name}</h2>
                    <p>Barcode: {medicines.barcode}</p>
                    <p>Price: {medicines.price}</p>
                    <p>Quantity: {medicines.quantity}</p>
                </div>
            ))}
        </div>
    )
}
