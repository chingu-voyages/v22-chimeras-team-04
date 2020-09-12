import { gapi } from 'gapi-script';
import { getData, getDataSubjects } from './topTable';
import Bottleneck from "bottleneck";
import { jaccard } from 'wuzzy';

const CLIENT_ID = process.env.CLIENT_ID;
const API_KEY = process.env.API_KEY;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

const SCOPES = 'https://mail.google.com/';

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 50
});

let authorizeButton = document.getElementById('authorize_button');
let signoutButton = document.getElementById('signout_button');
let threadsButton = document.getElementById('threads_button');
let totalEmailsBtn = document.getElementById('totalemails_button');
let currentStatDiv = document.getElementById('h1');

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
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    threadsButton.onclick = listThreads;
    totalEmailsBtn.onclick = getEmailProfile;
  }, function (error) {
    console.log(JSON.stringify(error, null, 2));
  });
}


function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    currentStatDiv.innerHTML = "*****signed-in*****";
  } else {
    currentStatDiv.innerHTML = "*****signed-out*****";
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

    if ((i + 1) % 100 == 0) {
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
              if (payload.hasOwnProperty('headers')) {
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
    let newArr = combineSubjects(allSubjects, "subject");
    getDataSubjects(newArr);

  });


}

function getSubjectById(id) {
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
                    let fromArray = res.split(" ");
                    let arrayLength = fromArray.length;
                    let myData = {};
                    myData['name'] = fromArray.slice(0, arrayLength - 1).join(" ")
                    let address = fromArray.slice(-1)[0]
                    myData['emailAddress'] = address.substring(1, address.length - 1);
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
    return response.result;
  });
}


function combineSubjects(allObjs, property) {
  allObjs.sort(function (a, b) {
    var textA = a[property].toUpperCase();
    var textB = b[property].toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  let ids = [];
  let newArr = [];
  let subjects = [];
  subjects.push(allObjs[0][property]);
  ids.push(allObjs[0].id);
  let obj = {
    [property]: subjects,
    counter: 1,
    threadIds: ids
  };

  for (let i = 1; i < allObjs.length; i++) {
    let jaccardIdx = jaccard(allObjs[i][property], obj[property][0]);
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

export { listSubjects };
