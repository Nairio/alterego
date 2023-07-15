import Webview from "./webview";
import React, {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import Sortable from "sortablejs";
import {ContextMenuGroup, ContextMenuItem} from "./context-menu";
import {actions} from "../../redux/rtk";


const {deleteItem, saveGroups,saveItems, deleteGroup, setSelectedGroupId} = window.main;

let NSort, NSorts = {};

function CardItems({items, groupid}) {
    const dispatch = useDispatch();
    const listRef = useRef(null);

    useEffect(() => {
        NSorts[groupid] && NSorts[groupid].destroy();
        NSorts[groupid] = new Sortable(listRef.current, {
            animation: 500,
            ghostClass: "sortable-background",
            dataIdAttr: "id",
            dragClass: "sortable-drag",
            onSort: () => saveItems(NSorts[groupid].toArray().reduce((a, c) => ([...a, items.filter(i => i.id === c)[0]]), []))
        });
    }, [items]);

    const openModalDialogItems = (item) => {
        dispatch(actions.modalDialogItems.open(item))
    }

    return (
        <div className={"accordion-content"} ref={listRef}>
            {items.filter(item => item.groupid === groupid).map((item) => (
                <div key={item.id} className={"card"} id={item.id}>
                    <Webview item={item}/>
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
    )
}


export default function Cards() {
    const dispatch = useDispatch();
    const settings = useSelector(state => state.settings);
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
            onSort: () => saveGroups(NSort.toArray().reduce((a, c) => ([...a, groups.filter(i => i.id === c)[0]]), []))
        });
    }, [items]);

    const openModalDialogItems = (item) => {
        dispatch(actions.modalDialogItems.open(item))
    }

    const openModalDialogGroup = (group) => {
        dispatch(actions.modalDialogGroups.open(group))
    }

    const selectedGroupId = (id) => {
        setSelectedGroupId(id === settings.selectedGroupId ? "0" : id)
    }

    return (
        <div className="cards" ref={listRef}>
            {groups.map(group => (
                <div key={group.id} className={"group"}  id={group.id}>
                    <div className={`accordion-header ${settings.selectedGroupId === group.id ? 'active' : ''}`}>
                        <h1>
                            <ContextMenuGroup group={group} deleteGroup={deleteGroup} editGroup={openModalDialogGroup} addItem={openModalDialogItems}/>
                            <small onClick={() => selectedGroupId(group.id)}>{group.description}</small>
                        </h1>
                    </div>
                    <CardItems groupid={group.id} items={items}/>
                </div>
            ))}
        </div>
    )
}


