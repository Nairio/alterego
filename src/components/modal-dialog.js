import React, {useEffect, useState} from "react";
import {
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Switch,
    TextField
} from "@mui/material";
import {onMapData, openMap} from "./map/map";

const fields = [
    {id: "autostart", title: "Auto Start", type: "checkbox"},
    {id: "description", title: "Description", type: "text"},
    {id: "zone", title: "Zone", type: "text"},
    {id: "url", title: "URL", type: "text"},
    {id: "useragent", title: "UserAgent", type: "text"},
    {id: "proxy", title: "Proxy", type: "text"},
    {id: "lang", title: "Language", type: "text"},
    {id: "coords", title: "Coords", type: "coords"},
    {id: "scriptfile", title: "ScriptFile", type: "script"}
];

const Input = ({field, value, onEnter, onChange, force}) => {
    return (
        <TextField
            value={force ? value:undefined}
            defaultValue={!force ? value:undefined}
            onKeyPress={e => e.key === "Enter" && onEnter()}
            onChange={(e) => onChange(e.target.value)}
            label={field.title}
            fullWidth
            margin="dense"
            variant="standard"
            type={field.type}
        />
    )
}
const InputCheckbox = ({field, value, onChange}) => {
    const [checked, setChecked] = useState(value);
    return (
        <FormControlLabel
            control={<Switch color="primary"/>}
            checked={checked}
            onChange={(e) => {
                setChecked(e.target.checked);
                onChange(e.target.checked)
            }}
            label={field.title}
            margin="dense"
            variant="standard"
        />
    )
}
const InputScript = ({field, value, onEnter, onChange}) => {
    const [scriptfile, setScriptfile] = useState(value);
    const onOpenScriptFile = () => window.main.openScriptFile(scriptfile);
    const onOpenDownloadDirectory = () => window.main.openDownloadDirectory(scriptfile);
    const onChangeHandler = (value) => {
        setScriptfile(value);
        onChange(value)
    }

    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <Input field={field} value={value} onEnter={onEnter} onChange={onChangeHandler}/>
            <ButtonGroup disabled={!scriptfile}>
                <Button size={"small"} color={"primary"} onClick={onOpenScriptFile}>File</Button>
                <Button size={"small"} color={"primary"} onClick={onOpenDownloadDirectory}>Downloads</Button>
            </ButtonGroup>
        </div>
    )
}
const InputCoords = ({field, value: defValue, onEnter, onChange}) => {
    const [value, setValue] = useState(defValue);
    const onChangeHandler = (v) => {
        setValue(v);
        onChange(v)
    }

    useEffect(()=>{
        onMapData(coords => onChangeHandler(coords))
    })


    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <Input force={true} field={field} value={value} onEnter={onEnter} onChange={onChangeHandler}/>
            <Button size={"small"} color={"primary"} variant={"outlined"} onClick={() => openMap(value)}>Map</Button>
        </div>
    )
}
const InputToggle = ({field, item, onChange, onEnter}) => {
    const value = item[field.id];
    const onChangeHandler = (value) => onChange(field.id, value);

    const inputs = {
        checkbox: <InputCheckbox field={field} value={value} onChange={onChangeHandler} onEnter={onEnter}/>,
        password: <Input field={field} value={value} onChange={onChangeHandler} onEnter={onEnter}/>,
        script: <InputScript field={field} value={value} onChange={onChangeHandler} onEnter={onEnter}/>,
        text: <Input field={field} value={value} onChange={onChangeHandler} onEnter={onEnter}/>,
        coords: <InputCoords field={field} value={value} onChange={onChangeHandler} onEnter={onEnter}/>,
    }

    return inputs[field.type]
}


export default function ModalDialog({item: defItem, index, onEnter, open, onClose}) {
    if (!defItem) return;
    const [dataItems, setDataItems] = useState([]);
    const [item, setItem] = useState({...defItem});

    useEffect(() => {
        open && window.main.getDataItems(index).then(dataItems => setDataItems(dataItems || []))
    }, [open])

    const onEnterHandle = () => {
        onEnter(item, index);
        onClose()
    }

    const onChangeHandle = (id, value) => {
        item[id] = value;
        setItem(item);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent>
                {[...fields, ...dataItems].map((field, i) => (
                    <InputToggle
                        key={i}
                        field={field}
                        item={defItem}
                        onChange={onChangeHandle}
                        onEnter={onEnterHandle}
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
