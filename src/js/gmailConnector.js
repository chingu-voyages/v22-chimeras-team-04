import {gapi} from 'gapi-script';
import {config} from './config';
import {getData} from './topTable';
import Bottleneck from "bottleneck";


// Client ID and API key from the Developer Console
const CLIENT_ID = config.CLIENT_ID;
const API_KEY = config.API_KEY;

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 50 
});

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var threadsButton = document.getElementById('threads_button');
var totalEmailsBtn = document.getElementById('totalemails_button');
var currentStatDiv = document.getElementById('h1');
var allEmails = [];

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
    threadsButton.onclick = listThreads;
    totalEmailsBtn.onclick = getTotalEmails;
  }, function (error) {
    // appendPre(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    currentStatDiv.innerHTML = "*****signed-in*****";
  } else {
    currentStatDiv.innerHTML = "*****signed-out*****";
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
function appendPre(message) {
  var pre = document.getElementById('info');
  var textContent = document.createTextNode(message + '\r\n');
  pre.appendChild(textContent);
}

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */



function listThreads(nextPageToken) {

  let newData = [];
  let myPromises = []

  gapi.client.gmail.users.threads.list({
    'userId': 'me',
    'nextPageToken': nextPageToken
  }).then(function (response) {
      var threads = response.result.threads;
      appendPre('Threads:');

      if (threads && threads.length > 0) {
        for (let i = 0; i < threads.length; i++) {
          var thread = threads[i];
          myPromises.push(getMeta(thread.id));
        }




        var nextPageToken = response.result.nextPageToken;
        nextPageToken = null; //run only for 100 first only
             if (nextPageToken) {
                listThreads(nextPageToken);

             } else {
              Promise.all(myPromises).then(() => {
                allEmails.sort(function (a, b) {
                  var textA = a.emailAddress.toUpperCase();
                  var textB = b.emailAddress.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
            
                console.log(allEmails);
                let sum = 1;
                let ids = [];
                let newArr = [];
                ids.push(allEmails[0].id);
                let obj = {
                  emailContact: allEmails[0].emailAddress,
                  emailCnt: 1,
                  threadIds: ids
                };
            
                for (let i = 1; i < allEmails.length; i++) {
                  if (allEmails[i].emailAddress == obj.emailContact) {
                    obj.emailCnt++;
                    ids.push(allEmails[i].id);
                    obj.threadIds = ids;
                  } else {
                    newArr.push(obj);
                    obj = {};
                    ids = [];
                    obj.emailContact = allEmails[i].emailAddress;
                    obj.emailCnt = 1;
                    ids.push(allEmails[i].id);
                    obj.threadIds = ids;
                  }
                }
                console.log(newArr);

                getData(newArr);
            
              });
             }
      } else {
        appendPre('No Threads found.');
      }
    }

  );

 

}

function getMeta(threadId) {

  return new Promise(function (resolve, reject) {
    limiter.schedule(()=> {gapi.client.gmail.users.threads.get({
      'userId': 'me',
      'id': threadId,
      'format': 'METADATA',
      'metadataHeaders': ['From'],
      'maxResults': '1'
    }).then((function (response) {
      var res = response.result.messages[0].payload.headers[0].value;
      let myData = {};
      myData['emailAddress'] = res;
      myData['id'] = threadId;
      allEmails.push(myData);
      resolve(res);
    }));
  })})
}


function getTotalEmails() {
  gapi.client.gmail.users.getProfile({
    'userId': 'me'
  }).then(function (response) {
    var resp = response.result;
    appendPre('Profile:');

    if (resp) {
      appendPre("email address" + resp.emailAddress);
      appendPre("total threads" + resp.threadsTotal);
      appendPre("total messages" + resp.messagesTotal);
    } else {
      appendPre('Not found.');
    }
  });
}