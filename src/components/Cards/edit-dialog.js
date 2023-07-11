import React, {useState} from "react";
import ModalDialog from "../modal-dialog";
import ContextMenu from "./context-menu";

export default function EditDialog({deleteItem, editItem, item, index}) {
    const [open, setOpen] = useState(false);
    return (
        <div className={"edit"}>
            <ContextMenu index={index} deleteItem={deleteItem} editItem={() => setOpen(true)}/>
            <ModalDialog index={index} item={item} onEnter={editItem} open={open} onClose={() => setOpen(false)}/>
        </div>
    )
}
