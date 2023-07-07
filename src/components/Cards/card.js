import React from "react";
import EditDialog from "./edit-dialog";

export default function Card({WVRef, item, index, deleteItem, editItem, children}) {
    return (
        <div className={"card"}>
            {children}
            <div className={"footer"}>
                <EditDialog WVRef={WVRef} index={index} item={item} deleteItem={deleteItem} editItem={editItem}/>
                <div>
                    <div>{item.url}</div>
                    <div>{item.description}</div>
                </div>
            </div>
        </div>
    )
}
