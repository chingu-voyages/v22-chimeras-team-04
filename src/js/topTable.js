let topSendersTbl = document.getElementById("topSendersTbl");
let selectiveTbl = document.getElementById("selectiveTbl"); //temporary
const action = 'Delete: <a href=_blank>All</a> | <a href=_blank>Selective</a>';
let topTblData = [];
function getData(extData)
{
  topTblData = extData;
  orderData(topSendersTbl, topTblData);
  genericSort(compareNumDesc)
}

/*Temporary*/
function getDataSubjects(extData)
{
  let selectiveTblData = [];
  selectiveTblData = extData;
  orderData(selectiveTbl, selectiveTblData);
}

document.getElementById('sortNumUp').onclick = function () {
  genericSort(compareNumAsc)
}
document.getElementById('sortNumDown').onclick = function () {
  genericSort(compareNumDesc)
}
document.getElementById('sortAlphUp').onclick = function () {
  genericSort(compareStrAsc)
}
document.getElementById('sortAlphDown').onclick = function () {
  genericSort(compareStrDesc)
}

function orderData (inTable, data) {
  let table =inTable;
  for (let i = 0, cellCnt = 0; i < data.length; i++) {
    let row = table.insertRow(i + 1)
    for (const [key, value] of Object.entries(data[i])) {
      let cell = row.insertCell(cellCnt++);
      cell.innerText = decodeURIComponent(value);
    }

    let cell = row.insertCell(cellCnt++);
    cell.innerHTML = action;
    cellCnt = 0;
  }
}

function compareFunc(a, b) {
  if (a < b) {
    return 1;
  }
  if (a > b) {
    return -1;
  }
  return 0;
}

function compareNumAsc(a, b) {
  return compareFunc(b.counter, a.counter)
}

function compareNumDesc(a, b) {
  return compareFunc(a.counter, b.counter)
}

function compareStrAsc(a, b) {
  return compareFunc(b.emailAddress, a.emailAddress)
}

function compareStrDesc(a, b) {
  return compareFunc(a.emailAddress, b.emailAddress)
}

function genericSort(compareFunc) {
  topTblData.sort(compareFunc);
  for (let j = topTblData.length; j > 0; j--)
  topSendersTbl.deleteRow(j);
  orderData(topSendersTbl,topTblData);
}

export {getData,getDataSubjects};