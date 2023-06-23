import Card from "./card";
import Webview from "./webview";
import React, {createRef, useEffect, useState} from "react";


export default function Cards({onClick, data: {onData, deleteItem, editItem}}) {
    const [data, setData] = useState([]);

    useEffect(() => onData(setData), []);

    return (
        <div className="cards">
            {data.map((item, index) => {
                const WVRef = createRef();
                return (
                        <Card WVRef={WVRef} key={index} index={index} item={item} editItem={editItem} deleteItem={deleteItem}>
                            <Webview WVRef={WVRef} item={item} onclick={onClick}/>
                        </Card>
                    )
                }
            )}
        </div>
    )
}