import React from 'react';
import {configureStore, createSlice} from '@reduxjs/toolkit';

const slices = [
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






