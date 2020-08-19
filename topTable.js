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

function genericCmp(a,b){
  if(a < b){
    return 1;
  }
  if ( a > b ){
    return -1;
  }
  return 0;
}

function compareNumAsc( a, b ) {
  return genericCmp(b.emailCnt,a.emailCnt)

}

function compareNumDesc( a, b ) {
  return genericCmp(a.emailCnt,b.emailCnt)
}

function compareStrAsc( a, b ) {
  return genericCmp(b.emailContact,a.emailContact)
}

function compareStrDesc( a, b ) {
  return genericCmp(a.emailContact,b.emailContact)
}

function genericSort(cmpF){
  data.sort(cmpF);
  cellCnt = 0;
  for(j = data.length; j>0; j--)
  table.deleteRow(j);
  orderData(data);
}

var sortAlphUp = function(){
    genericSort(compareStrAsc);
}

var sortAlphDown = function(){
  genericSort(compareStrDesc);
}

var sortNumUp = function(){
  genericSort(compareNumAsc);
}

var sortNumDown = function(){
  genericSort(compareNumDesc);
}

