import "./App.css";
import Cards from "./components/Cards/cards";
import AddDialog from "./components/AddDialog/add-dialog";
import BigBrowser from "./components/BigBrowser/big-browser";
import React, {useEffect, useState} from "react";

const {onData, addItem, deleteItem, editItem} = window.main;


export default function App() {
    const [webview, setWebview] = useState(null);
    const [cardOpen, setCardOpen] = useState(false);

    setInterval(() => {
        console.log({cardOpen})
    }, 5000)

    useEffect(() => {
        window.main.getCardOpen().then(s => setCardOpen(s))
    }, [])

    useEffect(() => {
        window.main.onCardToggle(setCardOpen)
    })

    return (
        <>
            <div className={cardOpen ? "visible" : "hidden"}>
                <Cards onClick={setWebview} data={{onData, deleteItem, editItem}}/>
                <AddDialog addItem={addItem}/>
            </div>
            <BigBrowser webview={webview}/>
        </>
    );
}
