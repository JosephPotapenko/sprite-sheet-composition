# Sprite Sheet Maker

A powerful web-based tool for creating sprite sheets from individual images and recording animated sprite sequences. Perfect for game developers, pixel artists, and anyone working with sprite-based animations.

*This tool was developed with the assistance of AI tools to enhance development speed and code quality.*

## Features

### Core Sprite Sheet Creation
- **Multi-Image Upload**: Load multiple images simultaneously with automatic alphabetical sorting
- **Drag & Drop Reordering**: Easily rearrange sprites by dragging thumbnails to desired positions
- **Configurable Grid Layout**: Set custom column counts to control sprite sheet dimensions
- **Individual Sprite Deletion**: Remove unwanted sprites with convenient delete buttons
- **Pixel-Perfect Rendering**: Maintains crisp pixel art quality with disabled image smoothing
- **Automatic Centering**: Sprites are automatically centered within their grid cells
- **PNG Export**: Download high-quality sprite sheets as PNG files

### Advanced Sprite Navigator & Recorder
- **Individual Sprite Navigation**: Browse through uploaded sprites one by one using arrow buttons or keyboard shortcuts (←/→)
- **Visual Sprite Selector**: Click on thumbnail previews to quickly jump to specific sprites
- **High-Quality Video Recording**: Record sprite animations in WebM format with up to 16 Mbps bitrate
- **Multiple Aspect Ratios**: Support for various aspect ratios (1:1, 4:3, 16:9, 9:16, 3:2, 2:3, 5:4, 4:5, 21:9)
- **1080p Recording Quality**: Internal recording resolution targets 1080p for crisp video output
- **Smart Sprite Positioning**: Automatic bottom-alignment based on sprite content analysis
- **Zoom Control**: Adjustable zoom levels (10-100%) for optimal sprite framing

### Background Customization
- **Color Backgrounds**: Choose any solid color background using the color picker
- **Image Backgrounds**: Upload custom background images that automatically crop to fit aspect ratio
- **Transparent Backgrounds**: Support for transparent backgrounds in sprite sheets

### Recording Controls
- **Real-Time Recording**: Start/stop controlled recording with visual feedback
- **Recording Timer**: Live display of recording duration
- **Frame Capture**: Save individual frames as PNG images during recording (click canvas or press 'S')
- **Keyboard Shortcuts**: 
  - Space bar: Start/stop recording
  - S: Save current frame as image
  - Left/Right arrows: Navigate between sprites
- **Video Management**: Download recorded videos or remove them to start fresh

### User Interface
- **Dark/Light Mode Toggle**: Automatic dark mode on load with toggle option
- **Responsive Design**: Adapts to different screen sizes and devices
- **Intuitive Controls**: Clean, organized interface with clearly labeled functions
- **Real-Time Preview**: Instant preview of sprite sheet as you make changes

## How to Use

### Creating a Sprite Sheet
1. Click "Choose Files" and select multiple image files
2. Images will appear as draggable thumbnails in the preview area
3. Drag thumbnails to reorder sprites as needed
4. Set the desired number of columns using the "Columns" input
5. Click "Combine" to generate the sprite sheet
6. Click "Download" to save the sprite sheet as a PNG file

### Recording Sprite Animations
1. Upload your sprite images using the file input
2. Navigate to the "Sprite Navigator & Recorder" section
3. Choose your preferred aspect ratio from the dropdown menu
4. Set the zoom level (40% is default for good framing)
5. Select background color or upload a background image
6. Use navigation buttons or thumbnail selector to choose your starting sprite
7. Click "🎬 Start Controlled Recording" to begin recording
8. Navigate between sprites during recording using:
   - Arrow buttons
   - Thumbnail selector
   - Left/Right keyboard arrows
9. Press 'S' or click the preview canvas to save individual frames
10. Click "⏹️ Stop Recording" when finished
11. Download your recorded video using the "⬇️ Download Video" button

### Keyboard Shortcuts
- **Space**: Start/stop recording
- **S**: Save current frame as PNG (during recording)
- **Left Arrow**: Previous sprite
- **Right Arrow**: Next sprite

## Technical Features
- **Pixel Art Optimization**: Disabled image smoothing for crisp pixel art rendering
- **High Bitrate Recording**: 16 Mbps video encoding for maximum quality
- **Smart Background Detection**: Automatic sprite boundary detection for optimal positioning
- **Performance Optimization**: Cached sprite analysis for smooth playback
- **Browser Compatibility**: Works in modern browsers with MediaRecorder API support

## File Structure
```
sprite-sheet-composition/
├── index.html          # Main HTML structure
├── style.css           # All CSS styles and theming
├── script.js           # Complete JavaScript functionality
├── README.md          # This documentation
└── favicons/          # App icons and favicons
```

## Browser Support
- Chrome/Chromium (recommended)
- Firefox
- Safari (limited video format support)
- Edge

*Note: Video recording requires browsers with MediaRecorder API support. WebM format is preferred for best quality.*

## Getting Started
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start uploading images and creating sprite sheets!

No installation or build process required - it's a pure client-side web application.

## Use Cases
- Game development sprite sheet creation
- Pixel art animation sequences
- Character animation recording
- UI element organization
- Animation frame extraction
- Social media content creation