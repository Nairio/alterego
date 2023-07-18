import React from "react";
import {useSelector} from "react-redux";
import {Groups} from "./group";


export function Items() {
    const panelShow = useSelector(state => state.settings.panelShow);

    return (
        <div className={panelShow ? "visible" : "hidden"}>
            <Groups/>
        </div>
    )
}


