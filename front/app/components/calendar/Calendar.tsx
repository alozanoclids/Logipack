import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager";
import Gantt from "./CalendarGantt";
import useUserData from '../../hooks/useUserData';

function Calendar() {
    const { userName } = useUserData();
    return (
        <div >
            <WindowManager
                windowsData={[
                    { id: 1, title: "Calendario", component:<Gantt />, isProtected: true }, 
                ]}
            />
        </div>
    )
}

export default Calendar