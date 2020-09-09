import { getData, getDataSubjects } from './topTable';
import Bottleneck from 'bottleneck';

const modalBox = document.querySelector('.modal-box');
const modalInfo = document.querySelector('.modal-trash-info');
const infoText = document.querySelector('.info-text');

const modalError = document.querySelector('.modal-error');
const errorMessage = document.querySelector('.error-message')

const closeBtn = document.querySelector('.closeBtn')
const btnDelete = document.querySelector('.btn-delete');
const btnTrash = document.querySelector('.btn-trash');
const closeInfoModal = document.querySelector('.close');
const errorCls = document.querySelector('.errorCls')


modalBox.style.display = "none";
modalInfo.style.display = 'none';
modalError.style.display = "none";

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

const errorPopUp = () => {
    modalBox.style.display = "none";
    modalError.style.display = "block";
    errorCls.addEventListener('click', () => {
        modalError.style.display = "none";
    })
}
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 50
})

let threadsInBatches = [];

const batchThreads = () => {
    let batch = gapi.client.newBatch();
    threadsInBatches.push(batch);
    return batch
}

const listBatches = (threads, action, row) => {
    console.log(threads)
    let allThreads = [];
    let batch = batchThreads();
    let threadsBatches = []

    for (let i = 0; i < threads.length; i++) {
        let val = "";
        if (action === "delete") {
            val = deleteById(threads[i])
        } else if (action === "trash") {
            val = trashById(threads[i])
        }

        batch.add(val);

        if ((i + 1) % 100 == 0) {
            threadsBatches.push(batch);
            batch = batchThreads();
        }
    }

    threadsBatches.push(batch);
    let nextPromises = [];
    threadsBatches.forEach(batch => {
        let promise = new Promise(function (resolve, reject) {
            limiter.schedule(() => {
                batch.then(function (resp) {
                    let items = resp.result
                    console.log(items)
                    Object.values(items).forEach(item => {
                        if (item.result.error) {
                            reject(item.result.error)
                        } else {
                            let threadItem = item.result.id
                            allThreads.push(threadItem)
                            resolve(threadItem)
                        }
                    })

                })
            })
        })
        nextPromises.push(promise);
    })


    Promise.allSettled(nextPromises).then(() => {

        row.style.display = "none";
        infoPopUp();
        // threads.length = 0;
    })
}

function deleteById(id) {
    return gapi.client.gmail.users.threads.delete({
        'userId': 'me',
        'id': id
    })
}

function trashById(id) {
    return gapi.client.gmail.users.threads.trash({
        'userId': 'me',
        'id': id
    })
}

window.deleteAllAct = function (id) {
    let myid = id.replace('delete-', '');
    let cells = topSendersTbl.rows[myid].cells;
    let threads = cells[2].innerText.split(',');
    console.log(threads.length)
    console.log(myid)

    let row = document.getElementById('row-' + myid);
    console.log(row)

    popUp();

    const addMessage = (action, number) => {
        infoText.innerText = `${number} messages from \r\n`;
        infoText.innerText += `${cells[0].innerText} \r\n`;
        if (action === "delete") {
            infoText.innerText += `were deleted permamently`;
        } else if (action === "trash") {
            infoText.innerText += `were moved to trash`;
        }
    }

    btnTrash.addEventListener('click', function toTrash() {
        listBatches(threads, "trash", row);
        addMessage("trash", threads.length);

    });

    btnDelete.addEventListener('click', function deleteEmails() {
        listBatches(threads, "delete", row);
        addMessage("delete", threads.length);
        // threads.length = 0;
    });
}
