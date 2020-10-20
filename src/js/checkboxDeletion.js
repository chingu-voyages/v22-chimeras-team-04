import { brotliDecompressSync } from "zlib";

let checkboxSelect = document.getElementById("checkBoxSelect");
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

let selectAllHandler = function(event){
    let length = topSendersTbl.rows.length;
    let row = null;
    let inputCheck = null;
    for(let i = 0; i < length ; i++)
    {
        inputCheck = topSendersTbl.rows[i].cells[0].children[0];
        inputCheck.setAttribute('checked','');
    }

    event.stopPropagation();

}


let selectNoneHandler = function(event){
    let length = topSendersTbl.rows.length;
    let row = null;
    let inputCheck = null;
    for(let i = 0; i < length ; i++)
    {
        inputCheck = topSendersTbl.rows[i].cells[0].children[0];
        inputCheck.removeAttribute('checked');
    }

    event.stopPropagation();

}

let hideSelectPopup = function(event){
    let selectOpts = document.querySelector('.selectOptsPopUp');
    selectOpts.style.display = "none";
}


checkboxSelect.addEventListener('click', openSelectListHandler);
selectAll.addEventListener('click', selectAllHandler);
selectNone.addEventListener('click', selectNoneHandler);




