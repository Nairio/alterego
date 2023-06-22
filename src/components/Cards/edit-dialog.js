import React from "react";
import {Button, Dialog, DialogActions, DialogContent, IconButton, Menu, MenuItem, TextField} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ModalDialog from "../modal-dialog";

export default function EditDialog({deleteItem, editItem, item, index}) {
    const [open, setOpen] = React.useState(false);

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


    return (
        <div>
            <BasicMenu index={index} editItem={handleClickOpen} deleteItem={deleteItem}/>
            <ModalDialog item={item} onEnter={(item) => editItem({item, index})} open={open} onClose={() => setOpen(false)}/>
        </div>
    );
}
