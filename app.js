// ============================================================================
        // QUANTUM ENGINE - MOTEUR DE JEU IDLE IMMERSIF
        // ============================================================================
        const QuantumEngine = {
            // CONFIGURATION DE L'UNIVERS
            CONFIG: {
                VERSION: '6.0.0-singularity',
                GRID_SIZE: 7,
                TICK_RATE: 1000, // 1 seconde
                OFFLINE_MAX_HOURS: 24,
                
                RESSOURCES: {
                    energy: { name: 'Énergie Quantique', base: 100, icon: '⚡', color: '#00f3ff' },
                    matter: { name: 'Matière Exotique', base: 0, icon: '💎', color: '#8a2be2' },
                    entropy: { name: 'Entropie', base: 0, icon: '🌀', color: '#ff0055' },
                    singularity: { name: 'Énergie Singulière', base: 0, icon: '⚛️', color: '#ff00ff' }
                },
                
                MACHINES: {
                    core: { 
                        name: 'Noyau Quantique', 
                        cost: { energy: 100 }, 
                        production: { matter: 1 },
                        icon: '🔷',
                        description: 'Génère de la Matière Exotique'
                    },
                    extractor: { 
                        name: 'Extracteur', 
                        cost: { matter: 50 }, 
                        production: { energy: 5, entropy: 0.1 },
                        icon: '⛏️',
                        description: 'Extrait l\'Énergie Quantique'
                    },
                    stabilizer: { 
                        name: 'Stabilisateur', 
                        cost: { matter: 100, energy: 50 }, 
                        production: { entropy: -0.5 },
                        icon: '⚖️',
                        description: 'Réduit l\'Entropie'
                    },
                    amplifier: { 
                        name: 'Amplificateur', 
                        cost: { matter: 500, energy: 200 }, 
                        production: { energy: 20, matter: 2 },
                        icon: '📈',
                        description: 'Boost la production'
                    }
                },
                
                UPGRADES: {
                    autoCore: {
                        name: 'Cœurs Auto-Réplicants',
                        description: 'Les Noyaux se répliquent automatiquement',
                        cost: { matter: 1000 },
                        icon: '🔄',
                        effect: 'autoReplication',
                        maxLevel: 1
                    },
                    quantumBoost: {
                        name: 'Boost Quantique',
                        description: '+25% de production d\'énergie',
                        cost: { matter: 500, energy: 200 },
                        icon: '🚀',
                        effect: 'energyMultiplier',
                        maxLevel: 10,
                        effectValue: 0.25
                    },
                    entropyControl: {
                        name: 'Contrôle d\'Entropie',
                        description: 'Réduit la génération d\'entropie de 20%',
                        cost: { matter: 800 },
                        icon: '🎛️',
                        effect: 'entropyReduction',
                        maxLevel: 5,
                        effectValue: 0.2
                    }
                },
                
                RESEARCH: {
                    parallelProcessing: {
                        name: 'Traitement Parallèle',
                        description: 'Débloque 2 emplacements de grille supplémentaires',
                        cost: { singularity: 1 },
                        icon: '🔳',
                        effect: 'gridExpansion'
                    },
                    timeDilation: {
                        name: 'Dilatation Temporelle',
                        description: 'Production hors-ligne ×2',
                        cost: { singularity: 3 },
                        icon: '⏰',
                        effect: 'offlineBoost'
                    }
                }
            },
            
            // ÉTAT DU JEU
            state: {
                resources: {},
                machines: [],
                upgrades: {},
                research: {},
                grid: [],
                lastUpdate: Date.now(),
                totalTime: 0,
                offlineTime: 0,
                statistics: {
                    totalProduction: 0,
                    machinesBuilt: 0,
                    prestiges: 0
                }
            },
            
            // INITIALISATION QUANTIQUE
            init() {
                console.log('🌌 Initialisation du moteur quantique...');
                
                // Initialiser les ressources
                Object.keys(this.CONFIG.RESSOURCES).forEach(key => {
                    this.state.resources[key] = this.CONFIG.RESSOURCES[key].base;
                });
                
                // Initialiser la grille
                this.initGrid();
                
                // Initialiser l'état sauvegardé
                this.loadUniverse();
                
                // Créer l'univers visuel
                this.createUniverse();
                this.renderGrid();
                this.updateHUD();
                
                // Démarrer les boucles
                this.startGameLoop();
                this.startVisualLoop();
                
                // Afficher le tutoriel si première fois
                if (!localStorage.getItem('geoFactory_hasPlayed')) {
                    this.showOverlay('tutorial');
                }
                
                console.log('✅ Singularité établie. Prêt pour la production.');
            },
            
            // CRÉATION DE L'UNIVERS VISUEL
            createUniverse() {
                const starsContainer = document.getElementById('starsContainer');
                const starCount = 150;
                
                for (let i = 0; i < starCount; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    
                    // Position aléatoire
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 100}%`;
                    
                    // Taille aléatoire
                    const size = 1 + Math.random() * 3;
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    
                    // Délai d'animation
                    star.style.animationDelay = `${Math.random() * 5}s`;
                    star.style.animationDuration = `${3 + Math.random() * 4}s`;
                    
                    starsContainer.appendChild(star);
                }
                
                // Initialiser les overlays
                this.initOverlays();
            },
            
            // INITIALISATION DE LA GRILLE QUANTIQUE
            initGrid() {
                const grid = [];
                const cellCount = this.CONFIG.GRID_SIZE * this.CONFIG.GRID_SIZE;
                
                for (let i = 0; i < cellCount; i++) {
                    grid.push({
                        id: i,
                        machine: null,
                        level: 0,
                        efficiency: 1.0
                    });
                }
                
                // Placer une machine initiale
                grid[Math.floor(cellCount / 2)].machine = 'core';
                this.state.grid = grid;
            },
            
            // BOUCLE DE JEU PRINCIPALE (IDLE)
            startGameLoop() {
                setInterval(() => {
                    this.processTick();
                }, this.CONFIG.TICK_RATE);
            },
            
            // BOUCLE VISUELLE IMMERSIVE
            startVisualLoop() {
                const updateVisuals = () => {
                    // Mettre à jour les animations des machines
                    this.state.grid.forEach((cell, index) => {
                        if (cell.machine) {
                            this.updateMachineVisual(index, cell);
                        }
                    });
                    
                    // Mettre à jour l'HUD
                    this.updateHUD();
                    
                    requestAnimationFrame(updateVisuals);
                };
                
                updateVisuals();
            },
            
            // PROCESSUS DE PRODUCTION
            processTick() {
                // Calculer la production
                let totalProduction = 0;
                
                this.state.grid.forEach(cell => {
                    if (cell.machine && this.CONFIG.MACHINES[cell.machine]) {
                        const machine = this.CONFIG.MACHINES[cell.machine];
                        const efficiency = cell.efficiency;
                        
                        // Appliquer la production
                        Object.entries(machine.production).forEach(([resource, amount]) => {
                            const effectiveAmount = amount * efficiency * (1 + cell.level * 0.1);
                            this.updateResource(resource, effectiveAmount);
                            totalProduction += Math.abs(effectiveAmount);
                        });
                    }
                });
                
                // Mettre à jour les statistiques
                this.state.statistics.totalProduction += totalProduction;
                this.state.totalTime += this.CONFIG.TICK_RATE / 1000; // en secondes
                
                // Vérifier les améliorations auto
                this.checkAutoUpgrades();
                
                // Sauvegarder périodiquement
                if (Date.now() - this.state.lastSave > 30000) { // 30 secondes
                    this.saveUniverse();
                }
            },
            
            // GESTION DES RESSOURCES
            updateResource(resource, amount) {
                if (this.state.resources[resource] !== undefined) {
                    // Appliquer les multiplicateurs d'upgrades
                    let multiplier = 1;
                    
                    // Multiplicateur d'énergie
                    if (resource === 'energy' && this.state.upgrades.quantumBoost) {
                        multiplier += this.state.upgrades.quantumBoost.level * 0.25;
                    }
                    
                    const finalAmount = amount * multiplier;
                    this.state.resources[resource] += finalAmount;
                    
                    // Garder les valeurs dans des limites
                    if (resource === 'entropy') {
                        this.state.resources[resource] = Math.max(0, Math.min(100, this.state.resources[resource]));
                    } else {
                        this.state.resources[resource] = Math.max(0, this.state.resources[resource]);
                    }
                    
                    return true;
                }
                return false;
            },
            
            // ACHAT DE MACHINE
            purchaseMachine(type, cellId) {
                const machine = this.CONFIG.MACHINES[type];
                if (!machine || this.state.grid[cellId].machine) return false;
                
                // Vérifier les ressources
                let canAfford = true;
                Object.entries(machine.cost).forEach(([resource, cost]) => {
                    if (this.state.resources[resource] < cost) {
                        canAfford = false;
                    }
                });
                
                if (!canAfford) return false;
                
                // Payer le coût
                Object.entries(machine.cost).forEach(([resource, cost]) => {
                    this.updateResource(resource, -cost);
                });
                
                // Placer la machine
                this.state.grid[cellId].machine = type;
                this.state.statistics.machinesBuilt++;
                
                return true;
            },
            
            // AMÉLIORATION DE MACHINE
            upgradeMachine(cellId) {
                const cell = this.state.grid[cellId];
                if (!cell.machine || cell.level >= 10) return false;
                
                const upgradeCost = Math.pow(2, cell.level) * 100; // Coût exponentiel
    
                if (this.state.resources.matter < upgradeCost) return false;
                
                // Payer l'amélioration
                this.updateResource('matter', -upgradeCost);
                cell.level++;
                cell.efficiency = 1 + cell.level * 0.1;
                
                return true;
            },
            
            // ACHAT D'UPGRADE
            purchaseUpgrade(upgradeId) {
                const upgrade = this.CONFIG.UPGRADES[upgradeId];
                if (!upgrade) return false;
                
                // Vérifier le niveau max
                const currentLevel = this.state.upgrades[upgradeId]?.level || 0;
                if (currentLevel >= upgrade.maxLevel) return false;
                
                // Vérifier les ressources
                let canAfford = true;
                Object.entries(upgrade.cost).forEach(([resource, cost]) => {
                    const scaledCost = cost * Math.pow(2, currentLevel);
                    if (this.state.resources[resource] < scaledCost) {
                        canAfford = false;
                    }
                });
                
                if (!canAfford) return false;
                
                // Payer le coût
                Object.entries(upgrade.cost).forEach(([resource, cost]) => {
                    const scaledCost = cost * Math.pow(2, currentLevel);
                    this.updateResource(resource, -scaledCost);
                });
                
                // Appliquer l'upgrade
                if (!this.state.upgrades[upgradeId]) {
                    this.state.upgrades[upgradeId] = { level: 1, purchased: true };
                } else {
                    this.state.upgrades[upgradeId].level++;
                }
                
                // Appliquer l'effet immédiatement
                this.applyUpgradeEffect(upgradeId);
                
                return true;
            },
            
            // APPLICATION DES EFFETS D'UPGRADE
            applyUpgradeEffect(upgradeId) {
                const upgrade = this.CONFIG.UPGRADES[upgradeId];
                const upgradeState = this.state.upgrades[upgradeId];
                
                switch (upgrade.effect) {
                    case 'autoReplication':
                        // Implémenter la réplication automatique
                        break;
                    case 'energyMultiplier':
                        // Multiplicateur déjà appliqué dans updateResource
                        break;
                }
            },
            
            // VÉRIFICATION DES UPGRADES AUTOMATIQUES
            checkAutoUpgrades() {
                // Améliorations auto selon les ressources disponibles
                Object.entries(this.CONFIG.UPGRADES).forEach(([upgradeId, upgrade]) => {
                    const currentLevel = this.state.upgrades[upgradeId]?.level || 0;
                    
                    if (currentLevel < upgrade.maxLevel) {
                        let canAfford = true;
                        Object.entries(upgrade.cost).forEach(([resource, cost]) => {
                            const scaledCost = cost * Math.pow(2, currentLevel);
                            if (this.state.resources[resource] < scaledCost * 10) { // 10x le coût pour auto
                                canAfford = false;
                            }
                        });
                        
                        if (canAfford && document.getElementById('autoUpgrade')?.checked) {
                            this.purchaseUpgrade(upgradeId);
                        }
                    }
                });
            },
            
            // PRESTIGE / SINGULARITÉ
            activateSingularity() {
                const singularityEnergy = this.calculateSingularityEnergy();
                
                if (singularityEnergy < 100) {
                    this.showNotification(`Singularité à ${singularityEnergy.toFixed(1)}%`, 'info');
                    return false;
                }
                
                // Réinitialiser avec bonus
                const bonus = Math.floor(this.state.statistics.totalProduction / 1000000);
                
                // Sauvegarder les points de prestige
                this.state.resources.singularity += 1 + bonus;
                this.state.statistics.prestiges++;
                
                // Réinitialiser l'état (garder les recherches)
                this.initGrid();
                this.state.upgrades = {};
                this.state.statistics.totalProduction = 0;
                this.state.statistics.machinesBuilt = 0;
                
                // Bonus permanent
                this.state.resources.energy = 100 * (1 + bonus * 0.1);
                
                this.showNotification(`Singularité activée! +${bonus} bonus`, 'success');
                this.saveUniverse();
                
                return true;
            },
            
            // CALCUL ÉNERGIE SINGULIÈRE
            calculateSingularityEnergy() {
                const totalValue = this.state.statistics.totalProduction;
                return Math.min(100, Math.log10(totalValue + 1) * 10);
            },
            
            // RENDU DE LA GRILLE
            renderGrid() {
                const gridElement = document.getElementById('quantumGrid');
                gridElement.innerHTML = '';
                
                this.state.grid.forEach((cell, index) => {
                    const cellElement = document.createElement('div');
                    cellElement.className = 'quantum-cell';
                    if (cell.machine) cellElement.classList.add('active');
                    cellElement.dataset.id = index;
                    
                    if (cell.machine) {
                        const machineElement = document.createElement('div');
                        machineElement.className = 'quantum-machine';
                        
                        const coreElement = document.createElement('div');
                        coreElement.className = 'machine-core';
                        coreElement.textContent = this.CONFIG.MACHINES[cell.machine]?.icon || '❓';
                        
                        const ringsElement = document.createElement('div');
                        ringsElement.className = 'machine-rings';
                        
                        const infoElement = document.createElement('div');
                        infoElement.className = 'machine-info';
                        infoElement.textContent = cell.machine;
                        
                        if (cell.level > 0) {
                            const levelElement = document.createElement('div');
                            levelElement.className = 'machine-level';
                            levelElement.textContent = cell.level;
                            machineElement.appendChild(levelElement);
                        }
                        
                        machineElement.appendChild(coreElement);
                        machineElement.appendChild(ringsElement);
                        machineElement.appendChild(infoElement);
                        cellElement.appendChild(machineElement);
                    }
                    
                    // Gestion des clics
                    cellElement.addEventListener('click', () => {
                        this.handleCellClick(index);
                    });
                    
                    cellElement.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.handleCellRightClick(index);
                    });
                    
                    gridElement.appendChild(cellElement);
                });
            },
            
            // MISE À JOUR VISUELLE DES MACHINES
            updateMachineVisual(cellId, cell) {
                const cellElement = document.querySelector(`.quantum-cell[data-id="${cellId}"]`);
                if (!cellElement) return;
                
                // Animation de pulsation basée sur l'efficacité
                const machineCore = cellElement.querySelector('.machine-core');
                if (machineCore) {
                    const pulseSpeed = 3 / cell.efficiency;
                    machineCore.style.animationDuration = `${pulseSpeed}s`;
                }
            },
            
            // MISE À JOUR DU HUD
            updateHUD() {
                // Mettre à jour les statistiques
                document.getElementById('statEnergy').textContent = 
                    this.formatNumber(this.state.resources.energy) + ' Q/s';
                
                document.getElementById('statMatter').textContent = 
                    this.formatNumber(this.state.resources.matter);
                
                document.getElementById('statEntropy').textContent = 
                    this.state.resources.entropy.toFixed(1) + '%';
                
                // Temps de jeu
                const hours = Math.floor(this.state.totalTime / 3600);
                const minutes = Math.floor((this.state.totalTime % 3600) / 60);
                document.getElementById('statTime').textContent = 
                    `${hours}h ${minutes}m`;
                
                // Énergie de singularité
                const singularityEnergy = this.calculateSingularityEnergy();
                document.getElementById('singularityEnergy').textContent = 
                    singularityEnergy.toFixed(1) + '%';
                
                // Barre de progression
                const progressPercent = Math.min(100, this.state.resources.matter / 10000 * 100);
                document.getElementById('progressFill').style.strokeDashoffset = 
                    283 - (283 * progressPercent / 100);
                document.getElementById('progressPercent').textContent = 
                    Math.floor(progressPercent) + '%';
                
                // Badges
                this.updateBadges();
            },
            
            // MISE À JOUR DES BADGES
            updateBadges() {
                // Compter les upgrades disponibles
                let availableUpgrades = 0;
                Object.entries(this.CONFIG.UPGRADES).forEach(([upgradeId, upgrade]) => {
                    const currentLevel = this.state.upgrades[upgradeId]?.level || 0;
                    if (currentLevel < upgrade.maxLevel) {
                        let canAfford = true;
                        Object.entries(upgrade.cost).forEach(([resource, cost]) => {
                            const scaledCost = cost * Math.pow(2, currentLevel);
                            if (this.state.resources[resource] < scaledCost) {
                                canAfford = false;
                            }
                        });
                        if (canAfford) availableUpgrades++;
                    }
                });
                
                const badge = document.getElementById('upgradeBadge');
                if (badge) {
                    badge.textContent = availableUpgrades || '';
                    badge.style.display = availableUpgrades > 0 ? 'flex' : 'none';
                }
            },
            
            // GESTION DES CLICS SUR CELLULE
            handleCellClick(cellId) {
                const cell = this.state.grid[cellId];
                
                if (!cell.machine) {
                    // Acheter une machine
                    this.showMachineSelector(cellId);
                } else {
                    // Améliorer la machine
                    if (this.upgradeMachine(cellId)) {
                        this.showNotification(`Machine améliorée Niveau ${cell.level + 1}`, 'success');
                        this.renderGrid();
                    } else {
                        this.showNotification('Ressources insuffisantes', 'error');
                    }
                }
            },
            
            handleCellRightClick(cellId) {
                const cell = this.state.grid[cellId];
                if (!cell.machine) return;
                
                // Vendre la machine (remboursement partiel)
                const refund = Math.pow(2, cell.level) * 50;
                this.updateResource('matter', refund);
                cell.machine = null;
                cell.level = 0;
                
                this.showNotification(`Machine vendue: +${refund} Matière`, 'info');
                this.renderGrid();
            },
            
            // AFFICHAGE DU SELECTEUR DE MACHINE
            showMachineSelector(cellId) {
                // Créer un overlay de sélection
                const overlay = document.createElement('div');
                overlay.className = 'quantum-overlay active';
                overlay.style.zIndex = '1000';
                
                const modal = document.createElement('div');
                modal.className = 'holo-modal';
                modal.style.width = '400px';
                
                let html = `
                    <div class="modal-header">
                        <div class="modal-title">CONSTRUIRE UNE MACHINE</div>
                        <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                    </div>
                    <div style="padding: 20px;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                `;
                
                Object.entries(this.CONFIG.MACHINES).forEach(([id, machine]) => {
                    let canAfford = true;
                    Object.entries(machine.cost).forEach(([resource, cost]) => {
                        if (this.state.resources[resource] < cost) {
                            canAfford = false;
                        }
                    });
                    
                    html += `
                        <div class="quantum-upgrade ${!canAfford ? 'locked' : ''}" 
                             onclick="${canAfford ? `QuantumEngine.purchaseMachine('${id}', ${cellId}); this.parentElement.parentElement.parentElement.parentElement.remove(); QuantumEngine.renderGrid();` : ''}">
                            <div class="upgrade-icon">${machine.icon}</div>
                            <div class="upgrade-name">${machine.name}</div>
                            <div class="upgrade-desc">${machine.description}</div>
                            <div class="upgrade-cost">
                                ${Object.entries(machine.cost).map(([res, cost]) => 
                                    `${this.CONFIG.RESSOURCES[res]?.icon} ${cost}`).join(' ')}
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
                
                modal.innerHTML = html;
                overlay.appendChild(modal);
                document.body.appendChild(overlay);
            },
            
            // INITIALISATION DES OVERLAYS
            initOverlays() {
                // Overlay des upgrades
                const upgradesGrid = document.getElementById('upgradesGrid');
                if (upgradesGrid) {
                    upgradesGrid.innerHTML = '';
                    
                    Object.entries(this.CONFIG.UPGRADES).forEach(([id, upgrade]) => {
                        const upgradeElement = document.createElement('div');
                        upgradeElement.className = 'quantum-upgrade';
                        upgradeElement.onclick = () => this.purchaseUpgrade(id);
                        
                        const currentLevel = this.state.upgrades[id]?.level || 0;
                        const isMaxLevel = currentLevel >= upgrade.maxLevel;
                        
                        upgradeElement.innerHTML = `
                            <div class="upgrade-icon">${upgrade.icon}</div>
                            <div class="upgrade-name">${upgrade.name} ${currentLevel > 0 ? `Lvl ${currentLevel}` : ''}</div>
                            <div class="upgrade-desc">${upgrade.description}</div>
                            <div class="upgrade-cost">
                                ${Object.entries(upgrade.cost).map(([res, cost]) => 
                                    `${this.CONFIG.RESSOURCES[res]?.icon} ${cost * Math.pow(2, currentLevel)}`).join(' ')}
                                <span class="upgrade-level">${isMaxLevel ? 'MAX' : `${currentLevel}/${upgrade.maxLevel}`}</span>
                            </div>
                        `;
                        
                        if (isMaxLevel) {
                            upgradeElement.classList.add('purchased');
                        }
                        
                        upgradesGrid.appendChild(upgradeElement);
                    });
                }
                
                // Gestion des boutons overlay
                document.querySelectorAll('.modal-close').forEach(btn => {
                    btn.onclick = () => {
                        const overlayId = btn.dataset.overlay;
                        this.hideOverlay(overlayId);
                    };
                });
                
                document.getElementById('btnUpgrades').onclick = () => this.showOverlay('upgrades');
                document.getElementById('btnResearch').onclick = () => this.showOverlay('research');
                document.getElementById('btnSettings').onclick = () => this.showOverlay('settings');
                document.getElementById('btnSingularity').onclick = () => this.activateSingularity();
                document.getElementById('btnStartGame').onclick = () => this.hideOverlay('tutorial');
            },
            
            // AFFICHER/MASQUER OVERLAY
            showOverlay(id) {
                const overlay = document.getElementById(id + 'Overlay');
                if (overlay) {
                    overlay.classList.add('active');
                }
            },
            
            hideOverlay(id) {
                const overlay = document.getElementById(id + 'Overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                if (id === 'tutorial') {
                    localStorage.setItem('geoFactory_hasPlayed', 'true');
                }
            },
            
            // NOTIFICATIONS
            showNotification(message, type = 'info') {
                // Créer une notification temporaire
                const notification = document.createElement('div');
                notification.className = 'quantum-stat';
                notification.style.position = 'fixed';
                notification.style.top = '50%';
                notification.style.left = '50%';
                notification.style.transform = 'translate(-50%, -50%)';
                notification.style.zIndex = '10000';
                notification.style.background = type === 'error' 
                    ? 'rgba(255, 0, 85, 0.9)' 
                    : type === 'success' 
                    ? 'rgba(0, 255, 136, 0.9)' 
                    : 'rgba(0, 243, 255, 0.9)';
                
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 15px 20px;">
                        <div style="font-size: 20px;">
                            ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                        </div>
                        <div style="font-size: 14px;">${message}</div>
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                // Supprimer après 3 secondes
                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            },
            
            // SAUVEGARDE DE L'UNIVERS
            saveUniverse() {
                try {
                    const saveData = {
                        state: this.state,
                        timestamp: Date.now(),
                        version: this.CONFIG.VERSION
                    };
                    
                    localStorage.setItem('geoFactory_universe', JSON.stringify(saveData));
                    this.state.lastSave = Date.now();
                    return true;
                } catch (error) {
                    console.error('Erreur de sauvegarde:', error);
                    return false;
                }
            },
            
            // CHARGEMENT DE L'UNIVERS
            loadUniverse() {
                try {
                    const saveData = localStorage.getItem('geoFactory_universe');
                    if (!saveData) {
                        this.state.lastSave = Date.now();
                        return false;
                    }
                    
                    const parsed = JSON.parse(saveData);
                    
                    // Migration de version si nécessaire
                    if (parsed.version !== this.CONFIG.VERSION) {
                        console.log('Migration de version...');
                    }
                    
                    // Restaurer l'état
                    this.state = { ...this.state, ...parsed.state };
                    this.state.lastSave = Date.now();
                    
                    // Calculer le temps hors-ligne
                    const offlineTime = Math.floor((Date.now() - parsed.timestamp) / 1000);
                    const maxOffline = this.CONFIG.OFFLINE_MAX_HOURS * 3600;
                    const effectiveOffline = Math.min(offlineTime, maxOffline);
                    
                    if (effectiveOffline > 0 && document.getElementById('offlineProgress')?.checked) {
                        this.state.offlineTime = effectiveOffline;
                        this.processOfflineProduction(effectiveOffline);
                        this.showNotification(`Production hors-ligne: ${this.formatTime(effectiveOffline)}`, 'success');
                    }
                    
                    return true;
                } catch (error) {
                    console.error('Erreur de chargement:', error);
                    return false;
                }
            },
            
            // PRODUCTION HORS-LIGNE
            processOfflineProduction(seconds) {
                // Simuler les ticks manqués
                const tickCount = Math.floor(seconds / (this.CONFIG.TICK_RATE / 1000));
                
                for (let i = 0; i < tickCount; i++) {
                    this.processTick();
                }
            },
            
            // FORMATAGE DES NOMBRES
            formatNumber(num) {
                if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
                if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
                if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
                return num.toFixed(1);
            },
            
            formatTime(seconds) {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return `${hours}h ${minutes}m`;
            }
        };
        
        // ============================================================================
        // INITIALISATION DU JEU
        // ============================================================================
        document.addEventListener('DOMContentLoaded', () => {
            // Initialiser le moteur quantique
            QuantumEngine.init();
            
            // Sauvegarder avant de quitter
            window.addEventListener('beforeunload', () => {
                QuantumEngine.saveUniverse();
            });
            
            // Mettre à jour le HUD toutes les secondes
            setInterval(() => {
                QuantumEngine.updateHUD();
            }, 1000);
            
            // Effets de particules optionnels
            const particlesEnabled = document.getElementById('particlesEnabled');
            if (particlesEnabled) {
                particlesEnabled.addEventListener('change', (e) => {
                    const stars = document.querySelectorAll('.star');
                    stars.forEach(star => {
                        star.style.animationPlayState = e.target.checked ? 'running' : 'paused';
                        star.style.opacity = e.target.checked ? '0.3' : '0';
                    });
                });
            }
            
            // Réinitialisation totale
            document.getElementById('btnHardReset')?.addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir réinitialiser totalement l\'univers? Cette action est irréversible.')) {
                    localStorage.clear();
                    location.reload();
                }
            });
            
            // Export de sauvegarde
            document.getElementById('btnExportSave')?.addEventListener('click', () => {
                QuantumEngine.saveUniverse();
                alert('Univers sauvegardé avec succès!');
            });
            
            console.log('🚀 Geo-Factory Tycoon 6.0 - Singularity Edition chargé!');
            console.log('🎮 Mode Idle: Production continue même hors-ligne');
            console.log('🌌 Immersion: Interface holographique minimale');
            console.log('⚡ Gameplay: Évolution progressive et prestige');
        });
        
        // Exposer l'API pour le debug
        window.QuantumEngine = QuantumEngine;
