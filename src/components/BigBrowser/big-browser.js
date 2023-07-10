import AddressBar from "./address-bar";
import React, {createRef, useEffect, useState} from "react";

const global = {};
const topleft = createRef();
const widthheight = createRef();

export default function BigBrowser({webview}) {
    const [open, setOpen] = useState(false);
    const [address, setAddress] = useState("");
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);

    const toBigWebviewContainer = () => {
        if (!webview) return;
        setOpen(true);

        const computedStyle1 = window.getComputedStyle(topleft.current);
        const computedStyle2 = window.getComputedStyle(widthheight.current);
        const top = computedStyle1.getPropertyValue("top");
        const left = computedStyle1.getPropertyValue("left");
        const width = computedStyle2.getPropertyValue("width");
        const height = computedStyle2.getPropertyValue("height");

        if (global.webview) {
            global.webview.setAttribute("zoom", "0.1");
            global.webview.setZoomFactor(0.1);
            global.webview.removeAttribute("style");
            global.webview.removeEventListener("did-navigate", global.didNavigate);
        }

        global.didNavigate = (event) => {
            setAddress(event.url);
            setCanGoBack(webview.canGoBack());
            setCanGoForward(webview.canGoForward())
        };
        webview.addEventListener("did-navigate", global.didNavigate);
        webview.setAttribute("style", `position:absolute;left:${left};top:${top};width:${width};height:${height}`);
        webview.setAttribute("zoom", "1");
        webview.setZoomFactor(1);
        setAddress(webview.src);
        global.webview = webview;
    }

    useEffect(() => {
        window.addEventListener("resize", toBigWebviewContainer);
        toBigWebviewContainer();
        return () => {
            window.removeEventListener("resize", toBigWebviewContainer);
        };
    }, [webview]);


    return (
        <div className="big-browser">
            <AddressBar
                open={open}
                canGoForward={canGoForward}
                canGoBack={canGoBack}
                address={address}
                onChange={(address) => setAddress(address)}
                goBack={() => global.webview.goBack()}
                goForward={() => global.webview.goForward()}
                onEnter={async () => global.webview.src = await window.main.onNavigate(address)}
            />
            <div className="big-webview-container" ref={widthheight}>
                <div className={"topleft"} ref={topleft}/>
            </div>
        </div>
    )
}