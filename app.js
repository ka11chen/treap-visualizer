
let actionQueue = [];
let isPlaying = false;

function playSteps(steps) { 
    actionQueue = [...actionQueue, ...steps];
    if (!isPlaying) processQueue();
}

function processQueue() {
    if (actionQueue.length === 0) {
        isPlaying = false;
        document.getElementById("status").innerText = "ready";
        return;
    }
    isPlaying = true;
    const nextTreap = actionQueue.shift();
    updateTreap(nextTreap);     
    setTimeout(processQueue, 1000);
}


function showInput(type) {
    const overlay = document.getElementById("input-overlay");
    const singleGroup = document.getElementById("single-input-group");
    const rangeGroup = document.getElementById("range-input-group");
    const confirmBtn = document.getElementById("confirm-btn");
    const title = document.getElementById("input-title");

    overlay.classList.remove("hidden");

    if (type === 'query') {
        title.innerText = "range[L, R]";
        singleGroup.classList.add("hidden");
        rangeGroup.classList.remove("hidden");
        confirmBtn.onclick = () => handleQuery(); 
    } else {
        title.innerText = (type === 'insert' ? "insert" : "remove");
        singleGroup.classList.remove("hidden");
        rangeGroup.classList.add("hidden");
        confirmBtn.onclick = () => handleAction(type);
    }
}


function hideInput() {
    document.getElementById("input-overlay").classList.add("hidden");


    document.getElementById("node-value").value = "";
    document.getElementById("range-l").value = "";
    document.getElementById("range-r").value = "";
}


async function handleAction(type) {
    const val = parseInt(document.getElementById("node-value").value);
    if (isNaN(val)) return alert("請輸入index");

    hideInput();
    document.getElementById("status").innerText = `running...`;

    //這裡要接後端 接收steps陣列

    const mockSteps = [
        //可以testdata
    ];

    playSteps(mockSteps);
}



async function handleQuery() {
    const L = parseInt(document.getElementById("range-l").value);
    const R = parseInt(document.getElementById("range-r").value);

    if (isNaN(L) || isNaN(R)) return alert("請輸入完整區間");

    hideInput();
    document.getElementById("status").innerText = `running...`;

    //這裡要接後端 接收steps陣列

    const mockSteps = [
        //可以testdata
    ];
    playSteps(mockSteps);


    
}

