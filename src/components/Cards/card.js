import {useDispatch, useSelector} from "react-redux";
import React from "react";
import {actions} from "../../redux/rtk";
import {ContextMenuItem} from "./context-menu";
import Webview from "../Webview/webview";
import {Sortable} from "./sortable";

export function Cards({items, group, className}) {
    const groupItems = items.filter(item => item.groupid === group.id);
    const nonGroupItems = items.filter(item => item.groupid !== group.id);
    const onSort = (a) => window.main.saveItems(a.reduce((a, c) => ([...a, items.filter(i => i.id === c)[0]]), nonGroupItems))
    
    return (
        <Sortable id={group.id} onSort={onSort} className={className}>
            {groupItems.map((item) => (
                <Card key={item.id} item={item} group={group}/>
            ))}
        </Sortable>
    )
}
export function Card({group, item}) {
    const dispatch = useDispatch();
    const openModalDialogItems = (item) => dispatch(actions.modalDialogItems.open(item));
    const {selectedItemId} = useSelector(state => state);

    return (
        <div key={item.id} className={`card ${selectedItemId===item.id && "selected"}`} id={item.id}>
            <Webview item={item} group={group}/>
            <div className={"footer"}>
                <div className={"edit"}>
                    <ContextMenuItem item={item} deleteItem={window.main.deleteItem} editItem={openModalDialogItems}/>
                </div>
                <div>
                    <div>{item.url}</div>
                    <div>{item.description}</div>
                </div>
            </div>
        </div>
    )
}
