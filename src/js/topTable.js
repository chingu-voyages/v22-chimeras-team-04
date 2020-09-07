import { listSubjects } from './gmailConnector'
let topSendersTbl = document.getElementById("topSendersTbl");
let selectiveTbl = document.getElementById("selectiveTbl"); //temporary
let topTblData = [];
function getData(extData) {
  let length = topSendersTbl.rows.length;
  for (let j = length - 1; j > 0; j--)
    topSendersTbl.deleteRow(j);

  topTblData = extData;
  orderData(topSendersTbl, topTblData);
  genericSort(compareNumDesc)
}

/*Temporary*/
function getDataSubjects(extData) {
  let length = selectiveTbl.rows.length;
  for (let j = length - 1; j > 0; j--)
    selectiveTbl.deleteRow(j);

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

function orderData(inTable, data) {

  let table = inTable;
  for (let i = 0, cellCnt = 0; i < data.length; i++) {
    let row = table.insertRow(i + 1)
    row.id = "row-" + (i + 1)
    for (const [key, value] of Object.entries(data[i])) {
      let cell = row.insertCell(cellCnt++);
      cell.innerText = decodeURIComponent(value);
    }

    let cell = row.insertCell(cellCnt++);

    let action = 'Delete: <a href=# id=delete-' + (i + 1) + ' onclick=deleteAllAct(this.id)>All</a> | <a href=# id=select-' + (i + 1) + ' onclick=deleteSomeAct(this.id)>Selective</a>';
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
  orderData(topSendersTbl, topTblData);
}

// window.deleteAllAct = function (id) {
//     let myid = id.replace("delete-", '')
//     let cells = topSendersTbl.rows[myid].cells;    
// }

window.deleteSomeAct = function (id) {
  let myid = id.replace("select-", '')
  let cells = topSendersTbl.rows[myid].cells;
  let threads = cells[2].innerText.split(',');
  let from = cells[0].innerText;
  listSubjects(from, threads);

}
export { getData, getDataSubjects };