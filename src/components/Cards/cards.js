import Webview from "./webview";
import React, {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import Sortable from "sortablejs";
import {ContextMenuItem, ContextMenuGroup} from "./context-menu";
import {actions} from "../../redux/rtk";

const {deleteItem, saveItems, deleteGroup} = window.main;

let NSort;

export default function Cards() {
    const dispatch = useDispatch();
    const groups = useSelector(state => state.groups);
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

    const openModalDialogItems = (item) => {
        dispatch(actions.modalDialogItems.open(item))
    }

    const openModalDialogGroup = (group) => {
        dispatch(actions.modalDialogGroups.open(group))
    }

    return (
        <div className="cards" ref={listRef}>
            {groups.map(group=>(
                <div key={group.id} className={"group"}>
                    <h1>
                        <ContextMenuGroup group={group} deleteGroup={deleteGroup} editGroup={openModalDialogGroup} addItem={openModalDialogItems}/>
                        {group.description}
                    </h1>
                    <div>
                        {items.filter(item=>item.groupid===group.id).map((item) => (
                            <div className={"card"} key={item.id} id={item.id}>
                                <Webview group={group} item={item}/>
                                <div className={"footer"}>
                                    <div className={"edit"}>
                                        <ContextMenuItem item={item} deleteItem={deleteItem} editItem={openModalDialogItems}/>
                                    </div>
                                    <div>
                                        <div>{item.url}</div>
                                        <div>{item.description}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}