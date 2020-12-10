import { gapi } from "gapi-script";
import { getData, getDataSubjects } from "./topTable";
import Bottleneck from "bottleneck";
import { jaccard } from "wuzzy";
import {initEventListeners} from './checkboxSelection.js'

const CLIENT_ID = process.env.CLIENT_ID;
const API_KEY = process.env.API_KEY;
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];

const SCOPES = "https://mail.google.com/";

const limiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000
});

let threadsButton = document.getElementById("threads_button");

handleClientLoad();

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
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
    threadsButton.onclick = listThreadsWrapper;
    if(!gapi.auth2.getAuthInstance().isSignedIn.get())
    {
      handleAuthClick();
    }

  }, function (error) {
    console.log(JSON.stringify(error, null, 2));
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    signOut.style.display = 'block';
    signIn.style.display = 'none';
    getEmailProfile()
    listThreadsWrapper()


  } else {
    userEmail.innerText = "";
    totalEmails.innerText = "";
    signOut.style.display = "none";
    signIn.style.display = "block";
  }
}

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}
function threadsGeMetatReq(id) {
  return gapi.client.gmail.users.threads.get({
    userId: "me",
    id: id,
    format: "METADATA",
    metadataHeaders: ["From"],
    maxResults: "1",
  });
}


function createNewBatch() {
  let batch = gapi.client.newBatch();
  return batch;
}

function listSubjects(ids) {
  let allSubjects = [];
  let batch = createNewBatch();
  let myBatches = [];
  let mySubPromises = [];


  for (let i = 0; i < ids.length; i++) {
    let val = getSubjectById(ids[i]);
    batch.add(val);

    if ((i + 1) % 100 == 0) {
      myBatches.push(batch);
      batch = createNewBatch();
    }
  }

  myBatches.push(batch);
  myBatches.forEach(batch => {

    let promise = new Promise(function (resolve, reject) {
      limiter.schedule(() => {
        batch.then(function (resp) {
          let items = resp.result;
          Object.values(items).forEach((item) => {
            let threadId = item.result.id;
            if (item.result.error) {
              reject(item.result.error);
            } else {
              console.log(threadId);
              let payload = item.result.messages[0].payload;
              let res = "";
              if (payload.hasOwnProperty("headers")) {
                res = payload.headers[0].value;
              }
              let myData = {};
              myData["subject"] = res;
              myData["id"] = threadId;
              allSubjects.push(myData);
              resolve(res);
            }
          });
        });
      });
    });

    mySubPromises.push(promise);
  });

  Promise.allSettled(mySubPromises).then(() => {

    let newArr = combineSubjects(allSubjects, "subject");
    getDataSubjects(newArr);
  });
}

function getSubjectById(id) {
  return gapi.client.gmail.users.threads.get({
    userId: "me",
    id: id,
    format: "METADATA",
    metadataHeaders: ["Subject"],
    maxResults: "1",
  });
}

function listThreadsWrapper()
{
  let maxCnt = 2;
  let batches = [];
  let myPromises = []

  listThreads(batches,maxCnt,null,myPromises)
}

function listThreads(batches, maxCnt, nextPageToken,myPromises) {
  document.querySelector('.loader_bg').style.display ="";
  document.querySelector('.loader').style.display = "block";
  let batch = createNewBatch();
  batches.push(batch);
  let allEmails = [];
  let reqObj = {
    userId: "me",
    labelIds: "INBOX",
  };
  if (nextPageToken) {
    reqObj = {
      userId: "me",
      labelIds: "INBOX",
      pageToken: nextPageToken,
    };
  }

  gapi.client.gmail.users.threads.list(reqObj).then(function (response) {
    let threads = response.result.threads;

    if (threads && threads.length > 0) {
      for (let i = 0; i < threads.length; i++) {
        let thread = threads[i];
        let val = threadsGeMetatReq(thread.id);
        batch.add(val);
      }

      let nextPageToken = response.result.nextPageToken;

      if (nextPageToken  > 0 && maxCnt-->0) {
        listThreads(batches,maxCnt,nextPageToken,myPromises);

      } else {
        batches.forEach((batch) => {
          let promise = new Promise(function (resolve, reject) {
            limiter.schedule(() => {
              batch.then(function (resp) {
                let items = resp.result;
                Object.values(items).forEach((item) => {
                  let threadid = item.result.id;
                  if (item.result.error) {
                    reject(item.result.error);
                  } else {
                    let res = item.result.messages[0].payload.headers[0].value;
                    let myData = {};

                    myData['emailAddress'] = res;
                    myData['id'] = threadid;
                    allEmails.push(myData);

                    resolve(res);
                  }
                });
                let newArr = removeDuplicates(allEmails, "emailAddress");
                getData(newArr);
              });
            });
          });

          myPromises.push(promise);
        });

        
        Promise.allSettled(myPromises).then(() => {
          getEmailProfile()
          initEventListeners()

        });
      }
    } else {
      console.log("No threads found");
    }
  });
}

const userEmail = document.getElementById("user-email");
const totalEmails = document.getElementById("total-emails");
const signOut = document.getElementById("sign-out");
const signIn = document.getElementById("sign-in");

function getEmailProfile() {
  gapi.client.gmail.users
    .getProfile({
      userId: "me",
    })
    .then(function (response) {
      let { emailAddress } = response.result;
      userEmail.innerText = `${emailAddress}`;
      return response.result;
    });

    gapi.client.gmail.users
    .labels.get({
      userId: "me",
      id: "INBOX"
    })
    .then(function (response) {
      let { threadsTotal } = response.result;
      totalEmails.innerText = `(${threadsTotal})`;
      return response.result;
    });
}

function combineSubjects(allObjs, property) {
  allObjs.sort(function (a, b) {
    var textA = a[property].toUpperCase();
    var textB = b[property].toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
  let ids = [];
  let newArr = [];
  let subjects = [];
  subjects.push(allObjs[0][property]);
  ids.push(allObjs[0].id);
  let obj = {
    [property]: subjects,
    counter: 1,
    threadIds: ids,
  };

  for (let i = 1; i < allObjs.length; i++) {
    let jaccardIdx = 0;
    if(allObjs[i][property].toUpperCase()===obj[property][0].toUpperCase())
    {
      jaccardIdx = 1;
    }

    else{
      jaccardIdx = jaccard(allObjs[i][property].toUpperCase(), obj[property][0].toUpperCase());
    }
    if (jaccardIdx >= 0.8) {
      obj.counter++;
      ids.push(allObjs[i].id);
      subjects.push(allObjs[i][property]);
      obj.threadIds = ids;
    } else {
      newArr.push(obj);
      obj = {};
      ids = [];
      subjects = [];
      subjects.push(allObjs[i][property]);

      obj[property] = subjects;
      obj.counter = 1;
      ids.push(allObjs[i].id);
      obj.threadIds = ids;
    }
  }
  newArr.push(obj);

  return newArr;
}

function removeDuplicates(allObjs, property) {
  allObjs.sort(function (a, b) {
    let textA = a[property].toUpperCase();
    let textB = b[property].toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  let sum = 1;
  let ids = [];
  let newArr = [];
  ids.push(allObjs[0].id);
  let obj = {
    [property]: allObjs[0][property],
    counter: 1,
    threadIds: ids,
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

export { listSubjects, handleAuthClick,getEmailProfile };
