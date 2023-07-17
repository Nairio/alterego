import React from "react";
import {useSelector} from "react-redux";
import {Groups} from "./group";


export function Items() {
    const cardsOpen = useSelector(state => state.settings.cardsOpen);

    return (
        <div className={cardsOpen ? "visible" : "hidden"}>
            <Groups/>
        </div>
    )
}


