import Card from "./card";
import Webview from "./webview";
import React, {createRef, useEffect, useState} from "react";


export default function Cards({onClick, data: {onData, deleteItem, editItem}}) {
    const [data, setData] = useState([]);

    useEffect(() => onData(setData), []);

    return (
        <div className="cards">
            {data.map((item, i) => {
                const WVRef = createRef();
                return (
                    <Card WVRef={WVRef} key={i} index={i} item={item} editItem={editItem} deleteItem={deleteItem}>
                        <Webview WVRef={WVRef} item={item} onclick={onClick} first={i===0}/>
                    </Card>
                )
            })}
        </div>
    )
}