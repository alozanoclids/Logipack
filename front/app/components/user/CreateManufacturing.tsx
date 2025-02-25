"use client";
import { useState, useEffect } from "react";
import { createManu, getManu, getManuId, deleteManu, updateManu } from '../../services/userDash/manufacturingServices';

interface Manu {
    id: number;
    name: string; 
}

function CreateManufacturing() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
     

    return (
        <div>
             

            
        </div>
    );
}

export default CreateManufacturing;
