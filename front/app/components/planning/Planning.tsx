import React, { useState, useEffect } from "react";
import WindowManager from "../windowManager/WindowManager";
import EditPlanning from "./EditPlanning";
import useUserData from "../../hooks/useUserData";

function Planificacion() {
  const { userName } = useUserData();
  return (
    <WindowManager
      windowsData={[
        { id: 1, title: "Planificación", component: <EditPlanning />, isProtected: true },
      ]}
    />
  )
}

export default Planificacion