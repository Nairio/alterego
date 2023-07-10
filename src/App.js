import "./App.css";
import Cards from "./components/Cards/cards";
import AddDialog from "./components/AddDialog/add-dialog";
import BigBrowser from "./components/BigBrowser/big-browser";
import React, {useState} from "react";

const {onData, addItem, deleteItem, editItem} = window.main;

export default function App() {
    const [webview, setWebview] = useState(null);
    return (
        <>
            <Cards onClick={setWebview} data={{onData, deleteItem, editItem}}/>
            <AddDialog addItem={addItem}/>
            <BigBrowser webview={webview}/>
        </>
    );
}
