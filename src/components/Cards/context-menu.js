import React, {useState} from "react";
import {IconButton, Menu, MenuItem} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {PlusOne} from "@mui/icons-material";
import ClearIcon from '@mui/icons-material/Clear';

export function ContextMenuGroup({addItem, editGroup, deleteGroup, clearCache, group}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const addItemhandle = () => {addItem({groupid: group.id}); handleClose()}

    return (
        <>
            <IconButton aria-label="delete" size="small" onClick={handleClick}><MoreVertIcon fontSize="inherit"/></IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={addItemhandle}><IconButton><PlusOne sx={{fontSize: "small"}}/></IconButton>Add Item</MenuItem>
                <MenuItem onClick={() => {editGroup(group);handleClose()}}><IconButton><EditIcon sx={{fontSize: "small"}}/></IconButton>Edit</MenuItem>
                <MenuItem onClick={() => {deleteGroup(group);handleClose()}}><IconButton><DeleteIcon sx={{fontSize: "small"}}/></IconButton>Delete</MenuItem>
                <MenuItem onClick={() => {clearCache(group);handleClose()}}><IconButton><ClearIcon sx={{fontSize: "small"}}/></IconButton>Clear Cache</MenuItem>
            </Menu>
        </>
    );
}
export function ContextMenuItem({editItem, deleteItem, item}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <IconButton aria-label="delete" size="small" onClick={handleClick}><MoreVertIcon fontSize="inherit"/></IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={() => {editItem(item);handleClose()}}><IconButton><EditIcon sx={{fontSize: "small"}}/></IconButton>Edit</MenuItem>
                <MenuItem onClick={() => {deleteItem(item);handleClose()}}><IconButton><DeleteIcon sx={{fontSize: "small"}}/></IconButton>Delete</MenuItem>
            </Menu>
        </>
    );
}
