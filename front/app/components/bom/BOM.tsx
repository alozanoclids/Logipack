import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager"; 
import NewBOM from './NewBOM';

function BOM() {
    return (
        <div>
            <WindowManager
                windowsData={[
                    { id: 1, title: "BOM", component: <NewBOM />, isProtected: true },
                ]}
            />
        </div>
    )
}

export default BOM