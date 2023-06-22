import React from "react";
import {Button, Dialog, DialogActions, DialogContent, Fab, TextField} from "@mui/material";

export default function AddDialog({addItem}) {
    const [open, setOpen] = React.useState(false);
    const [url, setURL] = React.useState("");
    const [login, setLogin] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onEnter = (e) => {
        if (e.key === "Enter") {
            addItem(url, login, password);
            handleClose()
        }
    }

    return (
        <div className={"add"}>
            <Fab style={{margin: 8}} color="primary" size="small" onClick={handleClickOpen}>+</Fab>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <TextField onKeyPress={onEnter} onChange={e => setURL(e.target.value)} autoFocus margin="dense"
                               id="url" label="URL"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter} onChange={e => setLogin(e.target.value)} margin="dense" id="login"
                               label="login"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter} onChange={e => setPassword(e.target.value)} margin="dense"
                               id="password" label="password"
                               fullWidth variant="standard"/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => {
                        addItem(url, login, password);
                        handleClose()
                    }}>Ok</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
