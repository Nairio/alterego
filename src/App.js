import React, {useEffect} from "react";
import "./App.css";
import BigBrowser from "./components/BigBrowser/big-browser";
import {useDispatch} from "react-redux";
import {actions} from "./redux/rtk";
import {ModalDialogGroup, ModalDialogItems} from "./components/modal-dialog";
import {Items} from "./components/Cards/items";


export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        window.main.onData(({items, settings, groups}) => {
            items.map(item => item.selected = item.id === settings.selectedItemId);
            dispatch(actions.settings.set(settings));
            dispatch(actions.items.set(items));
            dispatch(actions.groups.set(groups));
        });
    }, []);

    return (
        <>
            <Items/>
            <BigBrowser/>
            <ModalDialogItems/>
            <ModalDialogGroup/>
        </>
    );
}
