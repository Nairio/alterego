import AddressBar from "./address-bar";
import React, {useEffect, useState} from "react";

const global = {};

export default function BigBrowser({card: {container, webview}}) {
    const [address, setAddress] = useState("");
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const bigWebview = React.createRef();

    const addHTTP = (s) => s.toString().includes("http") ? s : `https://${s}`;
    const toBigContainer = (container, webview) => {
        if (!container || !webview) return;

        const bigContainer = bigWebview.current;
        if (global.container && global.webview) {
            global.webview.setAttribute("zoom", "0.1");
            global.webview.setZoomFactor(0.1);
            global.container.append(global.webview);
            global.webview.removeEventListener("did-navigate", global.didNavigate);
        }

        global.didNavigate = (event) => {
            setAddress(event.url);
            setCanGoBack(webview.canGoBack());
            setCanGoForward(webview.canGoForward())
        };
        webview.addEventListener("did-navigate", global.didNavigate);

        webview.setAttribute("zoom", "1");
        webview.setZoomFactor(1);

        global.container = container;
        global.webview = webview;

        bigContainer.append(webview);
        setAddress(addHTTP(webview.src));
    }

    useEffect(() => {
        toBigContainer(container, webview)
    }, [container, webview])


    return (
        <div className="big-browser">
            <AddressBar
                canGoForward={canGoForward}
                canGoBack={canGoBack}
                address={address}
                onChange={(s) => setAddress(addHTTP(s))}
                goBack={() => global.webview.goBack()}
                goForward={() => global.webview.goForward()}
                onEnter={() => global.webview.src = address}
            />
            <div className="big-webview" ref={bigWebview}/>
        </div>
    )
}