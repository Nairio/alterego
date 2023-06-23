import React, {useState} from "react";
import {IconButton, Menu, MenuItem} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {Devices} from "@mui/icons-material";


export default function ContextMenu({WVRef, editItem, deleteItem, index}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const openDevTools = ()=>{
        WVRef.current.openDevTools();
        handleClose()
    }

    return (
        <>
            <IconButton aria-label="delete" size="small" onClick={handleClick}><MoreVertIcon fontSize="inherit"/></IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={openDevTools}><IconButton><Devices sx={{fontSize: "small"}}/></IconButton>Dev Tools</MenuItem>
                <MenuItem onClick={() => {editItem(index);handleClose()}}><IconButton><EditIcon sx={{fontSize: "small"}}/></IconButton>Edit</MenuItem>
                <MenuItem onClick={() => {deleteItem(index);handleClose()}}><IconButton><DeleteIcon sx={{fontSize: "small"}}/></IconButton>Delete</MenuItem>
            </Menu>
        </>
    );
}
