# Demoscene Video & Music Generator Webpage

You're a world leading webdeveloper and demoscene expert.
Create a single-page web application with demoscene aesthetics for generating short videos and music pieces. The application must be built using exactly 3 core files (index.html, style.css, script.js), with additional files allowed if necessary.

## Core Requirements

### File Structure
- `index.html` - Main HTML structure
- `style.css` - All styling and animations
- `script.js` - All interactivity and export logic
- Additional files permitted if needed (e.g., libraries, shaders)

### Main Functionality
1. **Video/Music Generation**: Create short video and music compositions with demoscene aesthetics
2. **Live Preview**: Real-time rendering with semi-transparent overlay when "view creation live" is enabled
3. **Export Capability**: Export generated content (video/music formats)

### GUI Options & Settings

#### Object Configuration
- **Shape Selection**: Random, square, circle, or other geometric shapes
- **Movement Behaviors**: 
  - Still/static
  - Rotating (various speeds/directions)
  - Linear movement
  - Bouncing effects
  - Corner collision detection
  - Spiral/orbital patterns
  - Wave patterns
  - Particle effects

#### Visual Customization
- **Object Color**: Full color picker with gradient/transparency options
- **Background Color**: Full color picker with gradient options
- **Grid Display**: Toggle grid on/off with customizable grid size
- **Grid Animation**: Grid morphing, color shifting, distortion effects
- **Resolution/Scaling**: Adjustable output resolution

#### Demoscene-Specific Features
- **Color Cycling**: Automatic color animation
- **Visual Effects**: Blur, glow, scanlines, CRT effect, plasma effects
- **Geometry Generation**: Fractals, mandelbrot, julia sets
- **Audio Sync**: Beat detection, frequency visualization
- **Morphing/Transitions**: Shape transformations, metamorphosis effects
- **Rotation/Kaleidoscope**: Mirroring, kaleidoscope patterns
- **Noise/Perlin**: Noise generation for organic effects
- **Layering**: Multiple object layers with blend modes
- **Camera Effects**: Zoom, pan, rotation of viewport
- **Distortion**: Sine waves, turbulence, swirl effects

#### Control Panel Features
- **Randomize Button**: Toggle all options randomly on/off
- **Live Preview Toggle**: "View creation live" checkbox for semi-transparent preview overlay beneath settings
- **Advanced Options Section**: Collapsible advanced settings panel
- **Hidden Watermark Removal**: Secret option in advanced settings to remove "A compyra.com project" watermark

### User Interface
- Full-screen option panel on one side/top
- Live preview area showing real-time effects
- Settings are organized in collapsible sections (Basic, Visual, Effects, Advanced)
- Responsive design that works on various screen sizes
- Professional dark demoscene aesthetic

### Export Options
- Video export (WebM, MP4, or GIF formats)
- Audio export (MP3 or WAV if music generation is included)
- Settings profile export/import (JSON)

### Technical Specifications
- Use Canvas API for rendering
- WebAudio API for music generation (if applicable)
- MediaRecorder API for video export
- Optimized for performance (60 FPS target)
- No external UI libraries required (vanilla JS preferred)

### Aesthetics
- Demoscene-inspired visual style (retro-futuristic, technical)
- Smooth animations and transitions
- Professional color palette with accent colors
- Readable typography with good contrast
