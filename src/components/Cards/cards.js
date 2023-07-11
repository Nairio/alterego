import Webview from "./webview";
import React from "react";
import {useSelector} from "react-redux";
import EditDialog from "./edit-dialog";

const {deleteItem, editItem} = window.main;

export default function Cards() {
    const items = useSelector(state => state.items);

    return (
        <div className="cards">
            {items.map((item, index) => {
                return (
                    <div className={"card"} key={index}>
                        <Webview index={index} item={item}/>
                        <div className={"footer"}>
                            <EditDialog index={index} item={item} deleteItem={deleteItem} editItem={editItem}/>
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