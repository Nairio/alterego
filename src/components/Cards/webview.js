import "../../App.css";
import React, {useEffect} from "react";
const path = require('path');


export default function Webview({WVRef, item, onclick}) {
    const partition = window.btoa(JSON.stringify(item))

    useEffect(() => {
        const webview = WVRef.current;

        webview.addEventListener("dom-ready", () => webview.setZoomFactor(+webview.getAttribute("zoom")));
        webview.addEventListener("dom-ready", () => {
            webview.executeJavaScript(`
                console.log("Hello from renderer process");
                window.sendToMainProcess('my-channel', "Renderer Process JS > Main Process");
                window.sendToPreload("Renderer Process JS > Preload");
            `);
        });


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
                    preload={`file:${process.env.NODE_ENV === "development" ? path.resolve("./public/preload.js") : "preload.js"}`}
                />
            </div>
            <div className="fake" onClick={() => onclick(WVRef.current)}/>
        </>
    );
}
