import "../../App.css";
import React, {createRef, useEffect, useState} from "react";
import {mainState} from "../../vars";
import {useDispatch} from "react-redux";
import {actions} from "../../redux/rtk";


export default function Webview({item, group}) {
    const WVRef = createRef();
    const dispatch = useDispatch();
    const [src, setSRC] = useState(item.autostart || item.selected  ? item.url : "about:blank");

    useEffect(() => {
        const webview = WVRef.current;

        if (mainState.webViews[item.id]) return;

        mainState.webViews[item.id] = webview;
        webview.addEventListener("dom-ready", () => {
            webview.setAttribute("ready", "true");
            webview.setZoomFactor(+webview.getAttribute("zoom"));
        });
        item.selected && onClickHandler();

    }, []);

    const onClickHandler = () => {
        dispatch(actions.selectedItemId.set(item.id));
        setSRC(item.url);
    }


    return (
        <>
            <div className="webview-container">
                <webview
                    src={src}
                    useragent={group.useragent}
                    partition={item.groupid && `persist:${window.btoa(item.groupid)}`}
                    ref={WVRef}
                    webpreferences="contextIsolation=false"
                    allowpopups="true"
                    className="webview"
                    zoom="0.1"
                />
            </div>
            <div className="fake" onClick={onClickHandler}/>
        </>
    );
}
