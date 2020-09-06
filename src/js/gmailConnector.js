import {gapi} from 'gapi-script';
import {getData,getDataSubjects} from './topTable';
import Bottleneck from "bottleneck";

const CLIENT_ID = process.env.CLIENT_ID;
const API_KEY = process.env.API_KEY;
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

  const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 50 
});


let threadsButton = document.getElementById('threads_button');
let totalEmailsBtn = document.getElementById('totalemails_button');
let currentStatDiv = document.getElementById('h1');
// const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const totalEmails = document.getElementById('total-emails');
const signOut = document.getElementById('sign-out');
const signIn = document.getElementById('sign-in');

handleClientLoad();

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    signIn.onclick = handleAuthClick;
    signOut.onclick = handleSignoutClick;
    threadsButton.onclick = listThreads;
    totalEmailsBtn.onclick = getEmailProfile;
  }, function (error) {
    console.log(JSON.stringify(error, null, 2));
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    currentStatDiv.innerHTML = "*****signed-in*****";
    getEmailProfile()
    signOut.style.display = 'block';
    signIn.style.display = 'none';
  } else {
    currentStatDiv.innerHTML = "*****signed-out*****";
    userEmail.innerText = "Email Address";
    totalEmails.innerText = "Number of Emails";
    signOut.style.display = 'none';
    signIn.style.display = 'block';
  }
}

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}
function threadsGeMetatReq (id) {
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

function listSubjects(from, ids) {
  let allSubjects = [];
  let batch = createNewBatch();
  let myBatches = [];

  for (let i = 0; i < ids.length; i++) {
    let val = getSubjectById(ids[i]);
    batch.add(val);

    if((i + 1)%100 == 0){
      myBatches.push(batch);
      batch = createNewBatch();
    }
  }

  myBatches.push(batch);
    let mySubPromises = [];
    myBatches.forEach(batch => {

      let promise = new Promise(function (resolve, reject) {
        limiter.schedule(() => {
          batch.then(function (resp) {

            let items = resp.result;
            Object.values(items).forEach(item => {
              let threadId = item.result.id;
              if (item.result.error) {
                reject(item.result.error)
              } else {
                
                  console.log(threadId);
                let payload = item.result.messages[0].payload;
                let res = ""
                if(payload.hasOwnProperty('headers'))
                {
                  res = payload.headers[0].value;
                }
                let myData = {};
                myData['subject'] = res;
                myData['id'] = threadId;
                allSubjects.push(myData);
                resolve(res)
                
              }
            })

          })
        })
      })

      mySubPromises.push(promise);


    })

   Promise.allSettled(mySubPromises).then(() => {

      let newArr = removeDuplicates(allSubjects, "subject");
      getDataSubjects(newArr);
      
    });
  
}

 function getSubjectById  (id) {
  return gapi.client.gmail.users.threads.get({
    'userId': 'me',
    'id': id,
    'format': 'METADATA',
    'metadataHeaders': ['Subject'],
    'maxResults': '1'
  })
}


function listThreads(nextPageToken = null) {
  let batch = createNewBatch();
  let allEmails = [];

  let newData = [];
  let reqObj = {
    'userId': 'me',
    'labelIds': 'INBOX'
  };
  if (!isNaN(nextPageToken)) {
    reqObj = {
      'userId': 'me',
      'labelIds': 'INBOX',
      'pageToken': nextPageToken
    }
  }

  gapi.client.gmail.users.threads.list(reqObj).then(function (response) {

      let threads = response.result.threads;

      if (threads && threads.length > 0) {
        for (let i = 0; i < threads.length; i++) {
          let thread = threads[i];
          let val = threadsGeMetatReq(thread.id);
          batch.add(val);
        }

        cnt++;
        let nextPageToken = response.result.nextPageToken;

        if (nextPageToken && cnt < 5) {
          listThreads(nextPageToken);

        } else {

          batches.forEach(batch => {

            let promise = new Promise(function (resolve, reject) {
              limiter.schedule(() => {
                batch.then(function (resp) {
                  let items = resp.result;
                  Object.values(items).forEach(item => {
                    let threadid = item.result.id;
                    if (item.result.error) {
                      reject(item.result.error)
                    } else {
                      let res = item.result.messages[0].payload.headers[0].value;
                      let myData = {};
                      myData['emailAddress'] = res;
                      myData['id'] = threadid;
                      allEmails.push(myData);
                      resolve(res);
                    }
                  })
                })
              })
            })

            myPromises.push(promise);


          })

         Promise.allSettled(myPromises).then(() => {
            let newArr = removeDuplicates(allEmails, "emailAddress");
            getData(newArr);
            cnt = 0;
            batches = [];
            myPromises = [];
            
          });
        }
      } else {
        console.log("No threads found");
      }
    }

  );
}

function getEmailProfile() {
  gapi.client.gmail.users.getProfile({
    'userId': 'me'
  }).then(function (response) {
    let{emailAddress, messagesTotal } = response.result
    userEmail.innerText = emailAddress;
    totalEmails.innerText = messagesTotal;
    return response.result; 
  });
}

function removeDuplicates(allObjs, property) {
  allObjs.sort(function (a, b) {
    let textA = a[property].toUpperCase();
    let textB = b[property].toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });

  let sum = 1;
  let ids = [];
  let newArr = [];
  ids.push(allObjs[0].id);
  let obj = {
    [property]: allObjs[0][property],
    counter: 1,
    threadIds: ids
  };

  for (let i = 1; i < allObjs.length; i++) {
    if (allObjs[i][property] == obj[property]) {
      obj.counter++;
      ids.push(allObjs[i].id);
      obj.threadIds = ids;
    } else {
      newArr.push(obj);
      obj = {};
      ids = [];
      obj[property] = allObjs[i][property];
      obj.counter = 1;
      ids.push(allObjs[i].id);
      obj.threadIds = ids;
    }
  }
  newArr.push(obj);

  return newArr;

}

export {listSubjects};