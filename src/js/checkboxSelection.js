

let checkboxSelect = document.getElementById("checkBoxSelect");

let checkboxMain = document.getElementById("checkboxMain");

let selectAll = document.getElementById("selectAll");
let selectNone = document.getElementById("selectNone");
let topSendersTbl = document.getElementById("topSendersTbl");
let tablePageBody = document.getElementById("tablePageBody");

let openSelectListHandler = function(event){
    let selectOpts = document.querySelector('.selectOptsPopUp');
    selectOpts.style.display = "inline-block";
    event.stopPropagation();
    tablePageBody.addEventListener('click', hideSelectPopup, {once:true});
}

let checkboxMainHandler = function(event){
    if(checkboxMain.checked)
    {
        selectAllCheckbox();
    }

    else{
        deselectAllCheckbox();
    }
}

let selectAllCheckbox = function(){
    let length = topSendersTbl.rows.length;
    let row = null;
    let inputCheck = null;
    for(let i = 0; i < length ; i++)
    {
        inputCheck = topSendersTbl.rows[i].cells[0].children[0];
        inputCheck.checked = true;
        
    }
}

let deselectAllCheckbox = function(){
    let length = topSendersTbl.rows.length;
    let row = null;
    let inputCheck = null;
    for(let i = 0; i < length ; i++)
    {
        inputCheck = topSendersTbl.rows[i].cells[0].children[0];
        inputCheck.checked = false;
        
    }

}

let selectAllHandler = function(event){
    
    selectAllCheckbox();
    event.stopPropagation();

}


let selectNoneHandler = function(event){
    deselectAllCheckbox();
    event.stopPropagation();

}

let hideSelectPopup = function(event){
    let selectOpts = document.querySelector('.selectOptsPopUp');
    selectOpts.style.display = "none";
}

checkboxMain.addEventListener('change', checkboxMainHandler);
checkboxSelect.addEventListener('click', openSelectListHandler);
selectAll.addEventListener('click', selectAllHandler);
selectNone.addEventListener('click', selectNoneHandler);




