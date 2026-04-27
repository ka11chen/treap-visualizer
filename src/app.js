let actionQueue = [];      
let currentStepIdx = -1;   
let isPlaying = false;     
let autoPlayTimer = null;  
let animationSpeed = 1000; 

window.onload = async () => {
    document.getElementById("node-value").value = "10";
    document.getElementById("seed-input").value = "67"; 
    updateSpeed();
    await loadInitialArray();
};

async function loadInitialArray() {

    const initNodes = [
        { id: "n4", val: 4 },
        { id: "n8", val: 8 },
        { id: "n7", val: 7 }
    ];
    
    document.getElementById("status").innerText = "Building...";
    const res = await callTreapApi('treap_build', { nodes: initNodes });
    
    if (res && res.success && res.data.length > 0) {
        const lastFrame = res.data[res.data.length - 1];
        updateTreap(lastFrame.data);
        document.getElementById("status").innerText = "Completed";
    }
    updateButtonStates();
}

function playSteps(steps) {
    actionQueue = steps;
    currentStepIdx = 0;
    updateFrame();
    if (isPlaying) startAutoPlay();
}

function togglePlay() {
    const btn = document.getElementById("play-pause-btn");
    if (isPlaying) {
        isPlaying = false;
        btn.innerText = "Play";
        btn.style.backgroundColor = "#2ecc71";
        clearTimeout(autoPlayTimer);
    } else {
        isPlaying = true;
        btn.innerText = "Pause";
        btn.style.backgroundColor = "#e67e22";
        startAutoPlay();
    }
}

function startAutoPlay() {
    if (!isPlaying) return;
    if (currentStepIdx < actionQueue.length - 1) {
        autoPlayTimer = setTimeout(() => {
            stepNext();
            startAutoPlay();
        }, animationSpeed);
    } else {
        isPlaying = false;
        const btn = document.getElementById("play-pause-btn");
        btn.innerText = "Play";
        btn.style.backgroundColor = "#2ecc71";
    }
}

function stepNext() {
    if (currentStepIdx < actionQueue.length - 1) {
        currentStepIdx++;
        updateFrame();
    }
}

function stepBack() {
    if (currentStepIdx > 0) {
        currentStepIdx--;
        updateFrame();
    }
}

function updateFrame() {
    if (currentStepIdx >= 0 && currentStepIdx < actionQueue.length) {
        const frame = actionQueue[currentStepIdx];
        document.getElementById("status").innerText = frame.name || "Running";
        if (typeof updateTreap === "function") updateTreap(frame.data);
        updateButtonStates();
    }
}


async function callTreapApi(endpoint, payload = {}) {

    const method = (endpoint === 'find_worst_seed') ? 'GET' : 'POST';
    const config = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    if (method === 'POST') {
        config.body = JSON.stringify(payload);
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/${endpoint}`, config);
        const result = await response.json();

        if (result.success) {
            if (result.data && Array.isArray(result.data)) {
                playSteps(result.data);
            }
            return result;
        } else {
            console.error("API Error:", result.data);
            return null;
        }
    } catch (error) {
        console.error("Network Error:", error);
        return null;
    }
}


async function handleAction(type) {
    const val = parseInt(document.getElementById("node-value").value);
    if (isNaN(val)) return;
    hideInput();

    if (type === 'insert') {

        await callTreapApi('treap_insert', { 
            pos: 0, 
            id: `n${val}_${Date.now()}`, 
            val: val 
        });
    } else if (type === 'remove') {
        await callTreapApi('treap_remove', { pos: val });
    }
}

async function handleQuery() {
    const L = parseInt(document.getElementById("range-l").value);
    const R = parseInt(document.getElementById("range-r").value);
    if (isNaN(L) || isNaN(R)) return;
    hideInput();
    await callTreapApi('treap_query', { l: L, r: R });
}

async function handleSetSeed() {
    const seedVal = document.getElementById("seed-input").value;
    await callTreapApi('set_seed', { seed: seedVal });

    alert("Seed 已經設定為 " + seedVal);
}

async function handleWorstSeed() {

    const result = await callTreapApi('find_worst_seed');
    if (result && result.success) {
        document.getElementById("seed-input").value = result.data;
    }
}

async function handleClear() {
    if (!confirm("確定要重置嗎？")) return;
    location.reload(); 
}

function updateButtonStates() {
    const hasNodes = document.querySelectorAll('.node').length > 0;
    //const seedBtn = document.getElementById("set-seed-btn");
    //const worstBtn = document.getElementById("worst-seed-btn");
    if (seedBtn) seedBtn.disabled = hasNodes;
    if (worstBtn) worstBtn.disabled = hasNodes;
}

function updateSpeed() {
    animationSpeed = 2200 - parseInt(document.getElementById("speed-slider").value);
}

function showInput(type) {
    const overlay = document.getElementById("input-overlay");
    overlay.classList.remove("hidden");
    const isQuery = (type === 'query');
    document.getElementById("input-title").innerText = isQuery ? "Range Query" : (type === 'insert' ? "Insert Value" : "Remove Pos");
    document.getElementById("single-input-group").classList.toggle("hidden", isQuery);
    document.getElementById("range-input-group").classList.toggle("hidden", !isQuery);
    document.getElementById("confirm-btn").onclick = () => isQuery ? handleQuery() : handleAction(type);
}

function hideInput() {
    document.getElementById("input-overlay").classList.add("hidden");
}

