
import {
    deleteCheckBoxed
} from './deleteThreads';
let checkboxSelect = document.getElementById("checkBoxSelect");
let selectiveCheckboxSelect = document.getElementById("s-checkBoxSelect");

let checkboxMain = document.getElementById("checkboxMain");
let s_checkboxMain = document.getElementById("s-checkboxMain");

let selectAll = document.getElementById("selectAll");
let selectNone = document.getElementById("selectNone");

let s_selectAll = document.getElementById("s-selectAll");
let s_selectNone = document.getElementById("s-selectNone");

let topSendersTbl = document.getElementById("topSendersTbl");
let selectiveTbl = document.getElementById("selectiveTbl");

let tablePageBody = document.getElementById("tablePageBody");


let openSelectListHandler = function (event) {
    let selectOpts = document.querySelector('.selectOptsPopUp');

    if (event.currentTarget.isSelective) {
        selectOpts = document.querySelector('.s-selectOptsPopUp');
    }

    selectOpts.style.display = "inline-block";
    event.stopPropagation();
    tablePageBody.addEventListener('click', hideSelectPopup, {
        once: true
    });
}

let checkboxMainHandler = function (event) {
   if (event.currentTarget.isSelective) {
        if (s_checkboxMain.checked) {
            selectAllCheckbox(true);
        } else {
            deselectAllCheckbox(true);
        }
    } else {
        if (checkboxMain.checked) {
            selectAllCheckbox(false);
        } else {
            deselectAllCheckbox(false);
        }
    }
}



let selectAllCheckbox = function (isSelective) {

    let length = topSendersTbl.rows.length;

    if(isSelective)
    {
        length = selectiveTbl.rows.length;
    }
    let row = null;
    let inputCheck = null;
    let trashIcon = document.getElementById('trashIcon');
    
    if(isSelective)
    {
        trashIcon = document.getElementById('s-trashIcon');
    }
    let style = window.getComputedStyle(trashIcon);
    if (style.display == 'none') {
        trashIcon.style.display = "block";
    }

    if(isSelective)
    {
        for (let i = 0; i < length; i++) {
            inputCheck = selectiveTbl.rows[i].cells[0].children[0];
            inputCheck.checked = true;
        }
    }

    else{
        for (let i = 0; i < length; i++) {
            inputCheck = topSendersTbl.rows[i].cells[0].children[0];
            inputCheck.checked = true;
        }
    }

}

let deselectAllCheckbox = function (isSelective) {
    let length = topSendersTbl.rows.length;

    if(isSelective)
    {
         length = selectiveTbl.rows.length;
    }
    let row = null;
    let inputCheck = null;


    let trashIcon = document.getElementById('trashIcon');

    if(isSelective)
    {
        trashIcon = document.getElementById('s-trashIcon');
    }

    let style = window.getComputedStyle(trashIcon);
    if (style.display == 'block') {
        trashIcon.style.display = "none";
    }

    if(isSelective)
    {
        for (let i = 0; i < length; i++) {
            inputCheck = selectiveTbl.rows[i].cells[0].children[0];
            inputCheck.checked = false;
        }
    }

    else{
        for (let i = 0; i < length; i++) {
            inputCheck = topSendersTbl.rows[i].cells[0].children[0];
            inputCheck.checked = false;
        }
    }


}

let selectAllHandler = function (event) {
    selectAllCheckbox(false);
    event.stopPropagation();
}


let selectNoneHandler = function (event) {
    deselectAllCheckbox(false);
    event.stopPropagation();
}

let s_selectAllHandler = function (event) {
    selectAllCheckbox(true);
    event.stopPropagation();
}


let s_selectNoneHandler = function (event) {
    deselectAllCheckbox(true);
    event.stopPropagation();
}

let hideSelectPopup = function (event) {
    let selectOpts = document.querySelector('.selectOptsPopUp');
    let s_selectOpts = document.querySelector('.s-selectOptsPopUp');

    selectOpts.style.display = "none";
    s_selectOpts.style.display = "none";

}

let showTrashIcon = function (event) {
    if (event.currentTarget.checked) {

        let trashIcon = document.getElementById('trashIcon');
        if(event.currentTarget.isSelective){
            trashIcon = document.getElementById('s-trashIcon');
        }

        
        let style = window.getComputedStyle(trashIcon);
        if (style.display == 'none') {
            trashIcon.style.display = "block";
        }
    } else {
        let inputRow;
        let isAllFalse = true;
        if(event.currentTarget.isSelective){
            let length = selectiveTbl.rows.length;

            let mainRow = document.getElementById('s-checkboxMain');
            mainRow.checked = false;

            for (let i = 1; i < length; i++) {
                inputRow = document.getElementById('s-c-row-' + i);
                if (inputRow.checked) {
                    return;
                }
            }

             
        if (isAllFalse) {
            let trashIcon = document.getElementById('s-trashIcon');
            let style = window.getComputedStyle(trashIcon);
            if (style.display == 'block') {
                trashIcon.style.display = "none";
            }
        }
        }

        else{
            let length = topSendersTbl.rows.length;

        let mainRow = document.getElementById('checkboxMain');
        mainRow.checked = false;



        for (let i = 1; i < length; i++) {
            inputRow = document.getElementById('c-row-' + i);
            if (inputRow.checked) {
                return;
            }
        }
    
        if (isAllFalse) {
            let trashIcon = document.getElementById('trashIcon');
            let style = window.getComputedStyle(trashIcon);
            if (style.display == 'block') {
                trashIcon.style.display = "none";
            }
        }
    }
    }

}
let deleteChecked = function (event) {
    deleteCheckBoxed(event.currentTarget.isSelective);
}
let initEventListeners = function () {
    checkboxMain.addEventListener('change', checkboxMainHandler);
    checkboxMain.isSelective = false;
    s_checkboxMain.addEventListener('change', checkboxMainHandler);
    s_checkboxMain.isSelective = true;

    checkboxSelect.addEventListener('click', openSelectListHandler);
    checkboxSelect.isSelective = false;


    selectiveCheckboxSelect.addEventListener('click', openSelectListHandler);
    selectiveCheckboxSelect.isSelective = true;

    selectAll.addEventListener('click', selectAllHandler);
    selectNone.addEventListener('click', selectNoneHandler);

    s_selectAll.addEventListener('click', s_selectAllHandler);
    s_selectNone.addEventListener('click', s_selectNoneHandler);

    let trashIcon = document.getElementById('trashIcon');
    trashIcon.addEventListener('click', deleteChecked);

    let s_trashIcon = document.getElementById('s-trashIcon');
    s_trashIcon.addEventListener('click', deleteChecked);
    s_trashIcon.isSelective =true;

    let length = topSendersTbl.rows.length;
    let inputRow;
    for (let i = 1; i < length; i++) {
        inputRow = document.getElementById('c-row-' + i);
        inputRow.addEventListener('change', showTrashIcon);
        inputRow.isSelective = false; 
         //TODO: verify that all those listeners are cleared once the table is refreshed   
    }



}

export {
    initEventListeners,
    showTrashIcon
};