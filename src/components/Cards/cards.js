import Webview from "./webview";
import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import EditDialog from "./edit-dialog";
import Sortable from "sortablejs";

const {deleteItem, editItem, saveItems} = window.main;

let NSort;

export default function Cards() {
    const items = useSelector(state => state.items);
    const listRef = useRef(null);

    useEffect(() => {
        NSort && NSort.destroy();
        NSort = new Sortable(listRef.current, {
            animation: 500,
            ghostClass: "sortable-background",
            dataIdAttr: "id",
            dragClass: "sortable-drag",
            onSort: () => saveItems(NSort.toArray().reduce((a, c) => ([...a, items.filter(i => i.id === c)[0]]), []))
        });
    }, [items]);

    return (
        <div className="cards" ref={listRef}>
            {items.map((item) => (
                <div className={"card"} key={item.id} id={item.id}>
                    <Webview item={item}/>
                    <div className={"footer"}>
                        <EditDialog item={item} deleteItem={deleteItem} editItem={editItem}/>
                        <div>
                            <div>{item.url}</div>
                            <div>{item.description}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}