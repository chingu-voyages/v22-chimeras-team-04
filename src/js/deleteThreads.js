import { getData, getDataSubjects } from './topTable';

const modalBox = document.querySelector('.modal-box');
const modalInfo = document.querySelector('.modal-trash-info');
const infoText = document.querySelector('.info-text');

const closeBtn = document.querySelector('.closeBtn')
const btnDelete = document.querySelector('.btn-delete');
const btnTrash = document.querySelector('.btn-trash');
const closeInfoModal = document.querySelector('.close');


modalBox.style.display = "none";
modalInfo.style.display = 'none';

const popUp = () => {
    modalBox.style.display = "block";
    closeBtn.addEventListener('click', () => {
        modalBox.style.display = "none";
    })
}

const infoPopUp = () => {
    modalBox.style.display = "none";
    modalInfo.style.display = 'block';
    closeInfoModal.addEventListener('click', () => {
        modalInfo.style.display = "none";
    })
}


window.deleteAllAct = function (id) {
    let myid = id.replace('delete-', '');
    let cells = topSendersTbl.rows[myid].cells;
    let threads = cells[2].innerText.split(',');
    console.log(myid)

    let row = document.getElementById('row-' + myid);
    console.log(row)

    popUp();

    btnTrash.addEventListener('click', function toTrash() {
        console.log(threads)
        for (let thread of threads) {
            gapi.client.gmail.users.threads.trash({ 'userId': 'me', 'id': thread })
                .then(function (response) {
                    console.log(`Message from ${cells[0].innerText} moved to trash`)
                    console.log(`Row ${row.id}`)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
        infoPopUp();
        infoText.innerText = `${threads.length} messages from  \r\n`;;
        infoText.innerText += `${cells[0].innerText} \r\n`;
        infoText.innerText += `were moved to trash`;
        row.style.display = "none";
        threads = [];
    });

    btnDelete.addEventListener('click', function deleteEmails() {
        console.log(threads)
        for (let thread of threads) {
            gapi.client.gmail.users.threads.delete({ 'userId': 'me', 'id': thread })
                .then(function (response) {
                    console.log(response)
                    console.log(`Message from  ${cells[0].innerText} was deleted permamently`)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
        infoPopUp();
        infoText.innerText = `${threads.length} messages from \r\n`;;
        infoText.innerText += `${cells[0].innerText} \r\n`;
        infoText.innerText += `were deleted permamently`;
        row.style.display = "none";
        threads = [];
    });


}




