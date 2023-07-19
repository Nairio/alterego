import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {useDispatch, useSelector} from "react-redux";
import {actions} from "../../redux/rtk";
import {CircularProgress} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import {mainState} from "../../vars";

export function AddressBar() {
    const dispatch = useDispatch();
    const selectedItemId = useSelector(state => state.selectedItemId);
    const addressBarShow = useSelector(state => state.addressBarShow);
    const webviews = useSelector(state => state.webviews);
    const webview = mainState.webViews[selectedItemId];

    const {loading, canGoForward, canGoBack, address} = webviews[selectedItemId] || {canGoForward: false, canGoBack: false, address: ""};

    return (
        <div className="big-browser">
            <AddressInput
                refresh={()=>webview.reload()}
                loading={loading}
                open={addressBarShow}
                canGoForward={canGoForward}
                canGoBack={canGoBack}
                address={address}
                onChange={(address) => dispatch(actions.webviews.setAddress([selectedItemId, address]))}
                goBack={() => webview.goBack()}
                goForward={() => webview.goForward()}
                onEnter={async () => webview.src = await window.main.onNavigate(address)}
            />
            <div className="width-height"><div className={"top-left"}/></div>
        </div>
    )
}
export function AddressInput({loading, open, canGoForward, canGoBack,refresh, address, onEnter, onChange, goBack, goForward}) {
    const onAddressChange = (e) => {
        if (e.code === "Enter") {
            onEnter()
        }
    }
    return (
        <div className="address-bar" style={{visibility: open?"visible":"hidden"}}>
            <Paper sx={{p: "2px 4px", display: "flex", alignItems: "center"}}>
                <IconButton disabled={!canGoBack} onClick={goBack} type="button" sx={{p: "4px"}}><ArrowBackIosNewIcon/></IconButton>
                <IconButton disabled={!canGoForward} onClick={goForward} type="button" sx={{p: "4px"}}><ArrowForwardIosIcon/></IconButton>
                {loading ? <CircularProgress size={24}/> : <IconButton sx={{p: "0px"}} onClick={refresh}><RefreshIcon/></IconButton>}
                <InputBase value={address} onKeyPress={onAddressChange} onChange={e => onChange(e.target.value)} fullWidth sx={{ml: 1, flex: 1}} placeholder="https://example.com"/>
                <IconButton onClick={onEnter} type="button" sx={{p: "10px"}}><SearchIcon/></IconButton>
            </Paper>
        </div>
    );
}