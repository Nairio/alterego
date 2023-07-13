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






