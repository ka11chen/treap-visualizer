const svg = d3.select("#canvas");
const linkGroup = svg.append("g").attr("class", "links-group");
const nodeGroup = svg.append("g").attr("class", "nodes-group");


const rootYOffset = -10;
const mainTransform = `translate(${window.innerWidth / 2}, ${rootYOffset})`;
linkGroup.attr("transform", mainTransform);
nodeGroup.attr("transform", mainTransform);

function updateTreap(data) {
    if (!data) return;

    
    const root = d3.hierarchy(data, d => {
        if (d.isVirtual) return d.children;
        if (d.left || d.right) {
            return [d.left, d.right].filter(c => c);
        }
        return null;
    });

    
    const treeLayout = d3.tree().nodeSize([140, 120]); 
    treeLayout(root);

    const links = linkGroup.selectAll(".link")
        .data(
            root.links().filter(d => 
                !d.source.data.isVirtual && 
                !d.target.data.isEmpty      
            ), 
            d => d.target.data.node_id
        );

    links.exit().remove();
    
    const linkEnter = links.enter().append("path")
        .attr("class", "link");

    links.merge(linkEnter)
        .transition().duration(750)
        .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y));

    
    const nodes = nodeGroup.selectAll(".node")
        .data(
            root.descendants().filter(d => 
                !d.data.isVirtual && 
                !d.data.isEmpty      
            ), 
            d => d.data.node_id
        );

    nodes.exit().remove();

    const nodeEnter = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    
    nodeEnter.append("circle").attr("r", 45);

    
    nodeEnter.append("text").attr("class", "ids").attr("dy", -18)
        .text(d => `T-ID: ${d.data.tree_id}`);

    
    nodeEnter.append("text").attr("class", "ids").attr("dy", -5)
        .text(d => `H-ID: ${d.data.priority ? d.data.priority.toFixed(2) : "0.00"}`);

    
    nodeEnter.append("text").attr("class", "val").attr("dy", 12)
        .text(d => d.data.val);

    
    nodeEnter.append("text").attr("class", "rmax").attr("dy", 32)
        .text(d => `Max: ${d.data.range_max || d.data.val}`);

    
    const nodeUpdate = nodes.merge(nodeEnter);
    nodeUpdate.transition().duration(750)
        .attr("transform", d => `translate(${d.x},${d.y})`);

    
    nodeUpdate.classed("highlighted", d => d.data.highlight === true);
}