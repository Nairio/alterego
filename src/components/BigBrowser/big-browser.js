import AddressBar from "./address-bar";
import React, {createRef, useEffect, useState} from "react";
import {mainState} from "../../vars";
import {useSelector} from "react-redux";

const topleft = createRef();
const widthheight = createRef();


export default function BigBrowser() {
    const {selectedItemId} = useSelector(state => state);
    const webview = mainState.webViews[selectedItemId];

    const [showAddressBar, setShowAddressBar] = useState(false);
    const [address, setAddress] = useState("");
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);

    const clearWebview = () => {
        if (mainState.webview) {
            mainState.webview.setAttribute("zoom", "0.1");
            mainState.webview.setZoomFactor(0.1);
            mainState.webview.removeAttribute("style");
            mainState.webview.removeEventListener("did-navigate", mainState.didNavigate);
            setShowAddressBar(false);
        }
    }
    const getPosition = (topleft, widthheight) => {
        const computedStyle1 = window.getComputedStyle(topleft.current);
        const computedStyle2 = window.getComputedStyle(widthheight.current);
        const top = computedStyle1.getPropertyValue("top");
        const left = computedStyle1.getPropertyValue("left");
        const width = computedStyle2.getPropertyValue("width");
        const height = computedStyle2.getPropertyValue("height");
        return {top, left, width, height}
    }
    const replaceWebview = (webview, didNavigate) => {
        const {top, left, width, height} = getPosition(topleft, widthheight);
        mainState.webview = webview;
        mainState.didNavigate = didNavigate;
        mainState.webview.addEventListener("did-navigate", didNavigate);
        mainState.webview.setAttribute("style", `position:absolute;left:${left};top:${top};width:${width};height:${height}`);
        mainState.webview.setAttribute("zoom", "1");
        mainState.webview.getAttribute("ready") && mainState.webview.setZoomFactor(1);
    }

    useEffect(() => {
        if (!selectedItemId) clearWebview();
    }, [selectedItemId]);

    const toBigWebviewContainer = () => {
        if (!webview) return;
        clearWebview();
        setShowAddressBar(true);
        replaceWebview(webview, (event) => {
            setAddress(event.url);
            setCanGoBack(webview.canGoBack());
            setCanGoForward(webview.canGoForward())
        });
        setAddress(webview.src);
    }

    useEffect(() => {
        window.addEventListener("resize", toBigWebviewContainer);
        toBigWebviewContainer();
        return () => {window.removeEventListener("resize", toBigWebviewContainer)};
    }, [webview]);

    return (
        <div className="big-browser">
            <AddressBar
                open={showAddressBar}
                canGoForward={canGoForward}
                canGoBack={canGoBack}
                address={address}
                onChange={(address) => setAddress(address)}
                goBack={() => webview.goBack()}
                goForward={() => webview.goForward()}
                onEnter={async () => webview.src = await window.main.onNavigate(address)}
            />
            <div className="big-webview-container" ref={widthheight}>
                <div className={"topleft"} ref={topleft}/>
            </div>
        </div>
    )
}