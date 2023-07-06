import "../../App.css";
import React, {useEffect} from "react";


export default function Webview({WVRef, item, onclick}) {
    const partition = window.btoa(JSON.stringify({url: item.url, login: item.login}))

    useEffect(() => {
        const webview = WVRef.current;
        webview.addEventListener("dom-ready", () => webview.setZoomFactor(+webview.getAttribute("zoom")));
    }, []);

    return (
        <>
            <div className="webview-container">
                <webview
                    nodeintegration="true"
                    disablewebsecurity="true"
                    nodeintegrationinsubframes="true"
                    allowpopups="true"
                    className="webview"
                    partition={`persist:${partition}`}
                    src={item.url}
                    zoom="0.1"
                    ref={WVRef}
                />
            </div>
            <div className="fake" onClick={() => onclick(WVRef.current)}/>
        </>
    );
}
