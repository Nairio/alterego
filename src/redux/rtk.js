import React from "react";
import {configureStore, createSlice} from "@reduxjs/toolkit";

const slices = [
    {
        name: "position",
        initialState: {top: 0, left: 0, width: 0, height: 0},
        reducers: {
            set: (state, action) => action.payload
        }
    },
    {
        name: "addressBarShow",
        initialState: false,
        reducers: {
            set: (state, action) => action.payload
        }
    },
    {
        name: "webviews",
        initialState: {},
        reducers: {
            set: (state, {payload: [id, data]}) => {
                state[id] = data;
                return state
            },
            setAddress: (state, {payload: [id, address]}) => {
                state[id].address = address;

                return state
            },
        }
    },
    {
        name: "selectedItemId",
        initialState: "",
        reducers: {
            set: (state, action) => {
                window.main.setSelectedItemId(action.payload);
                return action.payload
            },
        }
    },
    {
        name: "selectedGroupId",
        initialState: "",
        reducers: {
            set: (state, action) => {
                window.main.setSelectedGroupId(action.payload);
                return action.payload
            },
        }
    },
    {
        name: "groups",
        initialState: [],
        reducers: {
            set: (state, action) => action.payload,
        },
    },
    {
        name: "items",
        initialState: [],
        reducers: {
            set: (state, action) => action.payload,
        },
    },
    {
        name: "settings",
        initialState: {},
        reducers: {
            set: (state, action) => action.payload,
        },
    },
    {
        name: "modalDialogItems",
        initialState: false,
        reducers: {
            open: (state, action) => action.payload,
            close: () => false,
        },
    },
    {
        name: "modalDialogGroups",
        initialState: false,
        reducers: {
            open: (state, action) => action.payload,
            close: () => false,
        },
    }


].map(createSlice);

export const actions = slices.reduce((a, c) => ({...a, [c.name]: c.actions}), {});
export const ReduxStore = configureStore({reducer: slices.reduce((a, c) => ({...a, [c.name]: c.reducer}), {})});






