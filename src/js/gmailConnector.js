import {
  gapi
} from 'gapi-script';
import {
  config
} from './config';
import {
  getData
} from './topTable';
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
  minTime: 3000
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
    totalEmailsBtn.onclick = getEmailProfile;
  }, function (error) {
    console.log(JSON.stringify(error, null, 2));
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
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}
var threadsGeMetatReq = function (id) {
  return gapi.client.gmail.users.threads.get({
    'userId': 'me',
    'id': id,
    'format': 'METADATA',
    'metadataHeaders': ['From'],
    'maxResults': '1'
  })
}

let myPromises = []
let cnt = 0;
let batches = [];

function createNewBatch() {
  let batch = gapi.client.newBatch();
  batches.push(batch);
  return batch;
}

function listThreads(nextPageToken) {
  let batch = createNewBatch();
  let newData = [];

  gapi.client.gmail.users.threads.list({
      'userId': 'me',
      'nextPageToken': nextPageToken
    }).then(function (response) {

        var threads = response.result.threads;

        if (threads && threads.length > 0) {
          for (let i = 0; i < threads.length; i++) {
            var thread = threads[i];
            let val = threadsGeMetatReq(thread.id);
            batch.add(val);
          }
          
          cnt++;
          var nextPageToken = response.result.nextPageToken;

          if (nextPageToken && cnt < 10) {
            console.log(cnt);
            listThreads(nextPageToken);

          } else {

            batches.forEach(batch => {

              let promise = new Promise(function (resolve){
                limiter.schedule(()=> {batch.then(function (resp) {
                  let items = resp.result;
                  Object.values(items).forEach(item => {
                    let threadid = item.result.id;
                    let res = item.result.messages[0].payload.headers[0].value;
                    let myData = {};
                    myData['emailAddress'] = res;
                    myData['id'] = threadid;
                    allEmails.push(myData);
                    resolve(res);

                  })
                })
              })})

              myPromises.push(promise);

  
              })

                Promise.all(myPromises).then(() => {
                allEmails.sort(function (a, b) {
                  var textA = a.emailAddress.toUpperCase();
                  var textB = b.emailAddress.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });

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

                getData(newArr);

                 });
              }
            }
            else {
              console.log("No threads found");
            }
          }

        );
      }

      function getEmailProfile() {
        gapi.client.gmail.users.getProfile({
          'userId': 'me'
        }).then(function (response) {
          return response.result;
        });
      }