import React, { useState, useEffect } from "react";
import WindowManager from "../../windowManager/WindowManager";
import NewTipoAcondicionamiento from "./NewTipoAcondicionamiento";
import NewTipoOrdenAcondicionamiento from "./NewTipoOrdenAcondicionamiento";
import useUserData from '../../../hooks/useUserData';

// función principal del componente
function NewTipos() {
    // const { userName } = useUserData();
    return (
        <div >
            <WindowManager
                windowsData={[
                    // {
                    //     id: 1, title: "Tipo Orden de Acondicionamiento", component: <NewTipoOrdenAcondicionamiento />,
                    //     isProtected: true
                    // },
                    {
                        id: 1, title: "Tipos de Acondicionamiento", component: <NewTipoAcondicionamiento />,
                        isProtected: true
                    },
                ]}
            />
        </div>
    )
}

export default NewTipos;