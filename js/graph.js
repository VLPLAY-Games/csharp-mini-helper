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
    attachGraphControls();
}

function attachGraphControls() {
    const graphSearch = document.getElementById("graphSearch");
    if (graphSearch) {
        graphSearch.addEventListener("input", () => {
            const query = graphSearch.value.toLowerCase();
            if (graphNetwork) {
                const nodes = graphNetwork.body.data.nodes.get();
                const found = nodes.find(node => node.label.toLowerCase().includes(query));
                if (found) {
                    graphNetwork.selectNodes([found.id]);
                    graphNetwork.focus(found.id, { scale: 1.5, animation: true });
                } else {
                    graphNetwork.unselectNodes();
                }
            }
        });
    }

    // Единая кнопка экспорта с выпадающим меню
    const exportContainer = document.getElementById("graphExportContainer");
    if (exportContainer) {
        exportContainer.innerHTML = `
            <div class="graph-export-dropdown">
                <button class="graph-export-btn">Экспорт ▼</button>
                <div class="graph-export-dropdown-content">
                    <button id="graphExportPNG">PNG</button>
                    <button id="graphExportSVG">SVG</button>
                </div>
            </div>
        `;
        document.getElementById("graphExportPNG")?.addEventListener("click", () => exportGraph('png'));
        document.getElementById("graphExportSVG")?.addEventListener("click", () => exportGraph('svg'));
    }

    const zoomIn = document.getElementById("graphZoomIn");
    if (zoomIn) {
        zoomIn.addEventListener("click", () => {
            if (graphNetwork) {
                const scale = graphNetwork.getScale();
                graphNetwork.moveTo({ scale: scale * 1.2 });
            }
        });
    }

    const zoomOut = document.getElementById("graphZoomOut");
    if (zoomOut) {
        zoomOut.addEventListener("click", () => {
            if (graphNetwork) {
                const scale = graphNetwork.getScale();
                graphNetwork.moveTo({ scale: scale * 0.8 });
            }
        });
    }

    const fit = document.getElementById("graphFit");
    if (fit) {
        fit.addEventListener("click", () => {
            if (graphNetwork) graphNetwork.fit();
        });
    }

    const resetPhysics = document.getElementById("graphResetPhysics");
    if (resetPhysics) {
        resetPhysics.addEventListener("click", () => {
            if (graphNetwork) {
                graphNetwork.setData(graphNetwork.body.data);
                graphNetwork.fit();
            }
        });
    }

    // Кнопка остановки/запуска физики
    const togglePhysicsBtn = document.getElementById("graphTogglePhysics");
    if (togglePhysicsBtn) {
        togglePhysicsBtn.textContent = graphPhysicsEnabled ? "⏸ Остановить" : "▶ Запустить";
        togglePhysicsBtn.addEventListener("click", () => {
            if (graphNetwork) {
                graphPhysicsEnabled = !graphPhysicsEnabled;
                graphNetwork.setOptions({ physics: graphPhysicsEnabled });
                togglePhysicsBtn.textContent = graphPhysicsEnabled ? "⏸ Остановить" : "▶ Запустить";
                if (graphPhysicsEnabled) {
                    graphNetwork.startSimulation();
                } else {
                    graphNetwork.stopSimulation();
                }
            }
        });
    }
}

function exportGraph(format) {
    if (format === 'png') {
        const canvas = document.querySelector("#knowledgeGraph canvas");
        if (canvas) {
            const link = document.createElement("a");
            link.download = "graph.png";
            link.href = canvas.toDataURL();
            link.click();
        }
    } else if (format === 'svg') {
        const svg = document.querySelector("#knowledgeGraph svg");
        if (svg) {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svg);
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            const blob = new Blob([source], { type: "image/svg+xml" });
            const link = document.createElement("a");
            link.download = "graph.svg";
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }
}

function renderGraph() {
    const container = document.getElementById("knowledgeGraph");
    if (!container) return;
    container.innerHTML = "";

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
    graphNetwork = new vis.Network(container, data, options);
    
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
            const topic = topics[topicId];
            const infoDiv = document.getElementById("graphInfo");
            if (infoDiv) {
                infoDiv.innerHTML = `<strong>${topic.title}</strong><br>${topic.theory.substring(0, 200)}...<br><button onclick="loadTopic(topics[${topicId}])">Открыть тему</button>`;
                infoDiv.classList.remove("hidden");
            }
        } else {
            document.getElementById("graphInfo")?.classList.add("hidden");
        }
    });
}