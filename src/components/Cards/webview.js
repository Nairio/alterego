import "../../App.css";
import React, {useEffect} from "react";


export default function Webview({WVRef, item, onclick}) {
    const partition = window.btoa(JSON.stringify(item))

    useEffect(() => {
        const webview = WVRef.current;
        webview.addEventListener("dom-ready", () => webview.setZoomFactor(+webview.getAttribute("zoom")));
    }, []);


    return (
        <>
            <div className="webview-container">
                <webview
                    allowpopups="true"
                    className="webview"
                    ref={WVRef}
                    src={item.url}
                    nodeintegration="true"
                    disablewebsecurity="true"
                    nodeintegrationinsubframes="true"
                    partition={`persist:${partition}`}
                    zoom="0.1"
                    useragent={item.useragent}
                />
            </div>
            <div className="fake" onClick={() => onclick(WVRef.current)}/>
        </>
    );
}
