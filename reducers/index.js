import {combineReducers} from 'redux';
import {reducers as messages} from '../screens/messages-screen/reducers';
import {reducers as loading} from '../screens/loading-screen/reducers';
import {reducers as login} from '../screens/login-screen/reducers';
import {reducers as teams} from '../screens/teams-screen/reducers';
import {reducers as profile} from '../screens/profile-screen/reducers';
import {reducers as trashTracker} from '../screens/trash-tracker-screen/reducers';

const rootReducer = combineReducers({loading, login, messages, teams, trashTracker, profile});

export default rootReducer;