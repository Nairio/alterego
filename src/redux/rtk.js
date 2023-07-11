import React from 'react';
import {configureStore, createSlice} from '@reduxjs/toolkit';

const slices = [
    {
        name: "webViewIndex",
        initialState: -1,
        reducers: {
            set: (state, action) => {
                window.main.setWebViewIndex(action.payload);
                return action.payload
            },
        }
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
    }
].map(createSlice);

export const actions = slices.reduce((a, c) => ({...a, [c.name]: c.actions}), {});
export const ReduxStore = configureStore({reducer: slices.reduce((a, c) => ({...a, [c.name]: c.reducer}), {})});






