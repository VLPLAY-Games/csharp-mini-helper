// graph.js
function showKnowledgeGraph() {
    document.getElementById("mainScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
    document.getElementById("glossaryScreen").classList.add("hidden");
    document.getElementById("graphScreen").classList.remove("hidden");
    document.getElementById("title").classList.add("hidden");
    document.getElementById("theorySection").style.display = "none";
    document.getElementById("examplesSection").style.display = "none";
    document.getElementById("screensSection").style.display = "none";
    document.getElementById("info").style.display = "none";
    document.getElementById("currentTopicTitle").style.display = "none";
    document.getElementById("backToTopics").style.display = "none";
    if (currentMenuIsTopic) {
        switchMenu(renderMenu, topics, null);
    }
    updateBreadcrumbs(['Главная', 'Граф знаний']);
    renderGraph();
    addGraphControls();
}

function addGraphControls() {
    const graphScreen = document.getElementById("graphScreen");
    let controlsPanel = graphScreen.querySelector('.graph-controls-panel');
    if (controlsPanel) controlsPanel.remove();

    controlsPanel = document.createElement('div');
    controlsPanel.className = 'graph-controls-panel';
    controlsPanel.style.position = 'absolute';
    controlsPanel.style.bottom = '20px';
    controlsPanel.style.right = '20px';
    controlsPanel.style.display = 'flex';
    controlsPanel.style.gap = '10px';
    controlsPanel.style.zIndex = '100';
    graphScreen.style.position = 'relative';
    graphScreen.appendChild(controlsPanel);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Сбросить позиции';
    resetBtn.style.padding = '8px 16px';
    resetBtn.style.borderRadius = '20px';
    resetBtn.style.background = 'var(--accent-primary)';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.cursor = 'pointer';
    resetBtn.onclick = () => {
        if (graphNetwork) {
            graphNetwork.setData(graphNetwork.body.data);
            graphNetwork.fit();
        }
    };
    controlsPanel.appendChild(resetBtn);

    const togglePhysicsBtn = document.createElement('button');
    togglePhysicsBtn.textContent = graphPhysicsEnabled ? 'Зафиксировать узлы' : 'Возобновить движение';
    togglePhysicsBtn.style.padding = '8px 16px';
    togglePhysicsBtn.style.borderRadius = '20px';
    togglePhysicsBtn.style.background = 'var(--accent-primary)';
    togglePhysicsBtn.style.color = 'white';
    togglePhysicsBtn.style.border = 'none';
    togglePhysicsBtn.style.cursor = 'pointer';
    togglePhysicsBtn.onclick = () => {
        if (graphNetwork) {
            graphPhysicsEnabled = !graphPhysicsEnabled;
            graphNetwork.setOptions({ physics: graphPhysicsEnabled });
            togglePhysicsBtn.textContent = graphPhysicsEnabled ? 'Зафиксировать узлы' : 'Возобновить движение';
            if (graphPhysicsEnabled) {
                graphNetwork.startSimulation();
            } else {
                graphNetwork.stopSimulation();
            }
        }
    };
    controlsPanel.appendChild(togglePhysicsBtn);
}

function renderGraph() {
    const container = document.getElementById("graphScreen");
    container.innerHTML = '<div id="knowledgeGraph" style="width: 100%; height: 100%;"></div>';

    const style = getComputedStyle(document.body);
    const textColor = style.getPropertyValue('--text-dark').trim() || '#333333';
    const bgColor = style.getPropertyValue('--bg-card').trim() || '#ffffff';
    const borderColor = style.getPropertyValue('--accent-primary').trim() || '#4a7cff';
    const highlightBg = style.getPropertyValue('--accent-primary').trim() || '#4a7cff';

    const nodes = [];
    const edges = [];

    topics.forEach((topic, idx) => {
        nodes.push({
            id: idx,
            label: topic.title,
            title: topic.title,
            group: idx,
            font: { size: 14, color: textColor },
            color: {
                background: bgColor,
                border: borderColor,
                highlight: { background: highlightBg, border: borderColor }
            },
            shape: 'box',
            margin: 12,
            widthConstraint: { minimum: 100, maximum: 200 },
            mass: 2,
            physics: true
        });

        if (topic.prerequisites) {
            topic.prerequisites.forEach(prereqIdx => {
                edges.push({
                    from: prereqIdx,
                    to: idx,
                    arrows: 'to',
                    color: { color: borderColor },
                    width: 2,
                    smooth: { type: 'continuous' }
                });
            });
        }
    });

    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        nodes: {
            shape: 'box',
            font: { size: 14, color: textColor },
            color: { background: bgColor, border: borderColor },
            margin: 12,
            widthConstraint: { minimum: 100, maximum: 200 }
        },
        edges: {
            color: { color: borderColor },
            width: 2,
            smooth: { type: 'continuous' }
        },
        physics: {
            stabilization: {
                iterations: 300,
                updateInterval: 50,
                onlyDynamicEdges: false,
                fit: true
            },
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.005,
                springLength: 350,
                springConstant: 0.1,
                damping: 0.9,
                avoidOverlap: 0.5
            },
            maxVelocity: 6,
            minVelocity: 0.05,
            timestep: 0.2
        },
        layout: {
            improvedLayout: true,
            randomSeed: 1
        },
        interaction: {
            hover: true,
            navigationButtons: true,
            dragNodes: true,
            zoomView: true,
            tooltipDelay: 300,
            dragView: true,
            zoomSpeed: 0.8,
            navigation: {
                enabled: true,
                keyboard: {
                    enabled: true,
                    speed: { x: 1, y: 1, zoom: 0.8 }
                }
            }
        }
    };

    if (graphNetwork) {
        graphNetwork.destroy();
    }
    graphNetwork = new vis.Network(document.getElementById("knowledgeGraph"), data, options);
    
    graphNetwork.setOptions({ physics: graphPhysicsEnabled });
    if (!graphPhysicsEnabled) {
        graphNetwork.stopSimulation();
    }
    
    graphNetwork.once('stabilizationIterationsDone', function () {
        graphNetwork.fit();
    });
    
    graphNetwork.on("click", function(params) {
        if (params.nodes.length > 0) {
            const topicId = params.nodes[0];
            loadTopic(topics[topicId]);
        }
    });
}