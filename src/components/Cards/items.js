import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {Groups} from "./group";


export function Items() {
    const panelShow = useSelector(state => state.settings.panelShow);

    useEffect(()=>{
        window.dispatchEvent(new UIEvent("resize"));
    }, [panelShow])

    return (
        <div className={panelShow ? "visible" : "hidden"}>
            <Groups/>
        </div>
    )
}


