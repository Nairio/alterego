import React, {useEffect} from "react";
import "./App.css";
import {useDispatch} from "react-redux";
import {actions} from "./redux/rtk";
import {ModalDialogGroup, ModalDialogItems} from "./components/Dialog/modal-dialog";
import {Items} from "./components/Cards/items";
import {AddressBar} from "./components/Webview/address-bar";


export default function App() {
    const dispatch = useDispatch();

    const setPosition = () => {
        const topleft = document.querySelector(".top-left");
        const widthheight = document.querySelector(".width-height");
        const computedStyle1 = window.getComputedStyle(topleft);
        const computedStyle2 = window.getComputedStyle(widthheight);
        const top = computedStyle1.getPropertyValue("top");
        const left = computedStyle1.getPropertyValue("left");
        const width = computedStyle2.getPropertyValue("width");
        const height = computedStyle2.getPropertyValue("height");
        dispatch(actions.position.set({top, left, width, height}));
    }

    useEffect(() => {
        window.main.onData(({items, settings, groups}) => {
            dispatch(actions.settings.set(settings));
            dispatch(actions.items.set(items));
            dispatch(actions.groups.set(groups));
            setPosition();
        });
        setPosition();
        window.addEventListener("resize", setPosition);
        return () => {window.removeEventListener("resize", setPosition)};
    }, []);


    return (
        <>
            <Items/>
            <AddressBar/>
            <ModalDialogItems/>
            <ModalDialogGroup/>
        </>
    );
}
