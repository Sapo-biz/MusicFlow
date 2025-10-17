/**
 * MusicFlow Audio Engine
 * Professional audio engine using Web Audio API
 * Handles audio context, effects, and real-time audio processing
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.masterCompressor = null;
        this.masterLimiter = null;
        this.isInitialized = false;
        this.isPlaying = false;
        this.currentTime = 0;
        this.startTime = 0;
        this.animationFrame = null;
        
        // Audio nodes for effects
        this.effects = {
            reverb: null,
            delay: null,
            distortion: null,
            filter: null
        };
        
        // Effect parameters
        this.effectParams = {
            reverb: { wet: 0.2, roomSize: 0.8, damping: 0.3 },
            delay: { time: 0.3, feedback: 0.4, wet: 0.3 },
            distortion: { amount: 0.1, tone: 0.5 },
            filter: { frequency: 1000, resonance: 1, type: 'lowpass' }
        };
        
        // Master volume
        this.masterVolume = 0.8;
        
        // Initialize audio context
        this.initAudioContext();
    }
    
    /**
     * Initialize the Web Audio API context
     */
    async initAudioContext() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            
            // Create master compressor for better dynamics
            this.masterCompressor = this.audioContext.createDynamicsCompressor();
            this.masterCompressor.threshold.value = -24;
            this.masterCompressor.knee.value = 30;
            this.masterCompressor.ratio.value = 12;
            this.masterCompressor.attack.value = 0.003;
            this.masterCompressor.release.value = 0.25;
            
            // Create master limiter
            this.masterLimiter = this.audioContext.createDynamicsCompressor();
            this.masterLimiter.threshold.value = -1;
            this.masterLimiter.knee.value = 0;
            this.masterLimiter.ratio.value = 20;
            this.masterLimiter.attack.value = 0.001;
            this.masterLimiter.release.value = 0.01;
            
            // Connect the audio chain
            this.masterGain.connect(this.masterCompressor);
            this.masterCompressor.connect(this.masterLimiter);
            this.masterLimiter.connect(this.audioContext.destination);
            
            // Initialize effects
            this.initEffects();
            
            this.isInitialized = true;
            console.log('Audio engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw error;
        }
    }
    
    /**
     * Initialize audio effects
     */
    initEffects() {
        // Reverb effect using convolution
        this.effects.reverb = this.audioContext.createConvolver();
        this.createReverbImpulse();
        
        // Delay effect
        this.effects.delay = this.audioContext.createDelay(1.0);
        this.effects.delay.delayTime.value = this.effectParams.delay.time;
        
        const delayGain = this.audioContext.createGain();
        delayGain.gain.value = this.effectParams.delay.feedback;
        this.effects.delay.connect(delayGain);
        delayGain.connect(this.effects.delay);
        
        const delayWetGain = this.audioContext.createGain();
        delayWetGain.gain.value = this.effectParams.delay.wet;
        this.effects.delay.connect(delayWetGain);
        
        // Distortion effect
        this.effects.distortion = this.audioContext.createWaveShaper();
        this.createDistortionCurve();
        
        // Filter effect
        this.effects.filter = this.audioContext.createBiquadFilter();
        this.effects.filter.type = this.effectParams.filter.type;
        this.effects.filter.frequency.value = this.effectParams.filter.frequency;
        this.effects.filter.Q.value = this.effectParams.filter.resonance;
    }
    
    /**
     * Create reverb impulse response
     */
    createReverbImpulse() {
        const length = this.audioContext.sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = length - i;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, 2);
            }
        }
        
        this.effects.reverb.buffer = impulse;
    }
    
    /**
     * Create distortion curve
     */
    createDistortionCurve() {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        const amount = this.effectParams.distortion.amount;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount * 100) * x * 20 * deg) / (Math.PI + amount * 100 * Math.abs(x));
        }
        
        this.effects.distortion.curve = curve;
        this.effects.distortion.oversample = '4x';
    }
    
    /**
     * Resume audio context (required for user interaction)
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.masterVolume, this.audioContext.currentTime, 0.01);
        }
    }
    
    /**
     * Get master volume
     */
    getMasterVolume() {
        return this.masterVolume;
    }
    
    /**
     * Update effect parameters
     */
    updateEffectParam(effect, param, value) {
        if (!this.effects[effect]) return;
        
        this.effectParams[effect][param] = value;
        
        switch (effect) {
            case 'reverb':
                if (param === 'wet') {
                    // Update reverb wet/dry mix
                    // This would require a more complex routing setup
                }
                break;
                
            case 'delay':
                if (param === 'time' && this.effects.delay) {
                    this.effects.delay.delayTime.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
                } else if (param === 'feedback') {
                    // Update delay feedback gain
                } else if (param === 'wet') {
                    // Update delay wet gain
                }
                break;
                
            case 'distortion':
                if (param === 'amount') {
                    this.createDistortionCurve();
                }
                break;
                
            case 'filter':
                if (param === 'frequency' && this.effects.filter) {
                    this.effects.filter.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
                } else if (param === 'resonance' && this.effects.filter) {
                    this.effects.filter.Q.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
                }
                break;
        }
    }
    
    /**
     * Connect effect to audio chain
     */
    connectEffect(effect, input, output) {
        if (!this.effects[effect]) return;
        
        // Disconnect existing connections
        input.disconnect();
        
        // Connect through effect
        input.connect(this.effects[effect]);
        this.effects[effect].connect(output);
    }
    
    /**
     * Bypass effect
     */
    bypassEffect(effect, input, output) {
        if (!this.effects[effect]) return;
        
        // Disconnect effect
        input.disconnect(this.effects[effect]);
        
        // Direct connection
        input.connect(output);
    }
    
    /**
     * Create oscillator for testing
     */
    createOscillator(frequency = 440, type = 'sine') {
        if (!this.isInitialized) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        return { oscillator, gainNode };
    }
    
    /**
     * Play a test tone
     */
    playTestTone(frequency = 440, duration = 0.5) {
        const { oscillator, gainNode } = this.createOscillator(frequency);
        
        if (!oscillator) return;
        
        const now = this.audioContext.currentTime;
        
        // Fade in
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        
        // Fade out
        gainNode.gain.linearRampToValueAtTime(0, now + duration - 0.01);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    /**
     * Get current time
     */
    getCurrentTime() {
        if (!this.audioContext) return 0;
        return this.audioContext.currentTime;
    }
    
    /**
     * Get sample rate
     */
    getSampleRate() {
        if (!this.audioContext) return 44100;
        return this.audioContext.sampleRate;
    }
    
    /**
     * Create audio buffer from array
     */
    createBuffer(channelData, sampleRate = null) {
        if (!this.audioContext) return null;
        
        const sr = sampleRate || this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, channelData.length, sr);
        buffer.getChannelData(0).set(channelData);
        
        return buffer;
    }
    
    /**
     * Play audio buffer
     */
    playBuffer(buffer, startTime = null, offset = 0, duration = null) {
        if (!this.audioContext || !buffer) return null;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = startTime || this.audioContext.currentTime;
        const dur = duration || buffer.duration - offset;
        
        source.start(now, offset, dur);
        
        return { source, gainNode };
    }
    
    /**
     * Create gain node
     */
    createGainNode() {
        if (!this.audioContext) return null;
        return this.audioContext.createGain();
    }
    
    /**
     * Create biquad filter
     */
    createFilter(type = 'lowpass', frequency = 1000, Q = 1) {
        if (!this.audioContext) return null;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = Q;
        
        return filter;
    }
    
    /**
     * Create delay node
     */
    createDelay(maxDelayTime = 1.0) {
        if (!this.audioContext) return null;
        return this.audioContext.createDelay(maxDelayTime);
    }
    
    /**
     * Create compressor
     */
    createCompressor(threshold = -24, knee = 30, ratio = 12, attack = 0.003, release = 0.25) {
        if (!this.audioContext) return null;
        
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = threshold;
        compressor.knee.value = knee;
        compressor.ratio.value = ratio;
        compressor.attack.value = attack;
        compressor.release.value = release;
        
        return compressor;
    }
    
    /**
     * Create analyser for visualization
     */
    createAnalyser(fftSize = 2048) {
        if (!this.audioContext) return null;
        
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        
        return analyser;
    }
    
    /**
     * Get frequency data for visualization
     */
    getFrequencyData(analyser) {
        if (!analyser) return null;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        return dataArray;
    }
    
    /**
     * Get time domain data for visualization
     */
    getTimeDomainData(analyser) {
        if (!analyser) return null;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        
        return dataArray;
    }
    
    /**
     * Start playback
     */
    startPlayback() {
        if (!this.isInitialized) return;
        
        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime;
        this.currentTime = 0;
        
        // Start animation loop for UI updates
        this.animationLoop();
    }
    
    /**
     * Stop playback
     */
    stopPlayback() {
        this.isPlaying = false;
        this.currentTime = 0;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    /**
     * Pause playback
     */
    pausePlayback() {
        this.isPlaying = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    /**
     * Animation loop for UI updates
     */
    animationLoop() {
        if (!this.isPlaying) return;
        
        this.currentTime = this.audioContext.currentTime - this.startTime;
        
        // Update UI
        this.updateTimeDisplay();
        
        this.animationFrame = requestAnimationFrame(() => this.animationLoop());
    }
    
    /**
     * Update time display
     */
    updateTimeDisplay() {
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            const minutes = Math.floor(this.currentTime / 60);
            const seconds = Math.floor(this.currentTime % 60);
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        this.stopPlayback();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isInitialized = false;
    }
}

// Export for use in other modules
window.AudioEngine = AudioEngine;
