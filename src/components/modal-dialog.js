import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, TextField} from "@mui/material";


export default function ModalDialog({item: defitem = {}, onEnter, open, onClose}) {
    const keys = ["url", "login", "useragent", "password"];
    const [item, setItem] = useState(defitem);

    const onEnterHandle = () => {
        onEnter(item);
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent>
                {keys.map((id, i) => (
                    <TextField
                        key={i}
                        autoFocus={i === 0}
                        defaultValue={item[id]}
                        onKeyPress={e => e.key === "Enter" && onEnterHandle()}
                        onChange={e => (item[id] = e.target.value) && setItem(item)}
                        label={id}
                        fullWidth
                        margin="dense"
                        variant="standard"
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onEnterHandle}>Ok</Button>
            </DialogActions>
        </Dialog>
    );
}
