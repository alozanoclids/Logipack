import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager";
import EditPlanning from "./EditPlanning";

function Planificacion() {
  return (
    <WindowManager
      windowsData={[
        { id: 1, title: "Planificación", component: <EditPlanning />, isProtected: true },
      ]}
    />
  )
}

export default Planificacion