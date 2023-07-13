import Webview from "./webview";
import React from "react";
import {useSelector} from "react-redux";
import EditDialog from "./edit-dialog";

const {deleteItem, editItem} = window.main;

export default function Cards() {
    const items1 = useSelector(state => state.items);

    const items = [...items1].sort((a, b) => {
        const s1 = +a.sort || "";
        const s2 = +b.sort || "";
        if (s1 === "" && s2 === "") return 0;
        if (s1 === "" && s2 !== "") return 1;
        if (s1 !== "" && s2 === "") return -1;
        if (s1 > s2) return 1;
        if (s2 > s1) return -1;
        return 0
    });

    return (
        <div className="cards">
            {items.map((item) => {
                return (
                    <div className={"card"} key={item.id}>
                        <Webview item={item}/>
                        <div className={"footer"}>
                            <EditDialog item={item} deleteItem={deleteItem} editItem={editItem}/>
                            <div>
                                <div>{item.url}</div>
                                <div>{item.description}</div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}