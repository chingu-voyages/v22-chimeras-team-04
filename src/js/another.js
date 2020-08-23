import { gapi } from 'gapi-script';
import {config} from './config';
 // Client ID and API key from the Developer Console
 const CLIENT_ID = config.CLIENT_ID;
 const API_KEY = config.API_KEY;

 // Array of API discovery doc URLs for APIs used by the quickstart
 const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

 // Authorization scopes required by the API; multiple scopes can be
 // included, separated by spaces.
 const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

 var authorizeButton = document.getElementById('authorize_button');
 var signoutButton = document.getElementById('signout_button');
 var currentStatDiv = document.getElementById('h1');
 handleClientLoad();
 function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    }, function(error) {
     // appendPre(JSON.stringify(error, null, 2));
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        currentStatDiv.innerHTML="*****signed-in*****";
    } else {
        currentStatDiv.innerHTML="*****signed-out*****";
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  /*function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }*/

  /**
   * Print all Labels in the authorized user's inbox. If no labels
   * are found an appropriate message is printed.
   */
 /* function listLabels() {
    gapi.client.gmail.users.labels.list({
      'userId': 'me'
    }).then(function(response) {
      var labels = response.result.labels;
      appendPre('Labels:');

      if (labels && labels.length > 0) {
        for (i = 0; i < labels.length; i++) {
          var label = labels[i];
          appendPre(label.name)
        }
      } else {
        appendPre('No Labels found.');
      }
    });
  }*/
