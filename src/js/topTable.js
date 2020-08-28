//import {data} from './demoData'

let table = document.getElementById("topSendersTbl");

const action = 'Delete: <a href=_blank>All</a> | <a href=_blank>Selective</a>';
let data = [];

function getData(extData)
{
  data = extData;
  orderData(data);
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

function orderData (data) {
  for (let i = 0, cellCnt = 0; i < data.length; i++) {
    let row = table.insertRow(i + 1)
    for (const [key, value] of Object.entries(data[i])) {
      let cell = row.insertCell(cellCnt++);
      cell.innerHTML = value;
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
  return compareFunc(b.emailCnt, a.emailCnt)

}

function compareNumDesc(a, b) {
  return compareFunc(a.emailCnt, b.emailCnt)
}

function compareStrAsc(a, b) {
  return compareFunc(b.emailContact, a.emailContact)
}

function compareStrDesc(a, b) {
  return compareFunc(a.emailContact, b.emailContact)
}

function genericSort(compareFunc) {
  data.sort(compareFunc);
  for (let j = data.length; j > 0; j--)
    table.deleteRow(j);
  orderData(data);
}

export {getData};