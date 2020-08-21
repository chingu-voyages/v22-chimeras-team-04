var table = document.getElementById("topSendersTbl");
var cellCnt = 0;

var data =  [{emailContact:"test1@yan.com", emailCnt: 456}, 
{emailContact:"av1@rr.com", emailCnt: 3333 },
{emailContact:"bv1@rr.com", emailCnt: 2 },
{emailContact:"twest1@gg.com", emailCnt: 0}, 
{emailContact:"a1v1@rr.com", emailCnt: 23333 },
{emailContact:"3av1@rr.com", emailCnt: 12 },
{emailContact:"tesfft1@yafffn.com", emailCnt: 54}, 
{emailContact:"ff@rr.com", emailCnt: 909 },
{emailContact:"zz1@rr.com", emailCnt: 321 }];

var action = 'Delete: <a href=_blank>All</a> | <a href=_blank>Selective</a>'
var orderData = function (data) {
  var i = 0;
  for (i = 0; i < data.length; i++) {
    var row = table.insertRow(i + 1)
    cellCnt = 0;
    for (const [key, value] of Object.entries(data[i])) {
      var cell = row.insertCell(cellCnt++);
      cell.innerHTML = value;
    }

    var cell = row.insertCell(cellCnt++);
    cell.innerHTML = action;
  }
}

orderData(data);

function genericCmp(a, b) {
  if (a < b) {
    return 1;
  }
  if (a > b) {
    return -1;
  }
  return 0;
}

function compareNumAsc(a, b) {
  return genericCmp(b.emailCnt, a.emailCnt)

}

function compareNumDesc(a, b) {
  return genericCmp(a.emailCnt, b.emailCnt)
}

function compareStrAsc(a, b) {
  return genericCmp(b.emailContact, a.emailContact)
}

function compareStrDesc(a, b) {
  return genericCmp(a.emailContact, b.emailContact)
}

function genericSort(cmpF) {
  data.sort(cmpF);
  cellCnt = 0;
  for (j = data.length; j > 0; j--)
    table.deleteRow(j);
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