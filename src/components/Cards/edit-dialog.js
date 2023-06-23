import React, {useState} from "react";
import ModalDialog from "../modal-dialog";
import ContextMenu from "./context-menu";

export default function EditDialog({WVRef, deleteItem, editItem, item, index}) {
    const [open, setOpen] = useState(false);

    return (
        <div className={"edit"}>
            <ContextMenu WVRef={WVRef} index={index} editItem={() => setOpen(true)} deleteItem={deleteItem}/>
            <ModalDialog index={index} item={item} onEnter={editItem} open={open} onClose={() => setOpen(false)}/>
        </div>
    );
}
