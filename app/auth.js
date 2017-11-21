import auth0 from 'auth0-js';
import history from './history';

export default class Auth {
  requestedScopes = 'openid profile email read:todos write:todos';

  // Please use your own credentials here
  auth0 = new auth0.WebAuth({
    domain: 'divyanshu.auth0.com',
    clientID: 'gnXmrO24CGNBuYtfGgblgOHM2GESYQ5N',
    redirectUri: process.env.NODE_ENV === 'development' ? 'http://localhost:8001/callback' : 'https://appbaseio-apps.github.io/todomvc-authorization-client/callback',
    audience: 'https://divyanshu.xyz',
    responseType: 'token id_token',
    scope: this.requestedScopes
  });

  login = () => {
    this.auth0.authorize();
  }

  // parses the result after authentication from URL hash
  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      console.log(authResult)
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        history.replace('/');
      } else if (err) {
        history.replace('/');
        console.log(err);
      }
    });
  }

  // Sets user details in localStorage
  setSession = (authResult) => {
    console.log(authResult)
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());

    // If there is a value on the `scope` param from the authResult,
    // use it to set scopes in the session for the user. Otherwise
    // use the scopes as requested. If no scopes were requested,
    // set it to nothing
    const scopes = authResult.scope || this.requestedScopes || '';

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('name', authResult.idTokenPayload.nickname);
    localStorage.setItem('avatar', authResult.idTokenPayload.picture);
    // store scopes
    localStorage.setItem('scopes', JSON.stringify(scopes));
    localStorage.setItem('email', authResult.idTokenPayload.email);
    // navigate to the home route
    history.replace('/');
  }

  // removes user details from localStorage
  logout = () => {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('name');
    localStorage.removeItem('avatar');
    localStorage.removeItem('scopes');
    localStorage.removeItem('email');
    // navigate to the home route
    history.replace('/');
  }

  // checks if the user is authenticated
  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  getAccessToken() {
		const accessToken = localStorage.getItem('access_token');
		if (!accessToken) {
			throw new Error('No access token found');
		}
		return accessToken;
  }
  
  // checks if the user has scopes to conditionally render UI
  // this method doesn't guarantees the authenticity of the scopes since anyone can modify this in the browser
  // we'll add checks in the server to verify the scopes
  userHasScopes(scopes) {
    const parsedScopes = JSON.parse(localStorage.getItem('scopes'));
    if (!parsedScopes) {
      return false;
    }
    const grantedScopes = parsedScopes.split(' ');
    return scopes.every(scope => grantedScopes.includes(scope));
  }

  getUserEmail() {
    return localStorage.getItem('email');
  }
}
