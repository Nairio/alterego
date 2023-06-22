import React from "react";
import ModalDialog from "../modal-dialog";
import ContextMenu from "./context-menu";

export default function EditDialog({deleteItem, editItem, item, index}) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className={"edit"}>
            <ContextMenu index={index} editItem={() => setOpen(true)} deleteItem={deleteItem}/>
            <ModalDialog index={index} item={item} onEnter={editItem} open={open} onClose={() => setOpen(false)}/>
        </>
    );
}
