# MusicFlow - Professional Music Creator Platform

![MusicFlow Logo](https://img.shields.io/badge/MusicFlow-Professional%20Music%20Creator-blue?style=for-the-badge&logo=music)

A professional, web-based music creation platform that doesn't look AI-generated. MusicFlow provides a comprehensive suite of tools for music production, including virtual instruments, step sequencer, effects processing, and project management.

## 🎵 Features

### Core Functionality
- **Professional Audio Engine** - Built with Web Audio API for high-quality sound synthesis
- **Virtual Instruments** - Piano, Drums, Guitar, Bass, Synth, and Strings
- **Step Sequencer** - 16-step pattern sequencer with real-time playback
- **Effects Processing** - Reverb, Delay, Distortion, and Filter effects
- **Project Management** - Save, load, and organize your musical projects
- **Export Functionality** - Export projects in various formats

### Instruments
- **Piano** - Realistic piano with harmonics and natural decay
- **Drums** - Complete drum kit with kick, snare, hi-hat, crash, and toms
- **Guitar** - Electric guitar with multiple oscillators and filtering
- **Bass** - Deep bass sounds with sawtooth synthesis
- **Synth** - Electronic synthesizer with square and sawtooth waves
- **Strings** - Orchestral strings with vibrato and multiple voices

### Effects
- **Reverb** - Convolution reverb with customizable room size and damping
- **Delay** - Echo effect with adjustable time, feedback, and wet/dry mix
- **Distortion** - Waveshaper distortion with tone control
- **Filter** - Low-pass, high-pass, and band-pass filtering

### Genre Presets
- **Pop** - Optimized for modern pop production
- **Rock** - Heavy guitars and punchy drums
- **Electronic** - Synth-heavy with filtering and effects
- **Jazz** - Smooth sounds with reverb and natural instruments
- **Hip-Hop** - Deep bass and crisp drums
- **Classical** - Orchestral instruments with spacious reverb
- **Ambient** - Atmospheric sounds with long reverb and delay

## 🚀 Getting Started

### Prerequisites
- Modern web browser with Web Audio API support
- No additional software installation required

### Quick Deploy to Netlify (Recommended)
1. **Fork/Clone** this repository
2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your MusicFlow repository
   - Set **Publish directory** to `public`
   - Click "Deploy site"
3. **Access your site** at `https://your-site-name.netlify.app`

### Local Development
1. Clone or download the MusicFlow repository
2. Open `index.html` in your web browser
3. Or run `python server.py` for local development
4. Allow audio permissions when prompted
5. Start creating music!

### First Steps
1. **Choose an Instrument** - Click on any instrument card to select it
2. **Set Genre** - Use the genre dropdown to apply preset configurations
3. **Create Patterns** - Click on the step sequencer to create musical patterns
4. **Play Your Music** - Use the transport controls to play, pause, or stop
5. **Save Your Work** - Click "Save Project" to store your creation

## 🎛️ User Interface

### Main Sections
- **Studio** - Main workspace with instruments, sequencer, and effects
- **Library** - Project management and saved works
- **Help** - Documentation and tutorials

### Studio Layout
- **Left Panel** - Instruments, genre presets, and master controls
- **Center Panel** - Step sequencer with transport controls
- **Right Panel** - Effects and mixer controls

### Transport Controls
- **Play** - Start playback from current position
- **Pause** - Pause playback (resume from same position)
- **Stop** - Stop playback and return to beginning
- **Record** - Enable recording mode (future feature)

## 🎹 Using the Sequencer

### Creating Patterns
1. Select a track (Piano, Drums, Bass, etc.)
2. Click on step buttons to activate notes
3. Right-click steps for advanced options (note selection, velocity)
4. Use the pattern grid to create rhythmic patterns

### Track Controls
- **Volume** - Adjust individual track volume
- **Mute** - Silence a track without deleting patterns
- **Solo** - Play only the selected track

### Step Options
- **Set Note** - Choose which note to play (C4, D#5, etc.)
- **Set Velocity** - Adjust note volume (0.0 - 1.0)
- **Clear Step** - Remove note from pattern

## 🎚️ Effects and Processing

### Global Effects
Effects are applied to the master output and affect all tracks:

- **Reverb** - Add space and depth to your mix
- **Delay** - Create echo and rhythmic effects
- **Distortion** - Add grit and character
- **Filter** - Shape the frequency content

### Effect Parameters
- **Reverb**: Wet/Dry mix, Room Size, Damping
- **Delay**: Time, Feedback, Wet/Dry mix
- **Distortion**: Amount, Tone
- **Filter**: Frequency, Resonance, Type

## 💾 Project Management

### Saving Projects
- Click "Save Project" or use Ctrl+S (Cmd+S on Mac)
- Enter a project name
- Projects are automatically saved to browser storage

### Loading Projects
- Go to the Library section
- Click "Load" on any saved project
- Project settings, patterns, and effects are restored

### Exporting
- Click "Export" to download your project
- Currently exports as JSON format
- Future versions will support WAV/MP3 export

## ⌨️ Keyboard Shortcuts

- **Space** - Play/Pause
- **Escape** - Stop playback
- **Ctrl+S** (Cmd+S) - Save project
- **Ctrl+E** (Cmd+E) - Export project

## 🎵 Music Theory Tips

### Note Names
- Use standard notation: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- Add octave number: C4 (middle C), C5 (one octave higher)
- Example: C4, D#4, F4, G4, A4, C5

### Common Patterns
- **Kick Drum**: Usually on beats 1 and 3 (steps 0, 8)
- **Snare**: Usually on beats 2 and 4 (steps 4, 12)
- **Hi-Hat**: Often on off-beats (steps 2, 6, 10, 14)
- **Bass**: Root notes of chords, often on strong beats

### BPM Guidelines
- **Hip-Hop**: 80-100 BPM
- **Pop**: 100-130 BPM
- **Rock**: 120-140 BPM
- **Electronic**: 120-140 BPM
- **Jazz**: 80-120 BPM
- **Classical**: 60-120 BPM

## 🔧 Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Audio**: Web Audio API for synthesis and processing
- **Storage**: Browser localStorage for project persistence
- **UI**: Custom CSS with modern design principles

### Browser Compatibility
- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

### Performance
- Optimized for real-time audio processing
- Efficient memory management for long sessions
- Responsive design for various screen sizes

## 🎨 Customization

### Adding New Instruments
1. Extend the `BaseInstrument` class
2. Implement `playNote()` and `stopNote()` methods
3. Add instrument to `InstrumentManager`
4. Update UI with new instrument card

### Creating Custom Effects
1. Extend the effects system in `EffectsManager`
2. Implement audio processing nodes
3. Add parameter controls
4. Update UI with effect controls

### Styling
- Modify CSS variables in `:root` for theme changes
- Update color schemes in the CSS file
- Customize layout in the grid system

## 🐛 Troubleshooting

### Audio Issues
- **No Sound**: Check browser audio permissions
- **Crackling**: Reduce master volume or close other audio applications
- **Latency**: Use Chrome for best performance

### Performance Issues
- **Slow Response**: Close other browser tabs
- **Memory Usage**: Restart browser after long sessions
- **CPU Usage**: Reduce number of active tracks

### Browser Issues
- **Not Loading**: Ensure JavaScript is enabled
- **UI Problems**: Try refreshing the page
- **Storage Issues**: Clear browser cache and try again

## 📚 API Reference

### AudioEngine
```javascript
const audioEngine = new AudioEngine();
await audioEngine.initAudioContext();
audioEngine.setMasterVolume(0.8);
```

### InstrumentManager
```javascript
const instrumentManager = new InstrumentManager(audioEngine);
instrumentManager.setActiveInstrument('piano');
instrumentManager.playNote('C4', 0.8, 1.0);
```

### Sequencer
```javascript
const sequencer = new Sequencer(audioEngine, instrumentManager);
sequencer.setBPM(120);
sequencer.play();
```

### EffectsManager
```javascript
const effectsManager = new EffectsManager(audioEngine);
effectsManager.toggleEffect('reverb', true);
effectsManager.updateEffectParam('reverb-wet', 0.5);
```

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Open `index.html` in a local server
3. Make changes to JavaScript/CSS files
4. Test in multiple browsers

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex audio processing
- Maintain responsive design principles

### Testing
- Test audio functionality in different browsers
- Verify UI responsiveness on various screen sizes
- Check performance with multiple tracks and effects

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Web Audio API documentation and examples
- Music theory resources and tutorials
- Open source audio processing libraries
- Community feedback and testing

## 🚀 Deployment

### Netlify (Recommended)
MusicFlow is optimized for Netlify deployment:

1. **Quick Deploy**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/musicflow)
2. **Manual Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
3. **CLI Deploy**: `npm run deploy`

### Other Platforms
- **Vercel**: Works with zero configuration
- **GitHub Pages**: Use the `public` folder as source
- **Firebase Hosting**: Deploy the `public` folder
- **Any Static Host**: Works with any static site host

## 📞 Support

For questions, issues, or feature requests:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help

---

**MusicFlow** - Where creativity meets technology. Start your musical journey today! 🎵

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/musicflow)
