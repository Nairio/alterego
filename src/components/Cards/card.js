import React from "react";
import EditDialog from "./edit-dialog";

export default function Card({data: {deleteItem, editItem, index, url, login, password}, children}) {
    return (
        <div className={"card"}>
            {children}
            <div className={"footer"}>
                <EditDialog data={{index, url, login, password}} deleteItem={deleteItem} editItem={editItem}/>
                <div>
                    <div>{url}</div>
                    <div>{login}</div>
                </div>
            </div>
        </div>
    )
}
