import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, TextField} from "@mui/material";

const fields = [
    {id: "url", title: "URL", type: "text"},
    {id: "login", title: "Login", type: "text"},
    {id: "phone", title: "Phone", type: "text"},
    {id: "useragent", title: "UserAgent", type: "text"},
    {id: "password", title: "Password", type: "text"}
];

export default function ModalDialog({item: defitem = {}, index, onEnter, open, onClose}) {
    const [item, setItem] = useState(defitem);

    const onEnterHandle = () => {
        onEnter(item, index);
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent>
                {fields.map(({id,title,type}, i) => (
                    <TextField
                        key={i}
                        autoFocus={i === 0}
                        defaultValue={item[id]}
                        onKeyPress={e => e.key === "Enter" && onEnterHandle()}
                        onChange={e => (item[id] = e.target.value) && setItem(item)}
                        label={title}
                        fullWidth
                        margin="dense"
                        variant="standard"
                        type={type}
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
