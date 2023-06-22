import React from "react";
import {IconButton, Menu, MenuItem} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ContextMenu({editItem, deleteItem, index}) {
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
