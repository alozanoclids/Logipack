import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager";
import NewMaestra from "./NewMaestra";
import NewStage from "./NewStage";
import NewTypeStage from "./NewTypeStage";
import NewActivity from "./NewActivity"; 
import useUserData from '../../hooks/useUserData';
function Maestras() {
    const { userName } = useUserData();
    return (
        <div >
            <WindowManager
                windowsData={[
                    { id: 1, title: "Maestras", component:<NewMaestra />, isProtected: true },
                    { id: 2, title: "Tipos de Acondicionamiento", component:<NewTypeStage />, isProtected: true },
                    { id: 3, title: "Fases", component:<NewStage />, isProtected: true },
                    { id: 4, title: "Asociar Actividad", component:<NewActivity />, isProtected: true },
                ]}
            />
        </div>
    )
}

export default Maestras