import {useDispatch, useSelector} from "react-redux";
import {actions} from "../../redux/rtk";
import {ContextMenuGroup} from "./context-menu";
import React from "react";
import {Fab} from "@mui/material";
import {Sortable} from "./sortable";
import {Cards} from "./card";

export function Groups() {
    const dispatch = useDispatch();
    const settings = useSelector(state => state.settings);
    const groups = useSelector(state => state.groups);
    const items = useSelector(state => state.items);

    const onSort = (a) => window.main.saveGroups(a.reduce((a, c) => ([...a, groups.filter(i => i.id === c)[0]]), []));
    const openModalDialogGroup = (group) => dispatch(actions.modalDialogGroups.open(group));

    return (
        <>
            <Sortable id={"group"} onSort={onSort} className="cards">
                {groups.map(group => (
                    <Group key={group.id} group={group} settings={settings} items={items}/>
                ))}
            </Sortable>
            <Fab className={"add-group-dialog"} color="primary" size="small" onClick={() => openModalDialogGroup({})}>+</Fab>
        </>
    )
}
export function Group({group, items, settings}) {
    const dispatch = useDispatch();
    const selectedGroupId = (id) => {
        id = id !== settings.selectedGroupId && id;
        !id && dispatch(actions.selectedItemId.set(id));
        dispatch(actions.selectedGroupId.set(id));
    }
    const openModalDialogItems = (item) => dispatch(actions.modalDialogItems.open(item));
    const openModalDialogGroup = (group) => dispatch(actions.modalDialogGroups.open(group));

    return (
        <div key={group.id} className={"group"} id={group.id}>
            <div className={`accordion-header ${settings.selectedGroupId === group.id ? "active" : ""}`}>
                <h1>
                    <ContextMenuGroup group={group} deleteGroup={window.main.deleteGroup} editGroup={openModalDialogGroup} addItem={openModalDialogItems}/>
                    <small onClick={() => selectedGroupId(group.id)}>{group.description}</small>
                </h1>
            </div>
            <Cards className={"accordion-content"} items={items} group={group}/>
        </div>
    )
}
