import "../../App.css";
import React, {useEffect} from "react";

export default function Webview({item, onclick}) {
    const WVRef = React.createRef();
    const CRef = React.createRef();
    const partition = window.btoa(JSON.stringify(item))

    useEffect(() => {
        const webview = WVRef.current;
        webview.addEventListener("dom-ready", () => webview.setZoomFactor(+webview.getAttribute("zoom")));
    }, []);

    const onClick = () => {
        const container = CRef.current;
        const webview = WVRef.current;
        if (webview.parentNode === container) {
            onclick({container, webview})
        }
    }

    return (
        <>
            <div className="webview-container" ref={CRef}>
                <webview
                    className="webview"
                    ref={WVRef}
                    src={item.url}
                    nodeintegration="true"
                    partition={`persist:${partition}`}
                    zoom="0.1"
                    useragent={item.useragent}
                    //useragent="Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko"
                />
            </div>
            <div className="fake" onClick={onClick}/>
        </>
    );
}
