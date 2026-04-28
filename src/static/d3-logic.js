const margin = { top: 40, right: 20, bottom: 40, left: 20 };
const container = document.getElementById("tree-container");


const svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", `translate(0, ${margin.top})`);

function updateTreap(treeData) {
    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;
    

    svg.selectAll("*").remove();

    if (!treeData) return;


    let realRootData = treeData;
    if (treeData.isVirtual && treeData.children && treeData.children.length > 0) {
        realRootData = treeData.children[0];
    }

 
    const root = d3.hierarchy(realRootData, d => {
        const kids = [];
        if (d.left && !d.left.isEmpty) kids.push(d.left);
        if (d.right && !d.right.isEmpty) kids.push(d.right);
        return kids;
    });


    const treeLayout = d3.tree().size([
        fullWidth - margin.left - margin.right, 
        fullHeight - margin.top - margin.bottom
    ]);
    treeLayout(root);


    svg.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#e0e0e0") 
        .attr("stroke-width", 1.5)
        .attr("d", d3.linkVertical()
            .x(d => d.x + margin.left)
            .y(d => d.y)
        );


    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x + margin.left},${d.y})`);


    node.append("circle")
        .attr("r", 28) 
        .attr("fill", "#fff")
        .attr("stroke", d => d.data.highlight1 ? "#ff7675" : "#74b9ff")
        .attr("stroke-width", 2);


    node.append("text")
        .attr("dy", "-0.8em")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text(d => `Val: ${d.data.val}`);


    node.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "900")
        .text(d => d.data.val);


    node.append("text")
        .attr("dy", "-1.8em")
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .attr("fill", "#636e72")
        .text(d => d.data.priority ? `H: ${Number(d.data.priority).toFixed(2)}` : "");

    node.append("text")
        .attr("dy", "1.8em")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .attr("fill", "#d63031") 
        .text(d => d.data.range_max !== undefined ? `Max: ${d.data.range_max}` : "");
}
