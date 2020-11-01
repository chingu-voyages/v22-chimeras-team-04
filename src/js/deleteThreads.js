import {getEmailProfile} from './gmailConnector';
import Bottleneck from 'bottleneck';
import { isArray } from 'util';

const modalBox = document.querySelector('.modal-box');
const modalInfo = document.querySelector('.modal-trash-info');
const infoText = document.querySelector('.info-text');

const modalError = document.querySelector('.modal-error');
const errorMessage = document.querySelector('.error-message')
const modalLoader = document.querySelector('.modal-loader');

const closeBtn = document.querySelector('.closeBtn')
const btnDelete = document.querySelector('.btn-delete');
const btnTrash = document.querySelector('.btn-trash');
const btnUnTrash = document.querySelector('.btn-untrash');

const closeInfoModal = document.querySelector('.close');
const errorCls = document.querySelector('.errorCls');

modalLoader.style.display = "none";

const popUp = () => {
    modalBox.style.display = "block";
    closeBtn.addEventListener('click', () => {
        modalBox.style.display = "none";
    })
}

const infoPopUp = () => {
    modalBox.style.display = "none";
    modalInfo.style.display = 'block';

    if (!modalLoader.closed) {
        modalLoader.style.display = "none";
    }
    closeInfoModal.addEventListener('click', () => {
        modalInfo.style.display = "none";
    })
    window.addEventListener("click", () => {
        modalInfo.style.display = "none";
    })
}

const errorPopUp = () => {
    modalBox.style.display = "none";
    modalError.style.display = "block";
    errorMessage.innerText = "The operation failed due to error"
    errorCls.addEventListener('click', () => {
        modalError.style.display = "none";
    })
    window.addEventListener("click", () => {
        modalError.style.display = "none";
    })
}


const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1500
})


const batchThreads = () => {
    let batch = gapi.client.newBatch();
    return batch;
}




const unTrash = (threads, row) => {
    for (let i = 0; i < threads.length; i++) {
        untrashById(threads[i]);
       }
    
       row.style.display = "";
}
const listBatches = (threads, action, row) => {
    let start = Date.now();
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
                    Object.values(items).forEach(item => {
                        if (item.status == '204' || item.status == '200') {
                            resolve(item.status)
                        }
                        else {
                            errorPopUp();
                            reject(item.status)
                        }
                    })

                })
            })
        })
        nextPromises.push(promise);
    })


    Promise.allSettled(nextPromises).then(() => {
        if(isArray(row))
        {
            for(let i =0; i< row.length; i++)
            {
                row[i].style.display = "none";
            }
        }

        else{
            row.style.display = "none";

        }
        infoPopUp();
        addMessage(action, threads.length);
        getEmailProfile();
    })
    let end = Date.now();
    let functionTime = end - start;
    if (functionTime > 3) {
        modalLoader.style.display = "flex";
        if (!modalBox.closed) {
            modalBox.style.display = "none";
        }
    }

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

function untrashById(id) {
    gapi.client.gmail.users.threads.untrash({
        'userId': 'me',
        'id': id
    })
.then(function (response) {
      return response.result;
    });
}

function addMessage(action, number) {
    infoText.innerText = `${number} messages  \r\n`;
    // infoText.innerText += `${cells[0].innerText} \r\n`;
    if (action === "delete") {
        infoText.innerText += `were deleted permamently`;
    } else if (action === "trash") {
        infoText.innerText += `were moved to trash`;
    }
}


window.deleteAllAct = function (id, isSelective) {

    let myid = id.replace('p-delete-', '');
    
    if(isSelective){
        myid = id.replace('s-delete-', '')
    }

    let cells = topSendersTbl.rows[myid].cells;
    if(isSelective){
        cells = selectiveTbl.rows[myid].cells;
    }
    let threads = cells[3].innerText.split(',');

    let row = document.getElementById('p-row-' + myid);
    if(isSelective)
    {
        row =  document.getElementById('s-row-' + myid);
    }
    popUp();

    let trashHandler = function(event){
        listBatches(threads, "trash", row);
        btnDelete.removeEventListener('click', deleteHandler,{once:true});
    };

    let deleteHandler = function(event){
        listBatches(threads, "delete", row);
        btnTrash.removeEventListener('click', trashHandler,{once:true});
    }

    let unTrashHandler = function(event){
        unTrash(threads, row);
        btnUnTrash.removeEventListener('click', unTrashHandler,{once:true});
    }
    btnTrash.addEventListener('click', trashHandler, { once: true });
    btnDelete.addEventListener('click', deleteHandler, { once: true });
    btnUnTrash.addEventListener('click', unTrashHandler, { once: true });

}

 function deleteCheckBoxed() {

        let rowsLen = topSendersTbl.rows.length;
        let threads = '';
        let input;
        let cells;
        let cnt = 0;
        let rowsArr = [];
        let row
        for(let i = 1; i<rowsLen; i++)
        {
            input = document.getElementById('c-row-' + i);
            if(input.checked)
            {
                 cells = topSendersTbl.rows[i].cells;
                 if(cnt > 0)
                 {
                     threads += ',';
                 }
                 threads += cells[3].innerText.split(',');
                 cnt++;
                 row = document.getElementById('p-row-' + i);
                 rowsArr.push(row);
            }

        }

       
       listBatches(threads.split(','),'trash',rowsArr);

}

export {deleteCheckBoxed};