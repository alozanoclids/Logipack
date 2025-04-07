import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager";
import NewAdaptation from "./NewAdaptation";

function Adaptation() {
    return (
        <WindowManager
            windowsData={[
                { id: 1, title: "Acondicionamiento", component: <NewAdaptation />, isProtected: true },
            ]}
        />
    )
}

export default Adaptation