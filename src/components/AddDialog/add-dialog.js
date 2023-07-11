import React, {useState} from "react";
import ModalDialog from "../modal-dialog";
import {Fab} from "@mui/material";

export default function AddDialog() {
    const [open, setOpen] = useState(false);

    return (
        <div className={"add-dialog"}>
            <Fab color="primary" size="small" onClick={() => setOpen(true)}>+</Fab>
            <ModalDialog onEnter={window.main.addItem} open={open} onClose={() => setOpen(false)}/>
        </div>
    );
}
