
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
async function callTreapApi(endpoint, payload = {}) {
    try {
        const response = await fetch(`api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();

        if (result.success) {
            // 如果後端有回傳 steps 陣列，就丟進播放器
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                playSteps(result.data);
            }
            return result;
        } else {
            console.error(`API Error (${endpoint}):`, result);
            alert("操作失敗: " + (result.message || "請檢查主控台"));
            document.getElementById("status").innerText = "error";
            return null;
        }
    } catch (error) {
        console.error("Fetch Exception:", error);
        document.getElementById("status").innerText = "network error";
        alert("網路連線錯誤，請確認後端是否已啟動。");
        return null;
    }
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
    if (type === 'insert') {
        // 依照規範傳入 pos, id, val (這裡 pos 預設為 0，可依專案需求調整)
        await callTreapApi('treap_insert', { pos: 0, id: `n_${val}_${Date.now()}`, val: val });
    } else if (type === 'remove') {
        await callTreapApi('treap_remove', { pos: val });
    }

    //const mockSteps = [
        //可以testdata
    //];

    //playSteps(mockSteps);
}



async function handleQuery() {
    const L = parseInt(document.getElementById("range-l").value);
    const R = parseInt(document.getElementById("range-r").value);

    if (isNaN(L) || isNaN(R)) return alert("請輸入完整區間");

    hideInput();
    document.getElementById("status").innerText = `running...`;

    //這裡要接後端 接收steps陣列
    await callTreapApi('treap_query', { l: L, r: R });

    //const mockSteps = [
        //可以testdata
    //];
    //playSteps(mockSteps);


    
}

