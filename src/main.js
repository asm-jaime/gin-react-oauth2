import React from 'react';
import PropTypes from 'prop-types';
import {
  default as ReactDOM
} from 'react-dom';
import {
  connect,
  Provider
} from 'react-redux';

import {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware
} from 'redux';

import thunk from 'redux-thunk';

import cuid from 'cuid';
import querystring from 'query-string';

// ========== constants
const config = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

const URL_SERVER = 'http://localhost:8081/api';
const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGOUT = 'LOGOUT';

const UPD_USER = 'UPD_USER';

const TOKEN_KEY = 'token'
const EXPIRES_AT_KEY = 'expiresAt'

const POPUP_SETTINGS =
'scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no'

// ========== util

const getPopupDimensions = (width, height) => {
  const wLeft = window.screenLeft || window.screenX
  const wTop = window.screenTop || window.screenY

  const left = wLeft + window.innerWidth / 2 - width / 2
  const top = wTop + window.innerHeight / 2 - height / 2

  return `width=${width},height=${height},top=${top},left=${left}`
}

const openPopup = (url, name, width, height) =>
  window.open(url, name, `${POPUP_SETTINGS},${getPopupDimensions(width, height)}`)

const getExpiresAt = () =>
  Number(window.localStorage.getItem(EXPIRES_AT_KEY)) || null

const hasToken = () => getToken() !== null

const getToken = () => {
  const expiresAt = getExpiresAt()
  if (expiresAt === null || expiresAt > Date.now()) {
    return window.localStorage.getItem(TOKEN_KEY) || null
  }
  return null
}

const setToken = (token, expiresAt) => {
  window.localStorage.setItem(TOKEN_KEY, token)
  if (expiresAt !== null) {
    window.localStorage.setItem(EXPIRES_AT_KEY, expiresAt)
  } else {
    window.localStorage.removeItem(EXPIRES_AT_KEY)
  }
}

const removeToken = () => {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(EXPIRES_AT_KEY)
}

const listenForCredentials = (popup, state, resolve, reject) => {
  let loc = '';
  try {
    loc = `${popup.location}`;
  } catch (err) {
    loc = 'about:blank';
    if (process.env.NODE_ENV !== 'production') {
      console.error(err);
    }
  }

  if (loc && loc != 'about:blank') {
    popup.close();
    const hash = '#'+`${loc}`.split('?')[1];

    const response = querystring.parse(hash.substr(1))
    if (response.state !== state) {
      reject('Invalid state returned.')
    }

    if (response.code) {
      const expiresIn = response.expires_in
        ? parseInt(response.expires_in)
        : NaN
      const result = {
        token: response.code,
        expiresAt: !isNaN(expiresIn) ? Date.now() + expiresIn * 1000 : null
      };
      resolve(result);
    } else {
      reject(response.error || 'Unknown error.');
    }
  } else if (popup.closed) {
    reject('Authentication was cancelled.')
  } else {
    setTimeout(() => listenForCredentials(popup, state, resolve, reject), 1000)
  }
}

const authorize = config => {
  const query = querystring.stringify({
    state: config.state,
    response_type: 'token',
    client_id: config.client,
    scope: config.scope,
    redirect_uri: config.redirect
  });
  const url = config.url + (config.url.indexOf('?') === -1 ? '?' : '&') + query;

  const width = config.width || 400;
  const height = config.height || 400;
  const popup = openPopup(config.link, 'oauth2', width, height);

  return new Promise((resolve, reject) =>
    listenForCredentials(popup, config.state, resolve, reject)
  );
}

// ========== actions

const loginSuccess = (token, expiresAt) => ({
  type: LOGIN_SUCCESS,
  token,
  expiresAt
});

const loginFailure = error => ({
  type: LOGIN_FAILURE,
  error
});

const logout = () => {
  return dispatch => {
    return fetch(`${URL_SERVER}/logout`)
    .then((res) => dispatch({type: LOGOUT}))
    .catch(console.error);
  };
};

const requestGet = (subreddit) => ({
  type: REQUEST_GET,
  subreddit
});

const get_user = () => {
  return dispatch => {
  return fetch(`${URL_SERVER}/authorized/user`)
    .then((res) => res.json())
    .then((res) => {
      return dispatch({type: UPD_USER, payload: res.body});
    }).catch(console.error);
  }
};

const login = () => {
  return dispatch => {
    return fetch(`${URL_SERVER}/login`)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error(`bad status: ${res.status}`);
      };
    })
    .then((res) => {
      const config = {
        url: res.auth_url,
        client: res.client_id,
        redirect: res.redirect_uri,
        scope: res.scope,
        state: res.state,
        link: res.link,
      };
      return dispatch({type: LOGIN_REQUEST, payload: config});
    }).catch(console.error);
  };
};

// ========== initial state

const initialState = {
  auth: {
    isLoggedIn: hasToken(),
    token: getToken(),
    expiresAt: getExpiresAt(),
    isLoggingIn: false,
    error: null
  },
  reducer: {
    user: {name: '', email: ''},
  },
}

// ========== Login

@connect(mapStateToProps, mapDispatchToProps)
class Login extends React.Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool,
    login: PropTypes.func,
    logout: PropTypes.func,
    user: PropTypes.object,
    get_user: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.clickLogin = this.clickLogin.bind(this);
  }

  clickLogin() {
    this.props.login().then(() => {
      this.props.get_user();
    });
  }

  componentDidMount() {
    if (this.props.isLoggedIn) {
      this.props.get_user();
    }
  }

  render() {
    const {
      isLoggedIn,
      logout,
      user,
    } = this.props;
    if (isLoggedIn) {
      return (
        <div>
        <button type='button' onClick={logout}>Logout</button>
        <div>{user.name}</div>
        <div>{user.email}</div>
        </div>
      )
    } else {
      return (
        <button type='button' onClick={this.clickLogin}>Login</button>
      )
    };
  };
}

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    user: state.reducer.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    get_user: bindActionCreators(get_user, dispatch),
    login: bindActionCreators(login, dispatch),
    logout: bindActionCreators(logout, dispatch),
  };
}

// ========== reducers

const auth = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isLoggingIn: true
      })
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isLoggedIn: true,
        token: action.token,
        expiresAt: action.expiresAt,
        error: null,
        isLoggingIn: false
      })
    case LOGIN_FAILURE:
      return Object.assign({}, state, {
        isLoggedIn: false,
        token: null,
        expiresAt: null,
        error: action.error,
        isLoggingIn: false
      })
    case LOGOUT:
      return Object.assign({}, state, {
        isLoggedIn: false,
        token: null,
        expiresAt: null,
        error: null,
        isLoggingIn: false
      })
    default:
      return state
  }
}

const reducer = (state = initialState.reducer, action) => {
  switch (action.type) {
    case UPD_USER:
      return {
        ...state,
        user: {
          name: action.payload.Name,
          email: action.payload.Email,
        },
      }
    default:
      return state
  }
}

// ========== Middlewares

const authMiddleware = store => next => action => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return authorize(action.payload).then(
        ({ token, expiresAt }) =>
          store.dispatch(loginSuccess(token, expiresAt)),
        error => store.dispatch(loginFailure(error))
      )
    case LOGIN_SUCCESS:
      setToken(action.token, action.expiresAt)
      break
    case LOGIN_FAILURE:
    case LOGOUT:
      removeToken()
      break
  }
  return next(action);
}

// ========== store

const configureStore = (state) => (
  createStore(
    combineReducers({
      reducer,
      auth
    }),
    state,
    applyMiddleware(thunk, authMiddleware)
  )
)

const store = configureStore(initialState);

// ========== render

ReactDOM.render(
  <Provider store={store}>
    <Login/>
  </Provider>,
  document.getElementById('root'));
