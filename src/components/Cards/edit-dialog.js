import React from "react";
import {Button, Dialog, DialogActions, DialogContent, IconButton, Menu, MenuItem, TextField} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EditDialog({deleteItem, editItem, data}) {
    const [open, setOpen] = React.useState(false);
    const [url, setURL] = React.useState(data.url);
    const [login, setLogin] = React.useState(data.login);
    const [password, setPassword] = React.useState(data.password);
    const {index} = data;

    function BasicMenu({editItem, deleteItem, index}) {
        const [anchorEl, setAnchorEl] = React.useState(null);
        const open = Boolean(anchorEl);
        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <div>
                <IconButton aria-label="delete" size="small" onClick={handleClick}><MoreVertIcon
                    fontSize="inherit"/></IconButton>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={() => {
                        editItem(index);
                        handleClose()
                    }}><IconButton><EditIcon sx={{fontSize: "small"}}/></IconButton>Edit</MenuItem>
                    <MenuItem onClick={() => {
                        deleteItem(index);
                        handleClose()
                    }}><IconButton><DeleteIcon sx={{fontSize: "small"}}/></IconButton>Delete</MenuItem>
                </Menu>
            </div>
        );
    }

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const onEnter = (e) => {
        if (e.key === "Enter") {
            editItem(index, url, login, password);
            handleClose()
        }
    }

    return (
        <div>
            <BasicMenu index={index} editItem={handleClickOpen} deleteItem={deleteItem}/>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <TextField onKeyPress={onEnter} value={url} onChange={e => setURL(e.target.value)} autoFocus
                               margin="dense" id="url" label="URL"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter} value={login} onChange={e => setLogin(e.target.value)}
                               margin="dense" id="login" label="login"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter} value={password} onChange={e => setPassword(e.target.value)}
                               margin="dense" id="password" label="password"
                               fullWidth variant="standard"/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => {
                        editItem(index, url, login, password);
                        handleClose()
                    }}>Ok</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
