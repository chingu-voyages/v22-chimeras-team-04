
import {deleteCheckBoxed} from './deleteThreads';
let checkboxSelect = document.getElementById("checkBoxSelect");
let selectiveCheckboxSelect = document.getElementById("s-checkBoxSelect");

let checkboxMain = document.getElementById("checkboxMain");

let selectAll = document.getElementById("selectAll");
let selectNone = document.getElementById("selectNone");
let topSendersTbl = document.getElementById("topSendersTbl");
let selectiveTbl = document.getElementById("selectiveTbl");

let tablePageBody = document.getElementById("tablePageBody");


let openSelectListHandler = function(event){
    let selectOpts = document.querySelector('.selectOptsPopUp');

    if(event.currentTarget.isSelective)
    {
         selectOpts = document.querySelector('.s-selectOptsPopUp');
    }

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
    let trashIcon = document.getElementById('trashIcon');
    let style = window.getComputedStyle(trashIcon);   
    if(style.display=='none')
    {
        trashIcon.style.display = "block";
    }
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

    let trashIcon = document.getElementById('trashIcon');
    let style = window.getComputedStyle(trashIcon);   
    if(style.display=='block')
    {
        trashIcon.style.display = "none";
    }

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

let showTrashIcon = function(event)
{
    if(event.currentTarget.checked)
    {
        let trashIcon = document.getElementById('trashIcon');
        let style = window.getComputedStyle(trashIcon);   
        if(style.display=='none')
        {
            trashIcon.style.display = "block";
        }
    }

    else {
        let inputRow;
        let isAllFalse = true;
        let length = topSendersTbl.rows.length;

        for(let i = 1; i < length ; i++)
        {
            inputRow = document.getElementById('c-row-' + i);
            if(inputRow.checked)
            {
                return;
            }
        }

        if(isAllFalse){
            let trashIcon = document.getElementById('trashIcon');
            let style = window.getComputedStyle(trashIcon);   
            if(style.display=='block')
            {
                trashIcon.style.display = "none";
            }
        }
    }

}
let deleteChecked = function(){
    deleteCheckBoxed();
}
let initEventListeners = function()
{
    checkboxMain.addEventListener('change', checkboxMainHandler);

    checkboxSelect.addEventListener('click', openSelectListHandler);
    checkboxSelect.isSelective = false;


    selectiveCheckboxSelect.addEventListener('click', openSelectListHandler);
    selectiveCheckboxSelect.isSelective = true;

    selectAll.addEventListener('click', selectAllHandler);
    selectNone.addEventListener('click', selectNoneHandler);
    let trashIcon = document.getElementById('trashIcon');
    trashIcon.addEventListener('click',deleteChecked);

    let length = topSendersTbl.rows.length;
    let inputRow ;
    for(let i = 1; i < length ; i++)
    {
        inputRow = document.getElementById('c-row-' + i);
        inputRow.addEventListener('change', showTrashIcon);  //TODO: verify that all those listeners are cleared once the table is refreshed   
    }

}

export { initEventListeners };







