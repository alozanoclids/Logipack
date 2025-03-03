import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager";
import NewMaestra from "./NewMaestra";

function Maestras() {
    return (
        <div>
            <WindowManager
                windowsData={[
                    { id: 1, title: "Maestras", component:<NewMaestra />, isProtected: true }
                ]}
            />
        </div>
    )
}

export default Maestras