import { getData, getDataSubjects } from './topTable';

const modalBox = document.querySelector('.modal-box');
const modalInfo = document.querySelector('.modal-trash-info');
const infoText = document.querySelector('.info-text');
modalBox.style.display = "none";
modalInfo.style.display = 'none';
const closeBtn = document.querySelector('.closeBtn')
const btnDelete = document.querySelector('.btn-delete');
const btnTrash = document.querySelector('.btn-trash');
const closeInfoModal = document.querySelector('.close');

const popUp = () => {
    modalBox.style.display = "block";
    closeBtn.addEventListener('click', () => {
        modalBox.style.display = "none";
    })
}

const infoPopUp = () => {
    modalInfo.style.display = 'block';
    closeInfoModal.addEventListener('click', () => {
        modalInfo.style.display = "none";
    })
}


window.deleteAllAct = function (id) {
    let myid = id.replace('delete-', '');
    let cells = topSendersTbl.rows[myid].cells;
    let threads = cells[2].innerText.split(',');
    console.log(cells)
    let deleteAllBtn = document.getElementById('delete-' + myid)
    console.log(deleteAllBtn)
    popUp();
    btnTrash.addEventListener('click', function toTrash() {
        for (let thread of threads) {
            console.log(thread)
            gapi.client.gmail.users.threads.trash({ 'userId': 'me', 'id': thread })
                .then(function (response) {
                    console.log(`Message moved to trash`)
                })
                .catch(function (error) {
                    console.log("There is an error")
                })
        }
        console.log(`Messages from ${cells[0].innerText} were moved to trash`)
        modalBox.style.display = "none";
        infoPopUp();
        infoText.innerText = `Messages from ${cells[0].innerText} were moved to trash`;
    });

    btnDelete.addEventListener('click', function deleteEmails() {

        for (let thread of threads) {
            console.log(thread)
            gapi.client.gmail.users.threads.delete({ 'userId': 'me', 'id': thread })
                .then(function (response) {
                    console.log(`Message from ${cells[0].innerText} was deleted permamently`)
                })
                .catch(function (error) {
                    console.log("There is an error")
                })
        }
        console.log(`Messages from ${cells[0].innerText} were deleted permamently`)
        modalBox.style.display = "none";
        infoPopUp();
        infoText.innerText = `Messages from ${cells[0].innerText} were deleted permamently`;
    });

}




