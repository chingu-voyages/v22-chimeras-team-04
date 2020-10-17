let checkboxSelect = document.getElementById("checkBoxSelect");
let selectAll = document.getElementById("selectAll");
let selectNone = document.getElementById("selectNone");
let topSendersTbl = document.getElementById("topSendersTbl");

let openSelectListHandler = function(event){
    let selectOpts = document.querySelector('.selectOptsPopUp');
    selectOpts.style.display = "inline-block";


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
}

checkboxSelect.addEventListener('click', openSelectListHandler, { once: true });
selectAll.addEventListener('click', selectAllHandler, { once: true });
selectAll.addEventListener('click', selectNoneHandler, { once: true });



