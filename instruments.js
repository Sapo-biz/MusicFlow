/**
 * MusicFlow Instruments
 * Virtual instruments with realistic sound synthesis
 * Includes piano, drums, guitar, bass, synth, and strings
 */

class InstrumentManager {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.instruments = {};
        this.activeInstrument = null;
        this.currentOctave = 4;
        
        // Initialize all instruments
        this.initInstruments();
    }
    
    /**
     * Initialize all available instruments
     */
    initInstruments() {
        this.instruments = {
            piano: new PianoInstrument(this.audioEngine),
            drums: new DrumsInstrument(this.audioEngine),
            guitar: new GuitarInstrument(this.audioEngine),
            bass: new BassInstrument(this.audioEngine),
            synth: new SynthInstrument(this.audioEngine),
            strings: new StringsInstrument(this.audioEngine)
        };
        
        // Set default active instrument
        this.activeInstrument = this.instruments.piano;
    }
    
    /**
     * Set active instrument
     */
    setActiveInstrument(instrumentName) {
        if (this.instruments[instrumentName]) {
            this.activeInstrument = this.instruments[instrumentName];
            console.log(`Active instrument: ${instrumentName}`);
        }
    }
    
    /**
     * Get active instrument
     */
    getActiveInstrument() {
        return this.activeInstrument;
    }
    
    /**
     * Play a note
     */
    playNote(note, velocity = 0.8, duration = null) {
        if (this.activeInstrument) {
            return this.activeInstrument.playNote(note, velocity, duration);
        }
    }
    
    /**
     * Stop a note
     */
    stopNote(note) {
        if (this.activeInstrument) {
            this.activeInstrument.stopNote(note);
        }
    }
    
    /**
     * Stop all notes
     */
    stopAllNotes() {
        if (this.activeInstrument) {
            this.activeInstrument.stopAllNotes();
        }
    }
    
    /**
     * Set octave
     */
    setOctave(octave) {
        this.currentOctave = Math.max(0, Math.min(8, octave));
    }
    
    /**
     * Get octave
     */
    getOctave() {
        return this.currentOctave;
    }
}

/**
 * Base Instrument Class
 */
class BaseInstrument {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.activeNotes = new Map();
        this.volume = 0.8;
        this.pan = 0;
        this.reverb = 0;
        this.delay = 0;
    }
    
    /**
     * Play a note (to be implemented by subclasses)
     */
    playNote(note, velocity, duration) {
        throw new Error('playNote must be implemented by subclass');
    }
    
    /**
     * Stop a note
     */
    stopNote(note) {
        const noteData = this.activeNotes.get(note);
        if (noteData) {
            if (noteData.source) {
                noteData.source.stop();
            }
            if (noteData.gainNode) {
                noteData.gainNode.gain.cancelScheduledValues(this.audioEngine.audioContext.currentTime);
                noteData.gainNode.gain.setTargetAtTime(0, this.audioEngine.audioContext.currentTime, 0.1);
            }
            this.activeNotes.delete(note);
        }
    }
    
    /**
     * Stop all notes
     */
    stopAllNotes() {
        for (const note of this.activeNotes.keys()) {
            this.stopNote(note);
        }
    }
    
    /**
     * Convert note name to frequency
     */
    noteToFrequency(note) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1);
        const noteIndex = noteNames.indexOf(noteName);
        
        if (noteIndex === -1) return 440; // Default to A4
        
        return 440 * Math.pow(2, (octave - 4) + (noteIndex - 9) / 12);
    }
    
    /**
     * Set volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Set pan
     */
    setPan(pan) {
        this.pan = Math.max(-1, Math.min(1, pan));
    }
}

/**
 * Piano Instrument
 */
class PianoInstrument extends BaseInstrument {
    constructor(audioEngine) {
        super(audioEngine);
        this.name = 'Piano';
        this.type = 'acoustic';
    }
    
    playNote(note, velocity = 0.8, duration = null) {
        const frequency = this.noteToFrequency(note);
        const now = this.audioEngine.audioContext.currentTime;
        
        // Create oscillator for fundamental
        const oscillator = this.audioEngine.audioContext.createOscillator();
        const gainNode = this.audioEngine.audioContext.createGain();
        const filter = this.audioEngine.createFilter('lowpass', 2000, 1);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        // Create harmonics for richer sound
        const harmonics = [
            { freq: frequency * 2, gain: 0.3 },
            { freq: frequency * 3, gain: 0.2 },
            { freq: frequency * 4, gain: 0.1 }
        ];
        
        const harmonicOscillators = [];
        
        // Connect main oscillator
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioEngine.masterGain);
        
        // Add harmonics
        harmonics.forEach(harmonic => {
            const harmOsc = this.audioEngine.audioContext.createOscillator();
            const harmGain = this.audioEngine.audioContext.createGain();
            
            harmOsc.type = 'sine';
            harmOsc.frequency.value = harmonic.freq;
            harmGain.gain.value = harmonic.gain * velocity;
            
            harmOsc.connect(harmGain);
            harmGain.connect(this.audioEngine.masterGain);
            
            harmOsc.start(now);
            harmonicOscillators.push({ oscillator: harmOsc, gainNode: harmGain });
        });
        
        // Envelope
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        const releaseTime = duration || 2.0;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume, now + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel * velocity * this.volume, now + attackTime + decayTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
        
        oscillator.start(now);
        oscillator.stop(now + releaseTime);
        
        // Store note data
        this.activeNotes.set(note, {
            source: oscillator,
            gainNode: gainNode,
            harmonics: harmonicOscillators
        });
        
        return { oscillator, gainNode };
    }
    
    stopNote(note) {
        const noteData = this.activeNotes.get(note);
        if (noteData) {
            // Stop main oscillator
            if (noteData.source) {
                noteData.source.stop();
            }
            
            // Stop harmonics
            if (noteData.harmonics) {
                noteData.harmonics.forEach(harm => {
                    if (harm.oscillator) {
                        harm.oscillator.stop();
                    }
                });
            }
            
            // Fade out gain
            if (noteData.gainNode) {
                const now = this.audioEngine.audioContext.currentTime;
                noteData.gainNode.gain.cancelScheduledValues(now);
                noteData.gainNode.gain.setTargetAtTime(0, now, 0.1);
            }
            
            this.activeNotes.delete(note);
        }
    }
}

/**
 * Drums Instrument
 */
class DrumsInstrument extends BaseInstrument {
    constructor(audioEngine) {
        super(audioEngine);
        this.name = 'Drums';
        this.type = 'percussion';
        this.drumSamples = {};
        this.initDrumSamples();
    }
    
    initDrumSamples() {
        // Create synthetic drum samples
        this.drumSamples = {
            kick: this.createKickSample(),
            snare: this.createSnareSample(),
            hihat: this.createHihatSample(),
            openhat: this.createOpenhatSample(),
            crash: this.createCrashSample(),
            ride: this.createRideSample(),
            tom1: this.createTomSample(200),
            tom2: this.createTomSample(150),
            tom3: this.createTomSample(100)
        };
    }
    
    createKickSample() {
        const sampleRate = this.audioEngine.getSampleRate();
        const duration = 0.5;
        const buffer = this.audioEngine.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8);
            const frequency = 60 * Math.exp(-t * 15);
            data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.5;
        }
        
        return buffer;
    }
    
    createSnareSample() {
        const sampleRate = this.audioEngine.getSampleRate();
        const duration = 0.3;
        const buffer = this.audioEngine.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 12);
            const noise = (Math.random() * 2 - 1) * 0.3;
            const tone = Math.sin(2 * Math.PI * 200 * t) * 0.2;
            data[i] = (noise + tone) * envelope;
        }
        
        return buffer;
    }
    
    createHihatSample() {
        const sampleRate = this.audioEngine.getSampleRate();
        const duration = 0.1;
        const buffer = this.audioEngine.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 30);
            const noise = (Math.random() * 2 - 1) * 0.5;
            data[i] = noise * envelope;
        }
        
        return buffer;
    }
    
    createOpenhatSample() {
        const sampleRate = this.audioEngine.getSampleRate();
        const duration = 0.2;
        const buffer = this.audioEngine.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8);
            const noise = (Math.random() * 2 - 1) * 0.3;
            data[i] = noise * envelope;
        }
        
        return buffer;
    }
    
    createCrashSample() {
        const sampleRate = this.audioEngine.getSampleRate();
        const duration = 1.0;
        const buffer = this.audioEngine.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            const noise = (Math.random() * 2 - 1) * 0.4;
            data[i] = noise * envelope;
        }
        
        return buffer;
    }
    
    createRideSample() {
        const sampleRate = this.audioEngine.getSampleRate();
        const duration = 0.8;
        const buffer = this.audioEngine.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3);
            const noise = (Math.random() * 2 - 1) * 0.2;
            data[i] = noise * envelope;
        }
        
        return buffer;
    }
    
    createTomSample(frequency) {
        const sampleRate = this.audioEngine.getSampleRate();
        const duration = 0.4;
        const buffer = this.audioEngine.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 6);
            const freq = frequency * Math.exp(-t * 10);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
        
        return buffer;
    }
    
    playNote(note, velocity = 0.8, duration = null) {
        const drumMap = {
            'C4': 'kick',
            'D4': 'snare',
            'E4': 'hihat',
            'F4': 'openhat',
            'G4': 'crash',
            'A4': 'ride',
            'B4': 'tom1',
            'C5': 'tom2',
            'D5': 'tom3'
        };
        
        const drumType = drumMap[note] || 'kick';
        const sample = this.drumSamples[drumType];
        
        if (!sample) return null;
        
        const now = this.audioEngine.audioContext.currentTime;
        const source = this.audioEngine.audioContext.createBufferSource();
        const gainNode = this.audioEngine.audioContext.createGain();
        
        source.buffer = sample;
        source.connect(gainNode);
        gainNode.connect(this.audioEngine.masterGain);
        
        gainNode.gain.value = velocity * this.volume;
        
        source.start(now);
        
        return { source, gainNode };
    }
}

/**
 * Guitar Instrument
 */
class GuitarInstrument extends BaseInstrument {
    constructor(audioEngine) {
        super(audioEngine);
        this.name = 'Guitar';
        this.type = 'string';
    }
    
    playNote(note, velocity = 0.8, duration = null) {
        const frequency = this.noteToFrequency(note);
        const now = this.audioEngine.audioContext.currentTime;
        
        // Create multiple oscillators for guitar-like sound
        const oscillators = [];
        const gainNodes = [];
        
        // Fundamental and harmonics
        const harmonics = [
            { freq: frequency, gain: 1.0 },
            { freq: frequency * 2, gain: 0.5 },
            { freq: frequency * 3, gain: 0.3 },
            { freq: frequency * 4, gain: 0.2 }
        ];
        
        harmonics.forEach(harmonic => {
            const oscillator = this.audioEngine.audioContext.createOscillator();
            const gainNode = this.audioEngine.audioContext.createGain();
            const filter = this.audioEngine.createFilter('lowpass', 3000, 2);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = harmonic.freq;
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioEngine.masterGain);
            
            // Guitar-like envelope
            const attackTime = 0.01;
            const decayTime = 0.1;
            const sustainLevel = 0.6;
            const releaseTime = duration || 1.5;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(harmonic.gain * velocity * this.volume, now + attackTime);
            gainNode.gain.exponentialRampToValueAtTime(sustainLevel * harmonic.gain * velocity * this.volume, now + attackTime + decayTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
            
            oscillator.start(now);
            oscillator.stop(now + releaseTime);
            
            oscillators.push(oscillator);
            gainNodes.push(gainNode);
        });
        
        this.activeNotes.set(note, {
            sources: oscillators,
            gainNodes: gainNodes
        });
        
        return { oscillators, gainNodes };
    }
    
    stopNote(note) {
        const noteData = this.activeNotes.get(note);
        if (noteData) {
            if (noteData.sources) {
                noteData.sources.forEach(source => source.stop());
            }
            if (noteData.gainNodes) {
                noteData.gainNodes.forEach(gainNode => {
                    const now = this.audioEngine.audioContext.currentTime;
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setTargetAtTime(0, now, 0.1);
                });
            }
            this.activeNotes.delete(note);
        }
    }
}

/**
 * Bass Instrument
 */
class BassInstrument extends BaseInstrument {
    constructor(audioEngine) {
        super(audioEngine);
        this.name = 'Bass';
        this.type = 'string';
    }
    
    playNote(note, velocity = 0.8, duration = null) {
        const frequency = this.noteToFrequency(note);
        const now = this.audioEngine.audioContext.currentTime;
        
        // Create bass sound with sawtooth wave and filter
        const oscillator = this.audioEngine.audioContext.createOscillator();
        const gainNode = this.audioEngine.audioContext.createGain();
        const filter = this.audioEngine.createFilter('lowpass', 800, 1);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = frequency;
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioEngine.masterGain);
        
        // Bass envelope
        const attackTime = 0.01;
        const decayTime = 0.05;
        const sustainLevel = 0.8;
        const releaseTime = duration || 1.0;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume, now + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel * velocity * this.volume, now + attackTime + decayTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
        
        oscillator.start(now);
        oscillator.stop(now + releaseTime);
        
        this.activeNotes.set(note, {
            source: oscillator,
            gainNode: gainNode
        });
        
        return { oscillator, gainNode };
    }
}

/**
 * Synth Instrument
 */
class SynthInstrument extends BaseInstrument {
    constructor(audioEngine) {
        super(audioEngine);
        this.name = 'Synth';
        this.type = 'electronic';
    }
    
    playNote(note, velocity = 0.8, duration = null) {
        const frequency = this.noteToFrequency(note);
        const now = this.audioEngine.audioContext.currentTime;
        
        // Create synth sound with multiple oscillators
        const oscillator1 = this.audioEngine.audioContext.createOscillator();
        const oscillator2 = this.audioEngine.audioContext.createOscillator();
        const gainNode = this.audioEngine.audioContext.createGain();
        const filter = this.audioEngine.createFilter('lowpass', 2000, 1);
        
        oscillator1.type = 'square';
        oscillator1.frequency.value = frequency;
        
        oscillator2.type = 'sawtooth';
        oscillator2.frequency.value = frequency * 0.5;
        
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioEngine.masterGain);
        
        // Synth envelope
        const attackTime = 0.1;
        const decayTime = 0.2;
        const sustainLevel = 0.7;
        const releaseTime = duration || 2.0;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume, now + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel * velocity * this.volume, now + attackTime + decayTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
        
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator1.stop(now + releaseTime);
        oscillator2.stop(now + releaseTime);
        
        this.activeNotes.set(note, {
            sources: [oscillator1, oscillator2],
            gainNode: gainNode
        });
        
        return { oscillators: [oscillator1, oscillator2], gainNode };
    }
    
    stopNote(note) {
        const noteData = this.activeNotes.get(note);
        if (noteData) {
            if (noteData.sources) {
                noteData.sources.forEach(source => source.stop());
            }
            if (noteData.gainNode) {
                const now = this.audioEngine.audioContext.currentTime;
                noteData.gainNode.gain.cancelScheduledValues(now);
                noteData.gainNode.gain.setTargetAtTime(0, now, 0.1);
            }
            this.activeNotes.delete(note);
        }
    }
}

/**
 * Strings Instrument
 */
class StringsInstrument extends BaseInstrument {
    constructor(audioEngine) {
        super(audioEngine);
        this.name = 'Strings';
        this.type = 'orchestral';
    }
    
    playNote(note, velocity = 0.8, duration = null) {
        const frequency = this.noteToFrequency(note);
        const now = this.audioEngine.audioContext.currentTime;
        
        // Create strings sound with multiple oscillators and vibrato
        const oscillators = [];
        const gainNodes = [];
        
        // Create multiple voices for richness
        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioEngine.audioContext.createOscillator();
            const gainNode = this.audioEngine.audioContext.createGain();
            const lfo = this.audioEngine.audioContext.createOscillator();
            const lfoGain = this.audioEngine.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency + (i * 0.1);
            
            lfo.type = 'sine';
            lfo.frequency.value = 5; // Vibrato rate
            lfoGain.gain.value = 2; // Vibrato depth
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioEngine.masterGain);
            
            // Strings envelope
            const attackTime = 0.3;
            const decayTime = 0.1;
            const sustainLevel = 0.8;
            const releaseTime = duration || 3.0;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(velocity * this.volume * 0.3, now + attackTime);
            gainNode.gain.exponentialRampToValueAtTime(sustainLevel * velocity * this.volume * 0.3, now + attackTime + decayTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
            
            oscillator.start(now);
            lfo.start(now);
            oscillator.stop(now + releaseTime);
            lfo.stop(now + releaseTime);
            
            oscillators.push(oscillator);
            gainNodes.push(gainNode);
        }
        
        this.activeNotes.set(note, {
            sources: oscillators,
            gainNodes: gainNodes
        });
        
        return { oscillators, gainNodes };
    }
    
    stopNote(note) {
        const noteData = this.activeNotes.get(note);
        if (noteData) {
            if (noteData.sources) {
                noteData.sources.forEach(source => source.stop());
            }
            if (noteData.gainNodes) {
                noteData.gainNodes.forEach(gainNode => {
                    const now = this.audioEngine.audioContext.currentTime;
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setTargetAtTime(0, now, 0.2);
                });
            }
            this.activeNotes.delete(note);
        }
    }
}

// Export for use in other modules
window.InstrumentManager = InstrumentManager;
window.BaseInstrument = BaseInstrument;
