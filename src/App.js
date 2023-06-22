import './App.css';
import Cards from "./components/Cards/cards";
import AddDialog from "./components/AddDialog/add-dialog";
import BigBrowser from "./components/BigBrowser/big-browser";
import {useState} from "react";

const {onData, addItem, deleteItem, editItem} = window.main;

export default function App() {
    const [card, setCard] = useState({});

    return (
        <>
            <Cards onClick={setCard} data={{onData, deleteItem, editItem}}/>
            <AddDialog addItem={addItem}/>
            <BigBrowser card={card}/>
        </>
    );
}
