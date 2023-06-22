import React from "react";
import EditDialog from "./edit-dialog";

export default function Card({item, deleteItem, editItem, index, children}) {
    return (
        <div className={"card"}>
            {children}
            <div className={"footer"}>
                <EditDialog index={index} item={item} deleteItem={deleteItem} editItem={editItem}/>
                <div>
                    <div>{item.url}</div>
                    <div>{item.login}</div>
                </div>
            </div>
        </div>
    )
}
