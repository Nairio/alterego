import './App.css';
import React, {useEffect, useState} from "react";
import {TextField, Dialog, DialogActions, DialogContent, Button, Fab} from "@mui/material";

import Webview from "./webview";
import Card from "./card";
import AddressBar from "./AddressBar";

const {onData, openWindow, addItem, deleteItem, editItem} = window.main;

function AddDialog({addItem}) {
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

const global = {};

export default function App() {
    const [address, setAddress] = useState("");
    const [data, setData] = useState([]);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const bigWebview = React.createRef();

    useEffect(() => onData(setData), []);

    const toBigContainer = (container, webview) => {
        const bigContainer = bigWebview.current;
        if (global.container && global.webview) {
            global.webview.setAttribute("zoom", "0.1");
            global.webview.setZoomFactor(0.1);
            global.container.append(global.webview);
            global.webview.removeEventListener("did-navigate", global.didNavigate);
        }

        global.didNavigate = (event) => {
            setAddress(event.url);
            setCanGoBack(webview.canGoBack());
            setCanGoForward(webview.canGoForward())
        };
        webview.addEventListener("did-navigate", global.didNavigate);

        webview.setAttribute("zoom", "1");
        webview.setZoomFactor(1);

        global.container = container;
        global.webview = webview;

        bigContainer.append(webview);
        setAddress(webview.src);
    }

    return (
        <>
            <div className="body">
                <div className="cards">
                    {data.map(({url, login, password}, index) => (
                        <Card key={index} data={{index, url, login, password, editItem, deleteItem}}>
                            <Webview data={{url, login}} onclick={toBigContainer}/>
                        </Card>
                    ))}
                </div>
                <div className="big-webview-container">
                    <AddressBar
                        canGoForward={canGoForward}
                        canGoBack={canGoBack}
                        address={address}
                        onChange={setAddress}
                        goBack={() => global.webview.goBack()}
                        goForward={() => global.webview.goForward()}
                        onEnter={() => global.webview.src = address}
                    />
                    <div className="big-webview" ref={bigWebview}/>
                </div>
            </div>
            <AddDialog addItem={addItem}/>
        </>
    );
}
