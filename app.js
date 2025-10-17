/**
 * MusicFlow Main Application
 * Professional Music Creator Platform
 * Coordinates all components and handles user interactions
 */

class MusicFlowApp {
    constructor() {
        this.audioEngine = null;
        this.instrumentManager = null;
        this.sequencer = null;
        this.effectsManager = null;
        
        this.currentProject = null;
        this.projects = [];
        this.isInitialized = false;
        
        // Initialize app
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading overlay
            this.showLoadingOverlay('Initializing MusicFlow...');
            
            // Initialize audio engine
            this.audioEngine = new AudioEngine();
            await this.audioEngine.initAudioContext();
            
            // Initialize instrument manager
            this.instrumentManager = new InstrumentManager(this.audioEngine);
            
            // Initialize effects manager
            this.effectsManager = new EffectsManager(this.audioEngine);
            
            // Initialize sequencer
            this.sequencer = new Sequencer(this.audioEngine, this.instrumentManager);
            
            // Setup UI
            this.setupUI();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            
            // Load saved projects
            this.loadProjects();
            
            // Hide loading overlay
            this.hideLoadingOverlay();
            
            this.isInitialized = true;
            console.log('MusicFlow initialized successfully');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize MusicFlow:', error);
            this.showError('Failed to initialize MusicFlow. Please refresh the page.');
        }
    }
    
    /**
     * Setup UI components
     */
    setupUI() {
        // Initialize navigation
        this.setupNavigation();
        
        // Initialize instrument selection
        this.setupInstrumentSelection();
        
        // Initialize genre selection
        this.setupGenreSelection();
        
        // Initialize project library
        this.setupProjectLibrary();
        
        // Initialize help section
        this.setupHelpSection();
    }
    
    /**
     * Setup navigation
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.dataset.section;
                
                // Update active nav button
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show target section
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Setup instrument selection
     */
    setupInstrumentSelection() {
        const instrumentCards = document.querySelectorAll('.instrument-card');
        
        instrumentCards.forEach(card => {
            card.addEventListener('click', () => {
                const instrument = card.dataset.instrument;
                
                // Update active instrument
                instrumentCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Set active instrument
                this.instrumentManager.setActiveInstrument(instrument);
                
                // Play test sound
                this.playTestSound(instrument);
            });
        });
    }
    
    /**
     * Setup genre selection
     */
    setupGenreSelection() {
        const genreSelect = document.getElementById('genreSelect');
        
        if (genreSelect) {
            genreSelect.addEventListener('change', (e) => {
                const genre = e.target.value;
                this.applyGenrePreset(genre);
            });
        }
    }
    
    /**
     * Setup project library
     */
    setupProjectLibrary() {
        this.renderProjectLibrary();
    }
    
    /**
     * Setup help section
     */
    setupHelpSection() {
        // Help section is static for now
        // Could be expanded with interactive tutorials
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Save project button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProject());
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportProject());
        }
        
        // Piano roll modal
        this.setupPianoRollModal();
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveProjectsToStorage();
        });
        
        // Audio context resume on user interaction
        document.addEventListener('click', () => {
            this.audioEngine.resumeContext();
        }, { once: true });
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for our shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveProject();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportProject();
                        break;
                }
            }
            
            // Spacebar for play/pause
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.togglePlayback();
            }
            
            // Escape to stop
            if (e.code === 'Escape') {
                this.sequencer.stop();
            }
        });
    }
    
    /**
     * Setup piano roll modal
     */
    setupPianoRollModal() {
        const modal = document.getElementById('pianoRollModal');
        const closeBtn = document.getElementById('closePianoRoll');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Close modal on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }
    
    /**
     * Play test sound for instrument
     */
    playTestSound(instrument) {
        const testNotes = {
            piano: 'C4',
            drums: 'C4',
            guitar: 'E4',
            bass: 'C3',
            synth: 'C5',
            strings: 'A4'
        };
        
        const note = testNotes[instrument] || 'C4';
        this.instrumentManager.playNote(note, 0.6, 0.5);
    }
    
    /**
     * Apply genre preset
     */
    applyGenrePreset(genre) {
        const presets = {
            pop: {
                bpm: 120,
                instruments: ['piano', 'drums', 'bass', 'synth'],
                effects: {
                    reverb: { enabled: true, wet: 0.3 },
                    delay: { enabled: false },
                    distortion: { enabled: false },
                    filter: { enabled: false }
                }
            },
            rock: {
                bpm: 140,
                instruments: ['guitar', 'drums', 'bass'],
                effects: {
                    reverb: { enabled: true, wet: 0.2 },
                    delay: { enabled: true, time: 0.2, feedback: 0.3 },
                    distortion: { enabled: true, amount: 0.3 },
                    filter: { enabled: false }
                }
            },
            electronic: {
                bpm: 128,
                instruments: ['synth', 'drums', 'bass'],
                effects: {
                    reverb: { enabled: true, wet: 0.4 },
                    delay: { enabled: true, time: 0.3, feedback: 0.5 },
                    distortion: { enabled: false },
                    filter: { enabled: true, frequency: 800, type: 'lowpass' }
                }
            },
            jazz: {
                bpm: 100,
                instruments: ['piano', 'drums', 'bass', 'strings'],
                effects: {
                    reverb: { enabled: true, wet: 0.5 },
                    delay: { enabled: false },
                    distortion: { enabled: false },
                    filter: { enabled: false }
                }
            },
            'hip-hop': {
                bpm: 90,
                instruments: ['drums', 'bass', 'synth'],
                effects: {
                    reverb: { enabled: false },
                    delay: { enabled: true, time: 0.1, feedback: 0.2 },
                    distortion: { enabled: true, amount: 0.1 },
                    filter: { enabled: true, frequency: 600, type: 'lowpass' }
                }
            },
            classical: {
                bpm: 80,
                instruments: ['piano', 'strings'],
                effects: {
                    reverb: { enabled: true, wet: 0.6 },
                    delay: { enabled: false },
                    distortion: { enabled: false },
                    filter: { enabled: false }
                }
            },
            ambient: {
                bpm: 60,
                instruments: ['synth', 'strings'],
                effects: {
                    reverb: { enabled: true, wet: 0.8 },
                    delay: { enabled: true, time: 0.5, feedback: 0.7 },
                    distortion: { enabled: false },
                    filter: { enabled: true, frequency: 400, type: 'lowpass' }
                }
            }
        };
        
        const preset = presets[genre];
        if (!preset) return;
        
        // Apply BPM
        this.sequencer.setBPM(preset.bpm);
        const bpmSlider = document.getElementById('bpmSlider');
        const bpmValue = document.getElementById('bpmValue');
        if (bpmSlider && bpmValue) {
            bpmSlider.value = preset.bpm;
            bpmValue.textContent = preset.bpm;
        }
        
        // Apply effects
        Object.keys(preset.effects).forEach(effectName => {
            const effect = preset.effects[effectName];
            this.effectsManager.setEffectParams(effectName, effect);
            
            // Update UI
            const checkbox = document.querySelector(`input[data-effect="${effectName}"]`);
            if (checkbox) {
                checkbox.checked = effect.enabled;
            }
        });
        
        console.log(`Applied ${genre} preset`);
    }
    
    /**
     * Toggle playback
     */
    togglePlayback() {
        if (this.sequencer.isPlaying) {
            this.sequencer.pause();
        } else {
            this.sequencer.play();
        }
    }
    
    /**
     * Save project
     */
    saveProject() {
        const projectName = prompt('Enter project name:', this.currentProject?.name || 'Untitled Project');
        if (!projectName) return;
        
        const projectData = {
            id: this.currentProject?.id || this.generateId(),
            name: projectName,
            createdAt: this.currentProject?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sequencerData: this.sequencer.getSequencerData(),
            effectsData: this.effectsManager.getEffectsData(),
            settings: {
                bpm: this.sequencer.getBPM(),
                masterVolume: this.audioEngine.getMasterVolume()
            }
        };
        
        // Update or add project
        const existingIndex = this.projects.findIndex(p => p.id === projectData.id);
        if (existingIndex >= 0) {
            this.projects[existingIndex] = projectData;
        } else {
            this.projects.push(projectData);
        }
        
        this.currentProject = projectData;
        this.saveProjectsToStorage();
        this.renderProjectLibrary();
        
        this.showSuccess(`Project "${projectName}" saved successfully!`);
    }
    
    /**
     * Export project
     */
    async exportProject() {
        if (!this.currentProject) {
            this.showError('No project to export. Please create and save a project first.');
            return;
        }
        
        try {
            this.showLoadingOverlay('Exporting project...');
            
            // For now, export as JSON
            // In a full implementation, this would render audio and export as WAV/MP3
            const exportData = {
                project: this.currentProject,
                exportDate: new Date().toISOString(),
                format: 'json'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentProject.name}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.hideLoadingOverlay();
            this.showSuccess('Project exported successfully!');
            
        } catch (error) {
            this.hideLoadingOverlay();
            console.error('Export failed:', error);
            this.showError('Failed to export project. Please try again.');
        }
    }
    
    /**
     * Load project
     */
    loadProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        try {
            // Load sequencer data
            if (project.sequencerData) {
                this.sequencer.loadSequencerData(project.sequencerData);
            }
            
            // Load effects data
            if (project.effectsData) {
                this.effectsManager.loadEffectsData(project.effectsData);
            }
            
            // Load settings
            if (project.settings) {
                if (project.settings.bpm) {
                    this.sequencer.setBPM(project.settings.bpm);
                }
                if (project.settings.masterVolume) {
                    this.audioEngine.setMasterVolume(project.settings.masterVolume);
                }
            }
            
            this.currentProject = project;
            this.showSuccess(`Project "${project.name}" loaded successfully!`);
            
        } catch (error) {
            console.error('Failed to load project:', error);
            this.showError('Failed to load project. Please try again.');
        }
    }
    
    /**
     * Delete project
     */
    deleteProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjectsToStorage();
            this.renderProjectLibrary();
            
            if (this.currentProject?.id === projectId) {
                this.currentProject = null;
            }
            
            this.showSuccess('Project deleted successfully!');
        }
    }
    
    /**
     * Render project library
     */
    renderProjectLibrary() {
        const projectGrid = document.getElementById('projectGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!projectGrid || !emptyState) return;
        
        if (this.projects.length === 0) {
            projectGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        projectGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        projectGrid.innerHTML = this.projects.map(project => `
            <div class="project-card" data-project-id="${project.id}">
                <h3>${project.name}</h3>
                <p>Last updated: ${new Date(project.updatedAt).toLocaleDateString()}</p>
                <div class="project-meta">
                    <span>BPM: ${project.settings?.bpm || 120}</span>
                    <div class="project-actions">
                        <button class="btn btn-sm" onclick="app.loadProject('${project.id}')">
                            <i class="fas fa-play"></i> Load
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteProject('${project.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Load projects from storage
     */
    loadProjects() {
        try {
            const stored = localStorage.getItem('musicflow-projects');
            if (stored) {
                this.projects = JSON.parse(stored);
                this.renderProjectLibrary();
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.projects = [];
        }
    }
    
    /**
     * Save projects to storage
     */
    saveProjectsToStorage() {
        try {
            localStorage.setItem('musicflow-projects', JSON.stringify(this.projects));
        } catch (error) {
            console.error('Failed to save projects:', error);
        }
    }
    
    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Show loading overlay
     */
    showLoadingOverlay(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            const messageElement = overlay.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            overlay.classList.add('active');
        }
    }
    
    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
    
    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        setTimeout(() => {
            this.showSuccess('Welcome to MusicFlow! Start creating your musical masterpiece.');
        }, 1000);
    }
    
    /**
     * Cleanup
     */
    dispose() {
        if (this.sequencer) {
            this.sequencer.dispose();
        }
        
        if (this.effectsManager) {
            this.effectsManager.dispose();
        }
        
        if (this.audioEngine) {
            this.audioEngine.dispose();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MusicFlowApp();
});

// Export for global access
window.MusicFlowApp = MusicFlowApp;
