import "../../App.css";
import React, {useEffect, useState} from "react";


export default function Webview({WVRef, item, onclick}) {
    const [src, setSRC] = useState(item.autostart ? item.url : "about:blank");
    useEffect(() => {
        const webview = WVRef.current;
        webview.addEventListener("dom-ready", () => webview.setZoomFactor(+webview.getAttribute("zoom")));
    }, []);

    const onClickHandler = () => {
        const webview = WVRef.current;

        if (src !== "about:blank") return onclick(webview);

        const onReady = () => {
            webview.removeEventListener("dom-ready", onReady);
            onclick(webview)
        }
        setSRC(item.url);
        webview.addEventListener("dom-ready", onReady);
    }

    const WP = (o) => Object.entries(o).map(([k, v])=>`${k}=${v}`).join(", ");


    return (
        <>
            <div className="webview-container">
                <webview
                    webpreferences={WP({
                        nodeIntegration: true,
                        contextIsolation: false,
                        allowRunningInsecureContent: true,
                        webSecurity: false
                    })}
                    allowpopups="true"
                    className="webview"
                    partition={item.zone && `persist:${window.btoa(item.zone)}`}
                    src={src}
                    zoom="0.1"
                    ref={WVRef}
                />
            </div>
            <div className="fake" onClick={onClickHandler}/>
        </>
    );
}
