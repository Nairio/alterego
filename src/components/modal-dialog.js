import React, {useEffect, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, TextField} from "@mui/material";

const fields = [
    {id: "description", title: "Description", type: "text"},
    {id: "zone", title: "Zone", type: "text"},
    {id: "autostart", title: "Auto Start", type: "text"},
    {id: "url", title: "URL", type: "text"},
    {id: "useragent", title: "UserAgent", type: "text"},
    {id: "proxy", title: "Proxy", type: "text"},
    {id: "lang", title: "Language", type: "text"},
    {id: "lat", title: "Latitude", type: "text"},
    {id: "lng", title: "Longitude", type: "text"},
    {id: "scriptfile", title: "ScriptFile", type: "text"}
];

export default function ModalDialog({item: defitem = {}, index, onEnter, open, onClose}) {
    const [item, setItem] = useState(defitem);
    const [dataItems, setDataItems] = useState([]);

    useEffect(() => {
        open && window.main.getDataItems(index).then(dataItems => setDataItems(dataItems || []))
    },[open])

    const onEnterHandle = () => {
        onEnter(item, index);
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent>
                {[...fields, ...dataItems].map(({id,title,type}, i) => (
                    <TextField
                        key={id}
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
