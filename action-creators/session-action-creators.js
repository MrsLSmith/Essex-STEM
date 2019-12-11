// @flow

import * as types from "../constants/action-types";
// import { Google, Facebook } from "expo";
import * as firebaseDataLayer from "../data-sources/firebase-data-layer";
// import { thirdPartyConfig } from "../config/third-party-config";
// import { Platform } from "react-native";

export const logout = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.logout(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;
};

export function createUser(email: string, password: string, displayName: string): ThunkType {
    function thunk(dispatch: Dispatch<ActionType>) {
        dispatch({ type: types.CREATING_USER });
        const _promise = firebaseDataLayer.createUser(email, password, displayName, dispatch);
        _promise.catch((error: Error) => {
            dispatch({ type: types.CREATE_USER_FAIL, error: error.message || "Could not create account." });
        });
    }

    thunk.interceptOnOffline = true;
    return thunk;
}

export function loginWithEmailPassword(email: string, password: string): ThunkType {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer
            .loginWithEmailPassword(email, password, dispatch)
            .catch((error: Error) => {
                dispatch({ type: types.LOGIN_FAIL, error });
            });
    }

    thunk.interceptOnOffline = true;
    return thunk;
}

 
export function resetPassword(emailAddress: string): ThunkType {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.resetPassword(emailAddress)
            .then(() => {
                dispatch({ type: types.RESET_PASSWORD_SUCCESS });
            })
            .catch((error: Error) => {
                dispatch(
                    {
                        type: types.RESET_PASSWORD_FAIL,
                        error
                    }
                );
            });
    }

    thunk.interceptOnOffline = true;
    return thunk;
}


export const initialize = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.initialize(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;
};

export const fetchEventInfo = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.fetchEventInfo(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;

};

export const fetchTeams = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.fetchTeams(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;

};

export const fetchCelebrations = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.fetchCelebrations(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;

};

export const fetchSupplyDistributionSites = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.fetchSupplyDistributionSites(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;

};

export const fetchTrashCollectionSites = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.fetchTrashCollectionSites(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;

};

export const fetchTowns = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.fetchTowns(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;

};

export const fetchTrashDrops = (): ThunkType => {
    function thunk(dispatch: Dispatch<ActionType>) {
        firebaseDataLayer.fetchTrashDrops(dispatch);
    }

    thunk.interceptOnOffline = true;
    return thunk;

};