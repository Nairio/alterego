import './App.css';
import React, {useEffect} from "react";

export default function Webview({data: {url, login}, onclick}) {
    const WVRef = React.createRef();
    const CRef = React.createRef();
    const partition = window.btoa(JSON.stringify({url, login}))

    useEffect(() => {
        const webview = WVRef.current;
        webview.addEventListener("dom-ready", () => webview.setZoomFactor(+webview.getAttribute("zoom")));
    }, []);

    return (
        <>
            <div className="webview-container" ref={CRef}>
                <webview
                    ref={WVRef}
                    src={url}
                    nodeintegration="true"
                    partition={`persist:${partition}`}
                    zoom="0.1"
                />
            </div>
            <div className="fake"
                 onClick={() => WVRef.current.parentNode === CRef.current && onclick(CRef.current, WVRef.current)}
            />
        </>

    );
}
