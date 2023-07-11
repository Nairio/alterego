import {useDispatch, useSelector} from "react-redux";
import React from "react";
import {actions} from "./rtk";

export const Counter = () => {
    const {counter1, counter2} = useSelector(state => state);
    const dispatch = useDispatch();

    return (
        <>
            <div>
                <h2>Count: {counter1}</h2>
                <button onClick={() => dispatch(actions.counter1.increment())}>Increment</button>
                <button onClick={() => dispatch(actions.counter1.decrement())}>Decrement</button>
            </div>
            <div>
                <h2>Count: {counter2}</h2>
                <button onClick={() => dispatch(actions.counter2.increment())}>Increment</button>
                <button onClick={() => dispatch(actions.counter2.decrement())}>Decrement</button>
            </div>
        </>
    );
};
