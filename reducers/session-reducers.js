// @flow
import * as types from "../constants/action-types";
import initialState from "./initial-state";

export const sessionReducers = (state: Object = initialState.session, action: ActionType): Object => {
    switch (action.type) {
        case types.FETCH_UPDATES_FAIL:
            return { ...state, updates: { ...state.updates, error: action.error } };
        case types.FETCH_UPDATES_SUCCESS:
            return { ...state, updates: { data: action.data, error: null } };
        case types.LOGIN_SUCCESSFUL :
            return { ...state, userIsLoggedIn: true };
        case types.FETCH_MESSAGES_SUCCESS:
            return { ...state, setupMessagesListener: true };
        case types.FETCH_TEAMS_SUCCESS :
            return { ...state, setupTeamsListener: true };
        case types.FETCH_PROFILE_SUCCESS :
            return { ...state, setupProfileListener: true };
        case types.FETCH_INVITEES_SUCCESS :
            return { ...state, setupInvitationsListener: true };
        case types.TEAM_MEMBER_FETCH_SUCCESS :
            return { ...state, setupMyTeamsListener: true };
        case types.RESET:
            return initialState.session;
        case types.NO_TEAMS_TO_LOAD:
            return {
                ...state,
                teamMembersLoaded: true
            };
        case types.INITIALIZE_FAIL:
            return {
                ...state,
                isInitialized: false,
                initializeError: "Failed to initialize user"
            };
        default:
            return state;
    }
};
