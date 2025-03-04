import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager";
import NewMaestra from "./NewMaestra";
import NewStage from "./NewStage";
import NewActivity from "./NewActivity";

function Maestras() {
    return (
        <div>
            <WindowManager
                windowsData={[
                    { id: 1, title: "Maestras", component:<NewMaestra />, isProtected: true },
                    { id: 2, title: "Fases", component:<NewStage />, isProtected: true },
                    { id: 3, title: "Asociar Actividad", component:<NewActivity />, isProtected: true },
                ]}
            />
        </div>
    )
}

export default Maestras