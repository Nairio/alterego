import "../../App.css";
import React, {useEffect, useRef, useState} from "react";
import {mainState} from "../../vars";
import {useDispatch, useSelector} from "react-redux";
import {actions} from "../../redux/rtk";


export default function Webview({item, group}) {
    const WVRef = useRef();
    const dispatch = useDispatch();
    const [src, setSRC] = useState(item.autostart || item.selected  ? item.url : "about:blank");
    const selectedItemId = useSelector(state => state.selectedItemId);


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

    useEffect(() => {
        if(item.id===selectedItemId){
            setSRC(item.url);
        }
    }, [selectedItemId]);

    const onClickHandler = () => {
        dispatch(actions.selectedItemId.set(item.id));
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
