import './App.css';
import React, {useEffect, useState} from "react";
import {MenuItem, Menu, TextField, Dialog, DialogActions, DialogContent, Button, ButtonGroup, Container, Divider, Fab, IconButton, Stack} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';

function AddDialog({onAdd}) {
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
        if(e.key==="Enter") {
            onAdd(url, login, password);
            handleClose()
        }
    }

    return (
        <div>
            <Fab style={{margin: 8}} color="primary" size="small" onClick={handleClickOpen}>+</Fab>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <TextField onKeyPress={onEnter}  onChange={e => setURL(e.target.value)} autoFocus margin="dense" id="url" label="URL"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter}  onChange={e => setLogin(e.target.value)} margin="dense" id="login" label="login"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter}  onChange={e => setPassword(e.target.value)} margin="dense" id="password" label="password"
                               fullWidth variant="standard"/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => {
                        onAdd(url, login, password);
                        handleClose()
                    }}>Ok</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
function EditDialog({index, deleteItem, editItem, data}) {
    const [open, setOpen] = React.useState(false);
    const [url, setURL] = React.useState(data.url);
    const [login, setLogin] = React.useState(data.login);
    const [password, setPassword] = React.useState(data.password);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onEnter = (e) => {
        if(e.key==="Enter") {
            editItem(index, url, login, password);
            handleClose()
        }
    }

    return (
        <div>
            <BasicMenu index={index} editItem={handleClickOpen} deleteItem={deleteItem}/>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <TextField onKeyPress={onEnter} value={url} onChange={e => setURL(e.target.value)} autoFocus margin="dense" id="url" label="URL"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter} value={login} onChange={e => setLogin(e.target.value)} margin="dense" id="login" label="login"
                               fullWidth variant="standard"/>
                    <TextField onKeyPress={onEnter} value={password} onChange={e => setPassword(e.target.value)} margin="dense" id="password" label="password"
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
            <IconButton aria-label="delete" size="small" onClick={handleClick}>
                <MoreVertIcon fontSize="inherit"/>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={()=>{
                    editItem(index);
                    handleClose();
                }}><IconButton size="small"><EditIcon size="small"/></IconButton>Edit</MenuItem>
                <MenuItem onClick={()=>{
                    deleteItem(index);
                    handleClose();
                }}><IconButton size="small"><DeleteIcon size="small"/></IconButton>Delete</MenuItem>
            </Menu>
        </div>
    );
}

const {onData, openWindow, addItem, deleteItem, editItem} = window.main;

function App() {
    const [data, setData] = useState([]);

    useEffect(() => onData(setData), []);

    return (
        <Container>
            <AddDialog onAdd={addItem}/>
            <Divider/>
            <div className="group">
                <ButtonGroup orientation="vertical" variant="text">
                    {data.map(({url, login, password}, i) => (
                        <Stack key={i} direction="row" alignItems="center" spacing={1}>
                            <Button fullWidth={true} onClick={() => openWindow(i)}>{login}</Button>
                            <EditDialog index={i} data={{url, login, password}} deleteItem={deleteItem} editItem={editItem}/>
                        </Stack>
                    ))}
                </ButtonGroup>
            </div>
        </Container>
    );
}

export default App;
