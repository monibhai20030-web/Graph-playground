document.addEventListener('DOMContentLoaded', () => {

    // --- DATA STRUCTURE ---
    class Graph {
        // ... (Graph class is unchanged) ...
        constructor() {
            this.vertices = new Map();
            this.edges = [];
            this.vertexCounter = 0; 
        }

        addVertex() {
            const id = String.fromCharCode(65 + this.vertexCounter++);
            const x = Math.random() * (svg.width.baseVal.value - 60) + 30;
            const y = Math.random() * (svg.height.baseVal.value - 60) + 30;
            this.vertices.set(id, { x, y });
            return id;
        }

        removeVertex(id) {
            if (!this.vertices.has(id)) return;
            this.vertices.delete(id);
            this.edges = this.edges.filter(edge => edge.from !== id && edge.to !== id);
        }

        addEdge(from, to) {
            if (!this.vertices.has(from) || !this.vertices.has(to)) {
                alert("Both vertices must exist to add an edge.");
                return;
            }
            const exists = this.edges.some(edge => 
                (edge.from === from && edge.to === to)
            );
            if (!exists) {
                this.edges.push({ from, to });
            }
        }

        removeEdge(from, to) {
            this.edges = this.edges.filter(edge => 
                !(edge.from === from && edge.to === to)
            );
        }

        getAdjacencyList() {
            const list = new Map();
            for (const id of this.vertices.keys()) {
                list.set(id, []);
            }
            for (const edge of this.edges) {
                list.get(edge.from).push(edge.to);
            }
            return list;
        }

        getAdjacencyMatrix() {
            const sortedIds = Array.from(this.vertices.keys()).sort();
            const size = sortedIds.length;
            const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
            
            const indexMap = new Map(sortedIds.map((id, i) => [id, i]));

            for (const edge of this.edges) {
                const fromIndex = indexMap.get(edge.from);
                const toIndex = indexMap.get(edge.to);
                if (fromIndex !== undefined && toIndex !== undefined) {
                    matrix[fromIndex][toIndex] = 1;
                }
            }
            return { matrix, ids: sortedIds };
        }
    }

    // --- DOM REFERENCES (MODIFIED) ---
    const svg = document.getElementById('graph-svg');
    const addVertexBtn = document.getElementById('add-vertex-btn');
    
    // Updated to use select IDs
    const removeVertexBtn = document.getElementById('remove-vertex-btn');
    const removeVertexSelect = document.getElementById('remove-vertex-select');
    
    const addEdgeBtn = document.getElementById('add-edge-btn');
    const addEdgeFromSelect = document.getElementById('add-edge-from-select');
    const addEdgeToSelect = document.getElementById('add-edge-to-select');
    
    const removeEdgeBtn = document.getElementById('remove-edge-btn');
    const removeEdgeFromSelect = document.getElementById('remove-edge-from-select');
    const removeEdgeToSelect = document.getElementById('remove-edge-to-select');
    
    const showListBtn = document.getElementById('show-list-btn');
    const showMatrixBtn = document.getElementById('show-matrix-btn');
    const listView = document.getElementById('list-view');
    const matrixView = document.getElementById('matrix-view');

    // --- INSTANCE ---
    const graph = new Graph();

    // --- RENDER FUNCTIONS ---
    
    // Main render function to update everything
    function renderAll() {
        renderGraph();
        renderAdjacencyList();
        renderAdjacencyMatrix();
        updateVertexSelects(); // <-- NEW: Update dropdowns
    }

    // ... (renderGraph, renderAdjacencyList, renderAdjacencyMatrix are unchanged) ...
    function renderGraph() {
        svg.innerHTML = ''; // Clear SVG
        const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (const edge of graph.edges) {
            const fromVertex = graph.vertices.get(edge.from);
            const toVertex = graph.vertices.get(edge.to);

            if (fromVertex && toVertex) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromVertex.x);
                line.setAttribute('y1', fromVertex.y);
                line.setAttribute('x2', toVertex.x);
                line.setAttribute('y2', toVertex.y);
                line.setAttribute('class', 'edge');
                edgeGroup.appendChild(line);
            }
        }
        svg.appendChild(edgeGroup);

        const vertexGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (const [id, { x, y }] of graph.vertices.entries()) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 15);
            circle.setAttribute('class', 'vertex');
            vertexGroup.appendChild(circle);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', y);
            label.setAttribute('class', 'vertex-label');
            label.textContent = id;
            vertexGroup.appendChild(label);
        }
        svg.appendChild(vertexGroup);
    }

    function renderAdjacencyList() {
        const list = graph.getAdjacencyList();
        if (list.size === 0) {
            listView.innerHTML = "<p>Graph is empty.</p>";
            return;
        }
        let html = "<ul>";
        for (const [id, neighbors] of list.entries()) {
            html += `<li><strong>${id}</strong> → [ ${neighbors.join(', ')} ]</li>`;
        }
        html += "</ul>";
        listView.innerHTML = html;
    }

    function renderAdjacencyMatrix() {
        const { matrix, ids } = graph.getAdjacencyMatrix();
        if (ids.length === 0) {
            matrixView.innerHTML = "<p>Graph is empty.</p>";
            return;
        }
        let html = "<table>";
        html += "<tr><th>&nbsp;</th>";
        for (const id of ids) {
            html += `<th>${id}</th>`;
        }
        html += "</tr>";
        for (let i = 0; i < ids.length; i++) {
            html += `<tr><th>${ids[i]}</th>`;
            for (let j = 0; j < ids.length; j++) {
                html += `<td>${matrix[i][j]}</td>`;
            }
            html += "</tr>";
        }
        html += "</table>";
        matrixView.innerHTML = html;
    }
    
    // --- NEW FUNCTION ---
    // Populates all dropdowns with the current list of vertices
    function updateVertexSelects() {
        const sortedIds = Array.from(graph.vertices.keys()).sort();
        
        // List of all select elements and their default "placeholder" text
        const selectsToUpdate = [
            { el: removeVertexSelect, placeholder: "Select Vertex" },
            { el: addEdgeFromSelect, placeholder: "From Vertex" },
            { el: addEdgeToSelect, placeholder: "To Vertex" },
            { el: removeEdgeFromSelect, placeholder: "From Vertex" },
            { el: removeEdgeToSelect, placeholder: "To Vertex" }
        ];

        for (const item of selectsToUpdate) {
            const selectEl = item.el;
            const currentVal = selectEl.value; // Save current selection
            
            // Clear existing options
            selectEl.innerHTML = ''; 
            
            // Add default placeholder
            const placeholder = document.createElement('option');
            placeholder.value = "";
            placeholder.textContent = item.placeholder;
            placeholder.disabled = true;
            selectEl.appendChild(placeholder);

            // Add all current vertices
            for (const id of sortedIds) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = id;
                selectEl.appendChild(option);
            }
            
            // Try to restore the previous selection
            // If the vertex was deleted, this will just default to the placeholder
            selectEl.value = currentVal; 
            if (selectEl.value === "") {
                // Ensure placeholder is selected if the old value is gone
                selectEl.selectedIndex = 0;
            }
        }
    }

    // --- EVENT LISTENERS (MODIFIED) ---

    // Add Vertex
    addVertexBtn.addEventListener('click', () => {
        graph.addVertex();
        renderAll();
    });

    // Remove Vertex
    removeVertexBtn.addEventListener('click', () => {
        const id = removeVertexSelect.value; // Get value from select
        if (id) {
            graph.removeVertex(id);
            renderAll();
            // No need to clear input, updateVertexSelects will reset
        }
    });

    // Add Edge
    addEdgeBtn.addEventListener('click', () => {
        const from = addEdgeFromSelect.value; // Get value from select
        const to = addEdgeToSelect.value;   // Get value from select
        if (from && to) {
            graph.addEdge(from, to);
            renderAll();
            // Reset dropdowns to placeholder
            addEdgeFromSelect.value = "";
            addEdgeToSelect.value = "";
        }
    });

    // Remove Edge
    removeEdgeBtn.addEventListener('click', () => {
        const from = removeEdgeFromSelect.value; // Get value from select
        const to = removeEdgeToSelect.value;   // Get value from select
        if (from && to) {
            graph.removeEdge(from, to);
            renderAll();
            // Reset dropdowns to placeholder
            removeEdgeFromSelect.value = "";
            removeEdgeToSelect.value = "";
        }
    });

    // View Toggling (Unchanged)
    showListBtn.addEventListener('click', () => {
        listView.classList.remove('hidden');
        matrixView.classList.add('hidden');
        showListBtn.classList.add('active');
        showMatrixBtn.classList.remove('active');
    });

    showMatrixBtn.addEventListener('click', () => {
        matrixView.classList.remove('hidden');
        listView.classList.add('hidden');
        showMatrixBtn.classList.add('active');
        showListBtn.classList.remove('active');
    });

    // Initial render
    renderAll();
});