import "../../App.css";
import React, {useEffect, useRef, useState} from "react";
import {mainState} from "../../vars";
import {useDispatch, useSelector} from "react-redux";
import {actions} from "../../redux/rtk";


export default function Webview({item, group}) {
    const WVRef = useRef();
    const dispatch = useDispatch();
    const [src, setSRC] = useState("");
    const {selectedItemId, position: {left, top, width, height}} = useSelector(state => state);
    const {settings} = useSelector(state => state);

    const setZoomFactor = (w, factor, style) => {
        window.dispatchEvent(new UIEvent("resize"));
        w.setAttribute("style", style);
        w.setAttribute("zoom", factor);
        w.getAttribute("ready") && w.setZoomFactor(factor);
    }

    useEffect(() => {
        mainState.webViews[item.id] = WVRef.current;
        const webview = mainState.webViews[item.id];
        webview.addEventListener("dom-ready", () => {
            webview.setZoomFactor(+webview.getAttribute("zoom"));
            webview.setAttribute("ready", "true");
        });
        webview.addEventListener("did-navigate", (event) => {
            dispatch(actions.webviews.set([item.id, {
                address: event.url,
                canGoBack: webview.canGoBack(),
                canGoForward: webview.canGoForward(),
            }]));
        });
        settings.selectedItemId && dispatch(actions.selectedItemId.set(settings.selectedItemId));
        setSRC(item.autostart || item.id === settings.selectedItemId ? item.url : "about:blank")
    }, []);


    useEffect(() => {
        const webview = mainState.webViews[item.id];

        dispatch(actions.addressBarShow.set(!!selectedItemId));

        if (item.id === selectedItemId) {
            setZoomFactor(webview, 1, `position:absolute;left:${left};top:${top};width:${width};height:${height}`);
            setSRC(item.url);
        } else {
            setZoomFactor(webview, 0.1, "");
        }
    }, [selectedItemId, left, top, width, height])

    return (
        <>
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
            <div className="fake" onClick={() => dispatch(actions.selectedItemId.set(item.id))}/>
        </>
    );
}
