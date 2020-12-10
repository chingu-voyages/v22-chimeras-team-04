import { listSubjects } from './gmailConnector'
import {showTrashIcon} from './checkboxSelection'
let topSendersTbl = document.getElementById("topSendersTbl");
let selectiveTbl = document.getElementById("selectiveTbl"); 
let topTblData = [];
let selectiveTblData = [];

const loaderBg = document.querySelector('.loader_bg');


function getData(extData) {
  let length = topSendersTbl.rows.length;
  for (let j = length - 1; j > 0; j--)
    topSendersTbl.deleteRow(j);

  topTblData = extData;
  orderData(topSendersTbl, topTblData, false);
  genericSort(compareNumDesc, false)
}

function getDataSubjects(extData) {
  let length = selectiveTbl.rows.length;
  for (let j = length - 1; j > 0; j--)
    selectiveTbl.deleteRow(j);

  selectiveTblData = extData;
  orderData(selectiveTbl, selectiveTblData, true);
  genericSort(compareNumDesc, true)

}

document.getElementById('sortNumUp').onclick = function () {
  genericSort(compareNumAsc,false)
}
document.getElementById('sortNumDown').onclick = function () {
  genericSort(compareNumDesc,false)
}
document.getElementById('sortAlphUp').onclick = function () {
  genericSort(compareEmailAsc,false)
}
document.getElementById('sortAlphDown').onclick = function () {
  genericSort(compareEmailDesc,false)
}

document.getElementById('sortNumUpSelective').onclick = function () {
  genericSort(compareNumAsc,true)
}
document.getElementById('sortNumDownSelective').onclick = function () {
  genericSort(compareNumDesc,true)
}
document.getElementById('sortAlphUpSelective').onclick = function () {
  genericSort(compareSubjectAsc,true)
}
document.getElementById('sortAlphDownSelective').onclick = function () {
  genericSort(compareSubjectDesc,true)
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

    let cell = row.insertCell(cellCnt++);
   
    cell.innerHTML = '<input type="checkbox" id="'+"c-row-"+(i+1)+'">';
    if(isSelective)
    {
      cell.innerHTML = '<input type="checkbox" id="'+"s-c-row-"+(i+1)+'">';

    }
    for (const [key, value] of Object.entries(data[i])) {
       cell = row.insertCell(cellCnt++);
      cell.innerText = value;
    }

     cell = row.insertCell(cellCnt++);
    let action = '<button class=btn-all id=p-delete-' + (i + 1) + ' onclick=deleteAllAct(this.id,false) >All</button>  <button class=btn-selective id=p-select-' + (i + 1) + ' onclick=deleteSomeAct(this.id)>Selective</button>';
    if(isSelective){
       action = '<button class=btn-all id=s-delete-' + (i + 1) + ' onclick=deleteAllAct(this.id,true) >All</button>';
    }
    cell.innerHTML = action;
    cellCnt = 0;
    countRows++
  }
if(isSelective){

  let s_inputRow;
 for (let i = 1; i < table.rows.length; i++) {
     s_inputRow = document.getElementById('s-c-row-' + i);
     s_inputRow.addEventListener('change', showTrashIcon);
     s_inputRow.isSelective = true; //TODO: verify that all those listeners are cleared once the table is refreshed   
 }
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

function compareEmailAsc(a, b) {
  return compareFunc(b.emailAddress, a.emailAddress)
}

function compareEmailDesc(a, b) {
  return compareFunc(a.emailAddress, b.emailAddress)
}

function compareSubjectAsc(a, b) {
  return compareFunc(b.subject, a.subject)
}

function compareSubjectDesc(a, b) {
  return compareFunc(a.subject, b.subject)
}

function genericSort(compareFunc, isSelective) {
  if(isSelective)
  {
    selectiveTblData.sort(compareFunc);
    for (let j = selectiveTblData.length; j > 0; j--)
    selectiveTbl.deleteRow(j);
    orderData(selectiveTbl, selectiveTblData, true);
  }

  else{ 
    topTblData.sort(compareFunc);
    for (let j = topTblData.length; j > 0; j--)
      topSendersTbl.deleteRow(j);
    orderData(topSendersTbl, topTblData, false);
  }
}
const topTable = document.querySelector('.all-senders');
const selectiveTable = document.querySelector('.selective');
const btnBack = document.querySelector('.back');
selectiveTable.style.display = "none";

window.deleteSomeAct = function (id) {
  
  let myid = id.replace("p-select-", '')

  let cells = topSendersTbl.rows[myid].cells;
  let threads = cells[3].innerText.split(',');

  topTable.style.display = "none";

  selectiveTable.style.display = "block";
  btnBack.addEventListener('click', () => {

    topTable.style.display = "block";
    selectiveTable.style.display = "none";
  })

  listSubjects(threads);

}
export { getData, getDataSubjects };