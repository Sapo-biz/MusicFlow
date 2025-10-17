/**
 * MusicFlow Effects
 * Professional audio effects processing
 * Includes reverb, delay, distortion, filter, and more
 */

class EffectsManager {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.effects = new Map();
        this.effectChains = new Map();
        this.globalEffects = {
            reverb: { enabled: false, wet: 0.2, roomSize: 0.8, damping: 0.3 },
            delay: { enabled: false, time: 0.3, feedback: 0.4, wet: 0.3 },
            distortion: { enabled: false, amount: 0.1, tone: 0.5 },
            filter: { enabled: false, frequency: 1000, resonance: 1, type: 'lowpass' }
        };
        
        this.initEffects();
        this.setupEventListeners();
    }
    
    /**
     * Initialize effects
     */
    initEffects() {
        // Initialize global effects
        this.createGlobalReverb();
        this.createGlobalDelay();
        this.createGlobalDistortion();
        this.createGlobalFilter();
        
        // Setup effect routing
        this.setupEffectRouting();
    }
    
    /**
     * Create global reverb
     */
    createGlobalReverb() {
        const reverb = this.audioEngine.audioContext.createConvolver();
        const reverbGain = this.audioEngine.audioContext.createGain();
        const dryGain = this.audioEngine.audioContext.createGain();
        const wetGain = this.audioEngine.audioContext.createGain();
        
        // Create reverb impulse response
        this.createReverbImpulse(reverb);
        
        // Setup routing
        reverbGain.connect(reverb);
        reverb.connect(wetGain);
        
        // Set initial values
        reverbGain.gain.value = 0.8;
        dryGain.gain.value = 0.8;
        wetGain.gain.value = this.globalEffects.reverb.wet;
        
        this.effects.set('reverb', {
            convolver: reverb,
            inputGain: reverbGain,
            dryGain: dryGain,
            wetGain: wetGain,
            enabled: false
        });
    }
    
    /**
     * Create global delay
     */
    createGlobalDelay() {
        const delay = this.audioEngine.audioContext.createDelay(1.0);
        const delayGain = this.audioEngine.audioContext.createGain();
        const feedbackGain = this.audioEngine.audioContext.createGain();
        const wetGain = this.audioEngine.audioContext.createGain();
        const dryGain = this.audioEngine.audioContext.createGain();
        
        // Setup delay routing
        delayGain.connect(delay);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        delay.connect(wetGain);
        
        // Set initial values
        delay.delayTime.value = this.globalEffects.delay.time;
        feedbackGain.gain.value = this.globalEffects.delay.feedback;
        wetGain.gain.value = this.globalEffects.delay.wet;
        dryGain.gain.value = 1 - this.globalEffects.delay.wet;
        
        this.effects.set('delay', {
            delay: delay,
            inputGain: delayGain,
            feedbackGain: feedbackGain,
            wetGain: wetGain,
            dryGain: dryGain,
            enabled: false
        });
    }
    
    /**
     * Create global distortion
     */
    createGlobalDistortion() {
        const distortion = this.audioEngine.audioContext.createWaveShaper();
        const distortionGain = this.audioEngine.audioContext.createGain();
        const toneFilter = this.audioEngine.audioContext.createBiquadFilter();
        
        // Create distortion curve
        this.createDistortionCurve(distortion);
        
        // Setup routing
        distortionGain.connect(distortion);
        distortion.connect(toneFilter);
        
        // Set initial values
        distortionGain.gain.value = 1;
        toneFilter.type = 'lowpass';
        toneFilter.frequency.value = 2000;
        toneFilter.Q.value = 1;
        
        this.effects.set('distortion', {
            waveshaper: distortion,
            inputGain: distortionGain,
            toneFilter: toneFilter,
            enabled: false
        });
    }
    
    /**
     * Create global filter
     */
    createGlobalFilter() {
        const filter = this.audioEngine.audioContext.createBiquadFilter();
        
        // Set initial values
        filter.type = this.globalEffects.filter.type;
        filter.frequency.value = this.globalEffects.filter.frequency;
        filter.Q.value = this.globalEffects.filter.resonance;
        
        this.effects.set('filter', {
            filter: filter,
            enabled: false
        });
    }
    
    /**
     * Create reverb impulse response
     */
    createReverbImpulse(convolver) {
        const sampleRate = this.audioEngine.getSampleRate();
        const length = sampleRate * 2; // 2 seconds
        const impulse = this.audioEngine.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = length - i;
                const decay = Math.pow(n / length, 2);
                const noise = (Math.random() * 2 - 1) * 0.1;
                channelData[i] = noise * decay;
            }
        }
        
        convolver.buffer = impulse;
    }
    
    /**
     * Create distortion curve
     */
    createDistortionCurve(waveshaper) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        const amount = this.globalEffects.distortion.amount;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount * 100) * x * 20 * deg) / (Math.PI + amount * 100 * Math.abs(x));
        }
        
        waveshaper.curve = curve;
        waveshaper.oversample = '4x';
    }
    
    /**
     * Setup effect routing
     */
    setupEffectRouting() {
        // Connect effects to master chain
        const masterGain = this.audioEngine.masterGain;
        const compressor = this.audioEngine.masterCompressor;
        
        // For now, effects are applied globally
        // In a more advanced implementation, effects could be applied per track
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Effect checkboxes
        document.querySelectorAll('input[data-effect]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const effect = e.target.dataset.effect;
                const enabled = e.target.checked;
                this.toggleEffect(effect, enabled);
            });
        });
        
        // Effect parameter sliders
        document.querySelectorAll('input[data-param]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const param = e.target.dataset.param;
                const value = parseFloat(e.target.value) / 100;
                this.updateEffectParam(param, value);
            });
        });
    }
    
    /**
     * Toggle effect
     */
    toggleEffect(effectName, enabled) {
        const effect = this.effects.get(effectName);
        if (!effect) return;
        
        effect.enabled = enabled;
        this.globalEffects[effectName].enabled = enabled;
        
        // Update effect routing based on enabled state
        this.updateEffectRouting();
        
        console.log(`${effectName} effect ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Update effect parameter
     */
    updateEffectParam(param, value) {
        const [effectName, paramName] = param.split('-');
        
        if (!this.globalEffects[effectName]) return;
        
        // Update parameter value
        this.globalEffects[effectName][paramName] = value;
        
        // Apply parameter to effect
        this.applyEffectParam(effectName, paramName, value);
    }
    
    /**
     * Apply effect parameter
     */
    applyEffectParam(effectName, paramName, value) {
        const effect = this.effects.get(effectName);
        if (!effect) return;
        
        switch (effectName) {
            case 'reverb':
                if (paramName === 'wet') {
                    effect.wetGain.gain.setTargetAtTime(value, this.audioEngine.audioContext.currentTime, 0.01);
                    effect.dryGain.gain.setTargetAtTime(1 - value, this.audioEngine.audioContext.currentTime, 0.01);
                }
                break;
                
            case 'delay':
                if (paramName === 'time') {
                    effect.delay.delayTime.setTargetAtTime(value, this.audioEngine.audioContext.currentTime, 0.01);
                } else if (paramName === 'feedback') {
                    effect.feedbackGain.gain.setTargetAtTime(value, this.audioEngine.audioContext.currentTime, 0.01);
                } else if (paramName === 'wet') {
                    effect.wetGain.gain.setTargetAtTime(value, this.audioEngine.audioContext.currentTime, 0.01);
                    effect.dryGain.gain.setTargetAtTime(1 - value, this.audioEngine.audioContext.currentTime, 0.01);
                }
                break;
                
            case 'distortion':
                if (paramName === 'amount') {
                    this.createDistortionCurve(effect.waveshaper);
                }
                break;
                
            case 'filter':
                if (paramName === 'freq') {
                    effect.filter.frequency.setTargetAtTime(value * 2000, this.audioEngine.audioContext.currentTime, 0.01);
                }
                break;
        }
    }
    
    /**
     * Update effect routing
     */
    updateEffectRouting() {
        // This would handle connecting/disconnecting effects in the audio chain
        // For now, effects are applied globally through the master chain
    }
    
    /**
     * Create track-specific effect chain
     */
    createTrackEffectChain(trackId) {
        const chain = {
            reverb: this.createReverb(),
            delay: this.createDelay(),
            distortion: this.createDistortion(),
            filter: this.createFilter(),
            compressor: this.createCompressor()
        };
        
        this.effectChains.set(trackId, chain);
        return chain;
    }
    
    /**
     * Create individual reverb
     */
    createReverb() {
        const reverb = this.audioEngine.audioContext.createConvolver();
        const reverbGain = this.audioEngine.audioContext.createGain();
        const wetGain = this.audioEngine.audioContext.createGain();
        const dryGain = this.audioEngine.audioContext.createGain();
        
        this.createReverbImpulse(reverb);
        
        reverbGain.connect(reverb);
        reverb.connect(wetGain);
        
        return {
            convolver: reverb,
            inputGain: reverbGain,
            wetGain: wetGain,
            dryGain: dryGain
        };
    }
    
    /**
     * Create individual delay
     */
    createDelay() {
        const delay = this.audioEngine.audioContext.createDelay(1.0);
        const delayGain = this.audioEngine.audioContext.createGain();
        const feedbackGain = this.audioEngine.audioContext.createGain();
        const wetGain = this.audioEngine.audioContext.createGain();
        const dryGain = this.audioEngine.audioContext.createGain();
        
        delayGain.connect(delay);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        delay.connect(wetGain);
        
        return {
            delay: delay,
            inputGain: delayGain,
            feedbackGain: feedbackGain,
            wetGain: wetGain,
            dryGain: dryGain
        };
    }
    
    /**
     * Create individual distortion
     */
    createDistortion() {
        const distortion = this.audioEngine.audioContext.createWaveShaper();
        const distortionGain = this.audioEngine.audioContext.createGain();
        const toneFilter = this.audioEngine.audioContext.createBiquadFilter();
        
        this.createDistortionCurve(distortion);
        
        distortionGain.connect(distortion);
        distortion.connect(toneFilter);
        
        return {
            waveshaper: distortion,
            inputGain: distortionGain,
            toneFilter: toneFilter
        };
    }
    
    /**
     * Create individual filter
     */
    createFilter() {
        const filter = this.audioEngine.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        
        return { filter: filter };
    }
    
    /**
     * Create individual compressor
     */
    createCompressor() {
        const compressor = this.audioEngine.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        
        return { compressor: compressor };
    }
    
    /**
     * Apply effect to audio node
     */
    applyEffectToNode(effectName, inputNode, outputNode, trackId = null) {
        const effect = trackId ? 
            this.effectChains.get(trackId)?.[effectName] : 
            this.effects.get(effectName);
            
        if (!effect || !effect.enabled) {
            inputNode.connect(outputNode);
            return;
        }
        
        // Connect through effect
        switch (effectName) {
            case 'reverb':
                inputNode.connect(effect.inputGain);
                effect.wetGain.connect(outputNode);
                effect.dryGain.connect(outputNode);
                break;
                
            case 'delay':
                inputNode.connect(effect.inputGain);
                effect.wetGain.connect(outputNode);
                effect.dryGain.connect(outputNode);
                break;
                
            case 'distortion':
                inputNode.connect(effect.inputGain);
                effect.toneFilter.connect(outputNode);
                break;
                
            case 'filter':
                inputNode.connect(effect.filter);
                effect.filter.connect(outputNode);
                break;
                
            case 'compressor':
                inputNode.connect(effect.compressor);
                effect.compressor.connect(outputNode);
                break;
        }
    }
    
    /**
     * Get effect parameters
     */
    getEffectParams(effectName) {
        return this.globalEffects[effectName] || null;
    }
    
    /**
     * Set effect parameters
     */
    setEffectParams(effectName, params) {
        if (!this.globalEffects[effectName]) return;
        
        Object.keys(params).forEach(param => {
            this.globalEffects[effectName][param] = params[param];
            this.applyEffectParam(effectName, param, params[param]);
        });
    }
    
    /**
     * Get all effects data for saving
     */
    getEffectsData() {
        return {
            globalEffects: this.globalEffects,
            effectChains: Array.from(this.effectChains.entries())
        };
    }
    
    /**
     * Load effects data
     */
    loadEffectsData(data) {
        if (data.globalEffects) {
            this.globalEffects = data.globalEffects;
        }
        
        if (data.effectChains) {
            this.effectChains = new Map(data.effectChains);
        }
        
        // Reapply effect parameters
        Object.keys(this.globalEffects).forEach(effectName => {
            const effect = this.globalEffects[effectName];
            Object.keys(effect).forEach(param => {
                if (param !== 'enabled') {
                    this.applyEffectParam(effectName, param, effect[param]);
                }
            });
        });
    }
    
    /**
     * Cleanup
     */
    dispose() {
        this.effects.clear();
        this.effectChains.clear();
    }
}

// Export for use in other modules
window.EffectsManager = EffectsManager;
