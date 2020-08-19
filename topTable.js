var table = document.getElementById("topSendersTbl");

var cellCnt = 0;

var action = 'Delete: <a href=_blank>All</a> | <a href=_blank>Selective</a>'
var data =  [{emailContact:"test1@yan.com", emailCnt: 456, Action:action}, 
            {emailContact:"av1@rr.com", emailCnt: 3333, Action:action },
            {emailContact:"bv1@rr.com", emailCnt: 2, Action:action },
            {emailContact:"twest1@gg.com", emailCnt: 0, Action:action}, 
            {emailContact:"a1v1@rr.com", emailCnt: 23333, Action:action },
            {emailContact:"3av1@rr.com", emailCnt: 12, Action:action },
            {emailContact:"tesfft1@yafffn.com", emailCnt: 54, Action:action}, 
            {emailContact:"ff@rr.com", emailCnt: 909, Action:action },
            {emailContact:"zz1@rr.com", emailCnt: 321, Action:action }];

var orderData = function(data){
var i = 0;
for( i =0; i< data.length; i++){
    var row = table.insertRow(i+1)
    cellCnt = 0;
for (const [key, value] of Object.entries(data[i])) {
    var cell = row.insertCell(cellCnt++);
    cell.innerHTML = value;
  }
}
}

orderData(data);

function compareAsc( a, b ) {
    if ( a.emailCnt < b.emailCnt ){
      return -1;
    }
    if ( a.emailCnt > b.emailCnt ){
      return 1;
    }
    return 0;
  }

function compareDesc( a, b ) {
if ( a.emailCnt < b.emailCnt ){
  return 1;
}
if ( a.emailCnt > b.emailCnt ){
  return -1;
}
return 0;
}

function compareNumAsc( a, b ) {
  if ( a.emailCnt < b.emailCnt ){
    return -1;
  }
  if ( a.emailCnt > b.emailCnt ){
    return 1;
  }
  return 0;
}

function compareNumDesc( a, b ) {
  if ( a.emailCnt < b.emailCnt ){
    return 1;
  }
  if ( a.emailCnt > b.emailCnt ){
    return -1;
  }
  return 0;
}

function compareStrAsc( a, b ) {
  if ( a.emailContact < b.emailContact ){
    return -1;
  }
  if ( a.emailContact > b.emailContact ){
    return 1;
  }
  return 0;
}

function compareStrDesc( a, b ) {
  if ( a.emailContact < b.emailContact ){
    return 1;
  }
  if ( a.emailContact > b.emailContact ){
    return -1;
  }
  return 0;
}

var sortAlphUp = function(){
    data.sort(compareStrAsc);
    cellCnt = 0;
   for(j = data.length; j>0; j--)
    table.deleteRow(j);
    orderData(data);
}

var sortAlphDown = function(){
  data.sort(compareStrDesc);
  cellCnt = 0;
 for(j = data.length; j>0; j--)
  table.deleteRow(j);
  orderData(data);
}

var sortNumUp = function(){
  data.sort(compareNumAsc);
  cellCnt = 0;
 for(j = data.length; j>0; j--)
  table.deleteRow(j);
  orderData(data);
}

var sortNumDown = function(){
data.sort(compareNumDesc);
cellCnt = 0;
for(j = data.length; j>0; j--)
table.deleteRow(j);
orderData(data);
}
