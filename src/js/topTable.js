import { listSubjects } from './gmailConnector'
let topSendersTbl = document.getElementById("topSendersTbl");
let selectiveTbl = document.getElementById("selectiveTbl"); //temporary
let topTblData = [];

const loaderBg = document.querySelector('.loader_bg');


function getData(extData) {
  let length = topSendersTbl.rows.length;
  for (let j = length - 1; j > 0; j--)
    topSendersTbl.deleteRow(j);

  topTblData = extData;
  orderData(topSendersTbl, topTblData, false);
  genericSort(compareNumDesc)
}

/*Temporary*/
function getDataSubjects(extData) {
  let length = selectiveTbl.rows.length;
  for (let j = length - 1; j > 0; j--)
    selectiveTbl.deleteRow(j);

  let selectiveTblData = [];
  selectiveTblData = extData;
  orderData(selectiveTbl, selectiveTblData, true);
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

function orderData(inTable, data, isSelective) {

  let table = inTable;
  let countRows = null;
  for (let i = 0, cellCnt = 0; i < data.length; i++) {
    let row = table.insertRow(i + 1)
    
    row.id = "p-row-" + (i + 1)
    if(isSelective){
      row.id = "s-row-" + (i + 1)

    }
    for (const [key, value] of Object.entries(data[i])) {
      let cell = row.insertCell(cellCnt++);
      cell.innerText = decodeURIComponent(value);
    }

    let cell = row.insertCell(cellCnt++);
    let action = '<button class=btn-all><a href=# id=p-delete-' + (i + 1) + ' onclick=deleteAllAct(this.id,false) >All</a></button>  <button class=btn-selective><a href=# id=p-select-' + (i + 1) + ' onclick=deleteSomeAct(this.id,false)>Selective</a></button>';
    if(isSelective){
       action = '<button class=btn-all><a href=# id=s-delete-' + (i + 1) + ' onclick=deleteAllAct(this.id,true) >All</a></button>  <button class=btn-selective><a href=# id=s-select-' + (i + 1) + ' onclick=deleteSomeAct(this.id,true)>Selective</a></button>';
    }
    cell.innerHTML = action;
    cellCnt = 0;
    countRows++
  }
  if (countRows > 1) {
    loaderBg.style.display = "none";
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
const topTable = document.querySelector('.all-senders');
const selectiveTable = document.querySelector('.selective');
const btnBack = document.querySelector('.back');
selectiveTable.style.display = "none";

window.deleteSomeAct = function (id, isSelective) {
  
  let myid = id.replace("p-select-", '')
  if(isSelective){
    myid = id.replace("s-select-", '')
  }
  let cells = topSendersTbl.rows[myid].cells;
  let threads = cells[2].innerText.split(',');
  let from = cells[0].innerText;

  topTable.style.display = "none";

  selectiveTable.style.display = "block";
  btnBack.addEventListener('click', () => {

    topTable.style.display = "block";
    selectiveTable.style.display = "none";
  })

  listSubjects(threads);

}
export { getData, getDataSubjects };