var table = document.getElementById("topSendersTbl");

var rowCnt = 1;
var cellCnt = 0;

var action = 'Delete: <a href=_blank>All</a> | <a href=_blank>Selective</a>'
var data = {row1: {emailContact:"test1@yan.com", emailCnt: 456, Action:action}, row2:{emailContact:"av1@rr.com", emailCnt: 3333, Action:action }};

var orderData = function(data){
for (const [key, val] of Object.entries(data)) {
    var row = table.insertRow(rowCnt++)
    cellCnt = 0;
for (const [key, value] of Object.entries(val)) {
    var cell = row.insertCell(cellCnt++);
    cell.innerHTML = value;
  }
}
}
orderData(data);
var sortAlphUp =  function() {
    rowCnt = 1;
    cellCnt = 0;
    var sortedData =  Object.keys(data).sort(function(a,b){
        return data[a].emailCnt - data[b].emailCnt
    });
    orderData(sortedData);
}
