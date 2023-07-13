import React, {useEffect} from "react";
import "./App.css";
import Cards from "./components/Cards/cards";
import AddDialog from "./components/AddDialog/add-dialog";
import BigBrowser from "./components/BigBrowser/big-browser";
import {useDispatch, useSelector} from "react-redux";
import {actions} from "./redux/rtk";


export default function App() {
    const cardsOpen = useSelector(state => state.settings.cardsOpen);
    const dispatch = useDispatch();

    useEffect(() => {
        window.main.onSettings(s => {
            dispatch(actions.settings.set(s));
        });
        window.main.onData(({items, settings}) => {
            items.map(item => item.sort = (+item.sort || ""));

            items = items.sort((a, b) => {
                if (a.sort === "" && b.sort === "") return 0;
                if (a.sort === "" && b.sort !== "") return 1;
                if (a.sort !== "" && b.sort === "") return -1;
                if (a.sort > b.sort) return 1;
                if (b.sort > a.sort) return -1;
                return 0
            });
            console.log({items});
            items.map(item => item.selected = false);
            items[settings.webViewIndex] && (items[settings.webViewIndex].selected = true);
            dispatch(actions.settings.set(settings));
            dispatch(actions.items.set(items));
        });
    }, [])

    return (
        <>
            <div className={cardsOpen ? "visible" : "hidden"}>
                <Cards/>
                <AddDialog/>
            </div>
            <BigBrowser/>
        </>
    );
}
