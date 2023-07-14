import React, {useEffect} from "react";
import "./App.css";
import Cards from "./components/Cards/cards";
import BigBrowser from "./components/BigBrowser/big-browser";
import {useDispatch, useSelector} from "react-redux";
import {actions} from "./redux/rtk";
import {ModalDialogGroup, ModalDialogItems} from "./components/modal-dialog";
import {Fab} from "@mui/material";


export default function App() {
    const cardsOpen = useSelector(state => state.settings.cardsOpen);
    const dispatch = useDispatch();

    useEffect(() => {
        window.main.onData(({items, settings, groups}) => {
            items.map(item => item.selected = item.id === settings.selectedItemId);
            dispatch(actions.settings.set(settings));
            dispatch(actions.items.set(items));
            dispatch(actions.groups.set(groups));
        });
    }, []);

    const openModalDialogGroup = () => {
        dispatch(actions.modalDialogGroups.open({}))
    }

    return (
        <>
            <div className={cardsOpen ? "visible" : "hidden"}>
                <Cards/>
                <div className={"add-dialog"}>
                    <Fab color="primary" size="small" onClick={openModalDialogGroup}>+</Fab>
                </div>
            </div>
            <BigBrowser/>
            <ModalDialogItems/>
            <ModalDialogGroup/>
        </>
    );
}
