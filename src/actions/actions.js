import {default as keymirror} from "keymirror";

export const actionTypes = keymirror({
    ADD_BAGS: null,
    REMOVE_BAGS: null,
    PICKUP_BAGS: null,
    UPSERT_PICKUP_LOCATION: null,
    REMOVE_PICKUP_LOCATION: null
});


export const actions = {
    addBags: (bagCount, location) => ({type: actionTypes.ADD_BAGS, bagCount, location}),
    removeBags: (bagCount, location) => ({type: actionTypes.REMOVE_BAGS, bagCount, location}),
    pickupBags: (bagCount, location) => ({type: actionTypes.REMOVE_BAGS, bagCount, location})
};

