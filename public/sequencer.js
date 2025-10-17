/**
 * MusicFlow Sequencer
 * Professional step sequencer with timeline and pattern editing
 * Supports multiple tracks, patterns, and real-time playback
 */

class Sequencer {
    constructor(audioEngine, instrumentManager) {
        this.audioEngine = audioEngine;
        this.instrumentManager = instrumentManager;
        
        // Sequencer settings
        this.bpm = 120;
        this.stepsPerBeat = 4;
        this.totalSteps = 16;
        this.currentStep = 0;
        this.isPlaying = false;
        this.isRecording = false;
        
        // Timing
        this.stepDuration = 60 / (this.bpm * this.stepsPerBeat);
        this.nextStepTime = 0;
        this.schedulerInterval = null;
        
        // Tracks and patterns
        this.tracks = [];
        this.patterns = new Map();
        this.activePattern = null;
        
        // UI elements
        this.tracksContainer = null;
        this.mixerChannels = null;
        
        // Initialize sequencer
        this.init();
    }
    
    /**
     * Initialize sequencer
     */
    init() {
        this.createDefaultTracks();
        this.createDefaultPattern();
        this.setupUI();
        this.setupEventListeners();
    }
    
    /**
     * Create default tracks
     */
    createDefaultTracks() {
        const defaultTracks = [
            { id: 'track-1', name: 'Piano', instrument: 'piano', volume: 0.8, muted: false, solo: false },
            { id: 'track-2', name: 'Drums', instrument: 'drums', volume: 0.9, muted: false, solo: false },
            { id: 'track-3', name: 'Bass', instrument: 'bass', volume: 0.7, muted: false, solo: false },
            { id: 'track-4', name: 'Synth', instrument: 'synth', volume: 0.6, muted: false, solo: false }
        ];
        
        this.tracks = defaultTracks.map(track => ({
            ...track,
            pattern: this.createEmptyPattern()
        }));
    }
    
    /**
     * Create empty pattern
     */
    createEmptyPattern() {
        const pattern = [];
        for (let i = 0; i < this.totalSteps; i++) {
            pattern.push({
                active: false,
                velocity: 0.8,
                note: 'C4',
                duration: 1
            });
        }
        return pattern;
    }
    
    /**
     * Create default pattern
     */
    createDefaultPattern() {
        const patternId = 'default-pattern';
        const pattern = {
            id: patternId,
            name: 'Default Pattern',
            tracks: {}
        };
        
        // Add default patterns for each track
        this.tracks.forEach(track => {
            pattern.tracks[track.id] = this.createEmptyPattern();
        });
        
        this.patterns.set(patternId, pattern);
        this.activePattern = patternId;
    }
    
    /**
     * Setup UI elements
     */
    setupUI() {
        this.tracksContainer = document.getElementById('tracksContainer');
        this.mixerChannels = document.getElementById('mixerChannels');
        
        if (this.tracksContainer) {
            this.renderTracks();
        }
        
        if (this.mixerChannels) {
            this.renderMixer();
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Transport controls
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const recordBtn = document.getElementById('recordBtn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.play());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }
        
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecord());
        }
        
        // BPM control
        const bpmSlider = document.getElementById('bpmSlider');
        const bpmValue = document.getElementById('bpmValue');
        
        if (bpmSlider && bpmValue) {
            bpmSlider.addEventListener('input', (e) => {
                this.setBPM(parseInt(e.target.value));
                bpmValue.textContent = e.target.value;
            });
        }
        
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                this.audioEngine.setMasterVolume(volume);
                volumeValue.textContent = e.target.value + '%';
            });
        }
    }
    
    /**
     * Render tracks in UI
     */
    renderTracks() {
        if (!this.tracksContainer) return;
        
        this.tracksContainer.innerHTML = '';
        
        this.tracks.forEach(track => {
            const trackElement = this.createTrackElement(track);
            this.tracksContainer.appendChild(trackElement);
        });
    }
    
    /**
     * Create track element
     */
    createTrackElement(track) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track';
        trackDiv.dataset.trackId = track.id;
        
        const pattern = this.getPatternForTrack(track.id);
        
        trackDiv.innerHTML = `
            <div class="track-name">${track.name}</div>
            <div class="track-instrument">${track.instrument}</div>
            <div class="track-volume">
                <input type="range" min="0" max="100" value="${track.volume * 100}" 
                       data-track="${track.id}" data-param="volume">
                <span>${Math.round(track.volume * 100)}%</span>
            </div>
            <button class="track-mute ${track.muted ? 'active' : ''}" 
                    data-track="${track.id}" data-action="mute">
                <i class="fas fa-volume-mute"></i>
            </button>
            <button class="track-solo ${track.solo ? 'active' : ''}" 
                    data-track="${track.id}" data-action="solo">
                <i class="fas fa-headphones"></i>
            </button>
            <div class="track-pattern">
                ${this.createPatternSteps(pattern)}
            </div>
        `;
        
        // Add event listeners
        this.addTrackEventListeners(trackDiv, track);
        
        return trackDiv;
    }
    
    /**
     * Create pattern steps
     */
    createPatternSteps(pattern) {
        return pattern.map((step, index) => `
            <div class="pattern-step ${step.active ? 'active' : ''}" 
                 data-step="${index}" 
                 data-velocity="${step.velocity}"
                 data-note="${step.note}">
            </div>
        `).join('');
    }
    
    /**
     * Add event listeners to track
     */
    addTrackEventListeners(trackElement, track) {
        // Volume slider
        const volumeSlider = trackElement.querySelector('input[data-param="volume"]');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                this.setTrackVolume(track.id, volume);
                e.target.nextElementSibling.textContent = e.target.value + '%';
            });
        }
        
        // Mute button
        const muteBtn = trackElement.querySelector('[data-action="mute"]');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.toggleTrackMute(track.id);
            });
        }
        
        // Solo button
        const soloBtn = trackElement.querySelector('[data-action="solo"]');
        if (soloBtn) {
            soloBtn.addEventListener('click', () => {
                this.toggleTrackSolo(track.id);
            });
        }
        
        // Pattern steps
        const patternSteps = trackElement.querySelectorAll('.pattern-step');
        patternSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                this.toggleStep(track.id, index);
            });
            
            step.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showStepContextMenu(e, track.id, index);
            });
        });
    }
    
    /**
     * Render mixer
     */
    renderMixer() {
        if (!this.mixerChannels) return;
        
        this.mixerChannels.innerHTML = '';
        
        this.tracks.forEach(track => {
            const channelElement = this.createMixerChannel(track);
            this.mixerChannels.appendChild(channelElement);
        });
    }
    
    /**
     * Create mixer channel
     */
    createMixerChannel(track) {
        const channelDiv = document.createElement('div');
        channelDiv.className = 'mixer-channel';
        
        channelDiv.innerHTML = `
            <div class="mixer-channel-name">${track.name}</div>
            <div class="mixer-channel-fader">
                <input type="range" min="0" max="100" value="${track.volume * 100}" 
                       orient="vertical" data-track="${track.id}" data-param="volume">
                <span>${Math.round(track.volume * 100)}</span>
            </div>
        `;
        
        // Add event listener
        const fader = channelDiv.querySelector('input[data-param="volume"]');
        if (fader) {
            fader.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                this.setTrackVolume(track.id, volume);
                e.target.nextElementSibling.textContent = e.target.value;
            });
        }
        
        return channelDiv;
    }
    
    /**
     * Set BPM
     */
    setBPM(bpm) {
        this.bpm = Math.max(60, Math.min(200, bpm));
        this.stepDuration = 60 / (this.bpm * this.stepsPerBeat);
    }
    
    /**
     * Get BPM
     */
    getBPM() {
        return this.bpm;
    }
    
    /**
     * Set track volume
     */
    setTrackVolume(trackId, volume) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.volume = Math.max(0, Math.min(1, volume));
        }
    }
    
    /**
     * Toggle track mute
     */
    toggleTrackMute(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.muted = !track.muted;
            this.updateTrackUI(trackId);
        }
    }
    
    /**
     * Toggle track solo
     */
    toggleTrackSolo(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.solo = !track.solo;
            
            // If this track is soloed, mute all others
            if (track.solo) {
                this.tracks.forEach(t => {
                    if (t.id !== trackId) {
                        t.muted = true;
                    }
                });
            } else {
                // If unsoloing, unmute all tracks
                this.tracks.forEach(t => {
                    t.muted = false;
                });
            }
            
            this.updateAllTrackUI();
        }
    }
    
    /**
     * Update track UI
     */
    updateTrackUI(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (!track) return;
        
        // Update track element
        const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
        if (trackElement) {
            const muteBtn = trackElement.querySelector('[data-action="mute"]');
            const soloBtn = trackElement.querySelector('[data-action="solo"]');
            
            if (muteBtn) {
                muteBtn.classList.toggle('active', track.muted);
            }
            
            if (soloBtn) {
                soloBtn.classList.toggle('active', track.solo);
            }
        }
    }
    
    /**
     * Update all track UI
     */
    updateAllTrackUI() {
        this.tracks.forEach(track => {
            this.updateTrackUI(track.id);
        });
    }
    
    /**
     * Toggle step
     */
    toggleStep(trackId, stepIndex) {
        const pattern = this.getPatternForTrack(trackId);
        if (pattern && pattern[stepIndex]) {
            pattern[stepIndex].active = !pattern[stepIndex].active;
            this.updateStepUI(trackId, stepIndex);
        }
    }
    
    /**
     * Update step UI
     */
    updateStepUI(trackId, stepIndex) {
        const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
        if (trackElement) {
            const stepElement = trackElement.querySelector(`[data-step="${stepIndex}"]`);
            if (stepElement) {
                const pattern = this.getPatternForTrack(trackId);
                if (pattern && pattern[stepIndex]) {
                    stepElement.classList.toggle('active', pattern[stepIndex].active);
                }
            }
        }
    }
    
    /**
     * Get pattern for track
     */
    getPatternForTrack(trackId) {
        const pattern = this.patterns.get(this.activePattern);
        if (pattern && pattern.tracks) {
            return pattern.tracks[trackId] || this.createEmptyPattern();
        }
        return this.createEmptyPattern();
    }
    
    /**
     * Show step context menu
     */
    showStepContextMenu(event, trackId, stepIndex) {
        // Create context menu
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="set-note">Set Note</div>
            <div class="context-menu-item" data-action="set-velocity">Set Velocity</div>
            <div class="context-menu-item" data-action="clear-step">Clear Step</div>
        `;
        
        document.body.appendChild(contextMenu);
        
        // Position menu
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.zIndex = '1000';
        
        // Add event listeners
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleStepContextAction(action, trackId, stepIndex);
            document.body.removeChild(contextMenu);
        });
        
        // Remove menu on click outside
        setTimeout(() => {
            document.addEventListener('click', function removeMenu() {
                if (document.body.contains(contextMenu)) {
                    document.body.removeChild(contextMenu);
                }
                document.removeEventListener('click', removeMenu);
            });
        }, 0);
    }
    
    /**
     * Handle step context action
     */
    handleStepContextAction(action, trackId, stepIndex) {
        const pattern = this.getPatternForTrack(trackId);
        if (!pattern || !pattern[stepIndex]) return;
        
        switch (action) {
            case 'set-note':
                this.promptForNote(trackId, stepIndex);
                break;
            case 'set-velocity':
                this.promptForVelocity(trackId, stepIndex);
                break;
            case 'clear-step':
                pattern[stepIndex].active = false;
                this.updateStepUI(trackId, stepIndex);
                break;
        }
    }
    
    /**
     * Prompt for note
     */
    promptForNote(trackId, stepIndex) {
        const note = prompt('Enter note (e.g., C4, D#5):', 'C4');
        if (note) {
            const pattern = this.getPatternForTrack(trackId);
            if (pattern && pattern[stepIndex]) {
                pattern[stepIndex].note = note;
                this.updateStepUI(trackId, stepIndex);
            }
        }
    }
    
    /**
     * Prompt for velocity
     */
    promptForVelocity(trackId, stepIndex) {
        const velocity = parseFloat(prompt('Enter velocity (0.0 - 1.0):', '0.8'));
        if (velocity >= 0 && velocity <= 1) {
            const pattern = this.getPatternForTrack(trackId);
            if (pattern && pattern[stepIndex]) {
                pattern[stepIndex].velocity = velocity;
                this.updateStepUI(trackId, stepIndex);
            }
        }
    }
    
    /**
     * Play sequencer
     */
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextStepTime = this.audioEngine.getCurrentTime();
        
        // Start audio engine playback
        this.audioEngine.startPlayback();
        
        // Start scheduler
        this.startScheduler();
        
        // Update UI
        this.updateTransportUI();
    }
    
    /**
     * Pause sequencer
     */
    pause() {
        this.isPlaying = false;
        this.audioEngine.pausePlayback();
        this.stopScheduler();
        this.updateTransportUI();
    }
    
    /**
     * Stop sequencer
     */
    stop() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.audioEngine.stopPlayback();
        this.stopScheduler();
        this.updateTransportUI();
        this.updateStepIndicators();
    }
    
    /**
     * Toggle record
     */
    toggleRecord() {
        this.isRecording = !this.isRecording;
        this.updateTransportUI();
    }
    
    /**
     * Start scheduler
     */
    startScheduler() {
        this.schedulerInterval = setInterval(() => {
            this.scheduleSteps();
        }, 10); // Check every 10ms
    }
    
    /**
     * Stop scheduler
     */
    stopScheduler() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
    }
    
    /**
     * Schedule steps
     */
    scheduleSteps() {
        const currentTime = this.audioEngine.getCurrentTime();
        
        while (this.nextStepTime <= currentTime + 0.1) { // Look ahead 100ms
            this.playStep(this.currentStep);
            this.currentStep = (this.currentStep + 1) % this.totalSteps;
            this.nextStepTime += this.stepDuration;
        }
    }
    
    /**
     * Play step
     */
    playStep(stepIndex) {
        this.tracks.forEach(track => {
            if (track.muted) return;
            
            const pattern = this.getPatternForTrack(track.id);
            if (pattern && pattern[stepIndex] && pattern[stepIndex].active) {
                const step = pattern[stepIndex];
                
                // Set active instrument
                this.instrumentManager.setActiveInstrument(track.instrument);
                
                // Play note
                this.instrumentManager.playNote(
                    step.note,
                    step.velocity,
                    this.stepDuration * step.duration
                );
            }
        });
        
        // Update step indicators
        this.updateStepIndicators();
    }
    
    /**
     * Update step indicators
     */
    updateStepIndicators() {
        // Remove playing class from all steps
        document.querySelectorAll('.pattern-step').forEach(step => {
            step.classList.remove('playing');
        });
        
        // Add playing class to current step
        document.querySelectorAll('.track').forEach(trackElement => {
            const stepElement = trackElement.querySelector(`[data-step="${this.currentStep}"]`);
            if (stepElement) {
                stepElement.classList.add('playing');
            }
        });
    }
    
    /**
     * Update transport UI
     */
    updateTransportUI() {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const recordBtn = document.getElementById('recordBtn');
        
        if (playBtn) {
            playBtn.classList.toggle('active', this.isPlaying);
        }
        
        if (pauseBtn) {
            pauseBtn.classList.toggle('active', !this.isPlaying && this.currentStep > 0);
        }
        
        if (stopBtn) {
            stopBtn.classList.toggle('active', this.currentStep > 0);
        }
        
        if (recordBtn) {
            recordBtn.classList.toggle('recording', this.isRecording);
        }
    }
    
    /**
     * Get sequencer data for saving
     */
    getSequencerData() {
        return {
            bpm: this.bpm,
            stepsPerBeat: this.stepsPerBeat,
            totalSteps: this.totalSteps,
            tracks: this.tracks,
            patterns: Array.from(this.patterns.entries()),
            activePattern: this.activePattern
        };
    }
    
    /**
     * Load sequencer data
     */
    loadSequencerData(data) {
        if (data.bpm) this.setBPM(data.bpm);
        if (data.tracks) this.tracks = data.tracks;
        if (data.patterns) this.patterns = new Map(data.patterns);
        if (data.activePattern) this.activePattern = data.activePattern;
        
        // Update UI
        this.renderTracks();
        this.renderMixer();
        
        // Update controls
        const bpmSlider = document.getElementById('bpmSlider');
        const bpmValue = document.getElementById('bpmValue');
        if (bpmSlider && bpmValue) {
            bpmSlider.value = this.bpm;
            bpmValue.textContent = this.bpm;
        }
    }
    
    /**
     * Cleanup
     */
    dispose() {
        this.stop();
        this.stopScheduler();
    }
}

// Export for use in other modules
window.Sequencer = Sequencer;
