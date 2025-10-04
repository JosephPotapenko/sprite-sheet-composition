const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const combineBtn = document.getElementById('combineBtn');
const downloadBtn = document.getElementById('downloadBtn');
const columnsInput = document.getElementById('columnsInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Disable smoothing for pixel-art
function setupPixelArt(ctx) {
  ctx.imageSmoothingEnabled = false;
  if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = 'low';
}

// Increase bitrate for higher quality encodes
function getBestMediaRecorderOptions() {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  for (const mt of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mt)) {
      return { mimeType: mt, videoBitsPerSecond: 16000000 }; // 16 Mbps
    }
  }
  return { videoBitsPerSecond: 16000000 };
}

let images = [];

fileInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  // Sort files by name before loading
  files.sort((a, b) => a.name.localeCompare(b.name));
  let loadedImages = [];
  let loadedCount = 0;

  files.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        loadedImages[idx] = img;
        loadedCount++;
        if (loadedCount === files.length) {
          images = images.concat(loadedImages.filter(Boolean));
          renderPreview();
        }
      }
    }
    reader.readAsDataURL(file);
  });
});

function renderPreview() {
  preview.innerHTML = '';
  images.forEach((img, index) => {
    const div = document.createElement('div');
    div.className = 'thumb';
    div.setAttribute('draggable', true);
    div.dataset.index = index;

    const imageEl = document.createElement('img');
    imageEl.src = img.src;

    const delBtn = document.createElement('button');
    delBtn.innerText = '×';
    delBtn.className = 'delete-btn';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      images.splice(index, 1);
      renderPreview();
    };

    div.appendChild(imageEl);
    div.appendChild(delBtn);
    preview.appendChild(div);
  });

  enableDragAndDrop();
  updateNavigatorOnImagesChange();
}

function enableDragAndDrop() {
  const thumbs = document.querySelectorAll('.thumb');
  let dragged;

  thumbs.forEach(thumb => {
    thumb.addEventListener('dragstart', (e) => {
      dragged = thumb;
      e.dataTransfer.effectAllowed = 'move';
    });

    thumb.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    thumb.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragged && dragged !== thumb) {
        const draggedIndex = parseInt(dragged.dataset.index);
        const targetIndex = parseInt(thumb.dataset.index);
        const moved = images.splice(draggedIndex, 1)[0];
        images.splice(targetIndex, 0, moved);
        renderPreview();
      }
    });
  });
}

combineBtn.addEventListener('click', () => {
  if (images.length === 0) return;
  const cols = Math.max(1, parseInt(columnsInput.value) || 1);
  const rows = Math.ceil(images.length / cols);

  const maxWidth = Math.max(...images.map(img => img.width));
  const maxHeight = Math.max(...images.map(img => img.height));

  canvas.width = cols * maxWidth;
  canvas.height = rows * maxHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setupPixelArt(ctx);
  images.forEach((img, index) => {
    const x = (index % cols) * maxWidth + (maxWidth - img.width) / 2;
    const y = Math.floor(index / cols) * maxHeight + (maxHeight - img.height) / 2;
    ctx.drawImage(img, x, y);
  });
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'sprite_sheet.png';
  link.href = canvas.toDataURL();
  link.click();
});

const darkModeBtn = document.getElementById('darkModeBtn');

// Check localStorage for dark mode preference, default to dark mode
const isDarkMode = localStorage.getItem('darkMode') !== 'false';
if (isDarkMode) {
  document.body.classList.add('dark-mode');
  darkModeBtn.textContent = '☀️ Light Mode';
  darkModeBtn.style.background = '#eee';
  darkModeBtn.style.color = '#222';
} else {
  darkModeBtn.textContent = '🌙 Dark Mode';
  darkModeBtn.style.background = '#222';
  darkModeBtn.style.color = '#eee';
}

darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isNowDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isNowDarkMode);
  
  if (isNowDarkMode) {
    darkModeBtn.textContent = '☀️ Light Mode';
    darkModeBtn.style.background = '#eee';
    darkModeBtn.style.color = '#222';
  } else {
    darkModeBtn.textContent = '🌙 Dark Mode';
    darkModeBtn.style.background = '#222';
    darkModeBtn.style.color = '#eee';
  }
});

// Sprite navigator & recorder logic
let currentSpriteIndex = 0;
let selectedSpriteIndex = 0;
let bgImage = null;

const prevSpriteBtn = document.getElementById('prevSpriteBtn');
const nextSpriteBtn = document.getElementById('nextSpriteBtn');
const spriteIndexLabel = document.getElementById('spriteIndexLabel');
const recordingPreview = document.getElementById('recordingPreview');
const recordingPreviewCtx = recordingPreview.getContext('2d');
const recordBtn = document.getElementById('recordBtn');
const bgColorPicker = document.getElementById('bgColorPicker');
const bgImageInput = document.getElementById('bgImageInput');
const aspectRatioSelect = document.getElementById('aspectRatioSelect');
const spritePreviewSelector = document.getElementById('spritePreviewSelector');
const recordVideoBtn = document.getElementById('recordVideoBtn');
const downloadVideoLink = document.getElementById('downloadVideoLink');
const zoomPercentInput = document.getElementById('zoomPercentInput');
const startControlledRecordingBtn = document.getElementById('startControlledRecordingBtn');
const stopControlledRecordingBtn = document.getElementById('stopControlledRecordingBtn');
const downloadControlledVideoBtn = document.getElementById('downloadControlledVideoBtn');
const removeControlledVideoBtn = document.getElementById('removeControlledVideoBtn');
const controlledRecordingTimeBar = document.getElementById('controlledRecordingTimeBar');
const controlledRecordingTimeLabel = document.getElementById('controlledRecordingTimeLabel');

let controlledRecording = false;
let controlledMediaRecorder = null;
let controlledChunks = [];
let controlledStream = null;
let controlledRecordingAnimationFrame = null;

let controlledRecordingStartTime = null;
let controlledRecordingDuration = 0;
let controlledVideoBlobUrl = '';

function updateSpriteNavigator() {
  spriteIndexLabel.textContent = `Sprite ${selectedSpriteIndex + 1} / ${images.length}`;
  prevSpriteBtn.disabled = images.length === 0 || selectedSpriteIndex === 0;
  nextSpriteBtn.disabled = images.length === 0 || selectedSpriteIndex === images.length - 1;
  renderRecordingPreview();
  renderSpritePreviewSelector();
}

prevSpriteBtn.onclick = () => {
  if (selectedSpriteIndex > 0) {
    selectedSpriteIndex--;
    updateSpriteNavigator();
  }
};
nextSpriteBtn.onclick = () => {
  if (selectedSpriteIndex < images.length - 1) {
    selectedSpriteIndex++;
    updateSpriteNavigator();
  }
};

function renderSpritePreviewSelector() {
  spritePreviewSelector.innerHTML = '';
  images.forEach((img, idx) => {
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.style.maxWidth = '48px';
    thumb.style.maxHeight = '48px';
    thumb.style.border = idx === selectedSpriteIndex ? '3px solid #4CAF50' : '2px solid #888';
    thumb.style.borderRadius = '6px';
    thumb.style.background = '#fff';
    thumb.style.cursor = 'pointer';
    thumb.onclick = () => {
      selectedSpriteIndex = idx;
      updateSpriteNavigator();
    };
    spritePreviewSelector.appendChild(thumb);
  });
}

bgImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    bgImage = null;
    renderRecordingPreview();
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.src = ev.target.result;
    img.onload = () => {
      bgImage = img;
      renderRecordingPreview();
    };
  };
  reader.readAsDataURL(file);
});

bgColorPicker.addEventListener('input', renderRecordingPreview);
aspectRatioSelect.addEventListener('change', renderRecordingPreview);

function getAspectRatioWH(ratioStr) {
  const [w, h] = ratioStr.split(':').map(Number);
  return {w, h};
}
// Ensure encoder-friendly even dimensions
function roundEven(n) {
  return Math.max(2, Math.round(n / 2) * 2);
}

// Utility to find the bottom Y of the non-background asset in an image
function findSpriteBottom(img, bgColor = null) {
  // Create a temporary canvas to analyze the image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(img, 0, 0);

  // Get image data
  const imageData = tempCtx.getImageData(0, 0, img.width, img.height).data;

  // If no bgColor provided, use top-left pixel as background
  let bgR = 255, bgG = 255, bgB = 255, bgA = 255;
  if (bgColor) {
    // Parse hex color
    if (bgColor.startsWith('#')) {
      const hex = bgColor.substring(1);
      if (hex.length === 3) {
        bgR = parseInt(hex[0] + hex[0], 16);
        bgG = parseInt(hex[1] + hex[1], 16);
        bgB = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        bgR = parseInt(hex.substring(0,2), 16);
        bgG = parseInt(hex.substring(2,4), 16);
        bgB = parseInt(hex.substring(4,6), 16);
      }
      bgA = 255;
    }
  } else {
    bgR = imageData[0];
    bgG = imageData[1];
    bgB = imageData[2];
    bgA = imageData[3];
  }

  // Find the lowest row with a non-background pixel
  let bottomY = img.height - 1;
  for (let y = img.height - 1; y >= 0; y--) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = imageData[idx], g = imageData[idx+1], b = imageData[idx+2], a = imageData[idx+3];
      // Consider alpha and color difference
      if (a > 10 && (Math.abs(r-bgR) > 10 || Math.abs(g-bgG) > 10 || Math.abs(b-bgB) > 10)) {
        bottomY = y;
        return bottomY;
      }
    }
  }
  return bottomY;
}

// Cache sprite bottoms for performance
let spriteBottomCache = [];

function updateSpriteBottomCache() {
  spriteBottomCache = images.map(img => findSpriteBottom(img, bgColorPicker.value));
}

// Update cache when images or background color changes
bgColorPicker.addEventListener('input', () => {
  updateSpriteBottomCache();
  renderRecordingPreview();
});
fileInput.addEventListener('change', () => {
  setTimeout(updateSpriteBottomCache, 100); // after images loaded
});

function renderRecordingPreview() {
  // Set canvas size based on aspect ratio (UI/display size)
  const ratio = getAspectRatioWH(aspectRatioSelect.value);
  const baseW = 320, baseH = 240;
  let w = baseW, h = baseH;
  if (ratio.w && ratio.h) {
    if (ratio.w >= ratio.h) {
      w = baseW;
      h = Math.round(baseW * ratio.h / ratio.w);
    } else {
      h = baseH;
      w = Math.round(baseH * ratio.w / ratio.h);
    }
  }

  // Internal recording resolution targeting 1080p quality
  // Landscape: height = 1080, Portrait: width = 1080, Square: 1080x1080
  let targetWpx, targetHpx;
  if (ratio.w >= ratio.h) {
    targetHpx = 1080;
    targetWpx = roundEven(targetHpx * ratio.w / ratio.h);
  } else {
    targetWpx = 1080;
    targetHpx = roundEven(targetWpx * ratio.h / ratio.w);
  }

  // Set internal resolution for recording; keep on-screen size unchanged
  recordingPreview.width = targetWpx;
  recordingPreview.height = targetHpx;
  recordingPreview.style.width = w + 'px';
  recordingPreview.style.height = h + 'px';

  const recordingPreviewCtx = document.getElementById('recordingPreview').getContext('2d');
  const scaleX = targetWpx / w;
  const scaleY = targetHpx / h;
  recordingPreviewCtx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
  setupPixelArt(recordingPreviewCtx);

  // Draw background
  if (bgImage) {
    // Crop bgImage to aspect ratio and draw
    const imgW = bgImage.width, imgH = bgImage.height;
    const imgRatio = imgW / imgH;
    const targetRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > targetRatio) {
      // Crop width
      sw = imgH * targetRatio;
      sh = imgH;
      sx = (imgW - sw) / 2;
      sy = 0;
    } else {
      // Crop height
      sw = imgW;
      sh = imgW / targetRatio;
      sx = 0;
      sy = (imgH - sh) / 2;
    }
    recordingPreviewCtx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, w, h);
  } else {
    recordingPreviewCtx.fillStyle = bgColorPicker.value;
    recordingPreviewCtx.fillRect(0, 0, w, h);
  }

  // Draw selected sprite (keeps bottom alignment logic), coordinates in UI units
  if (images[selectedSpriteIndex]) {
    const sprite = images[selectedSpriteIndex];
    const zoom = Math.max(10, Math.min(100, parseInt(zoomPercentInput.value) || 100)) / 100;
    const scale = Math.min(w / sprite.width, h / sprite.height, 1) * zoom;
    const spriteW = sprite.width * scale;
    const spriteH = sprite.height * scale;

    // Find bottom of asset in original image
    let bottomY = spriteBottomCache[selectedSpriteIndex];
    if (typeof bottomY !== 'number') {
      bottomY = findSpriteBottom(sprite, bgColorPicker.value);
      spriteBottomCache[selectedSpriteIndex] = bottomY;
    }

    const assetBottomInSprite = bottomY * scale;
    const x = (w - spriteW) / 2;
    const desiredBottom = h * 0.85;
    const y = desiredBottom - assetBottomInSprite;

    recordingPreviewCtx.drawImage(sprite, x, y, spriteW, spriteH);
  }
}

zoomPercentInput.addEventListener('input', renderRecordingPreview);

// Controlled recording logic
startControlledRecordingBtn.onclick = () => {
  if (images.length === 0) return;
  controlledRecording = true;
  startControlledRecordingBtn.style.display = 'none';
  stopControlledRecordingBtn.style.display = 'inline-block';
  downloadControlledVideoBtn.style.display = 'none';
  removeControlledVideoBtn.style.display = 'none';
  controlledRecordingTimeBar.style.display = 'flex';
  controlledRecordingTimeLabel.textContent = '00:00';
  controlledChunks = [];

  // Increase capture frame rate
  controlledStream = recordingPreview.captureStream(60);
  controlledMediaRecorder = new MediaRecorder(controlledStream, getBestMediaRecorderOptions());

  controlledMediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) controlledChunks.push(e.data);
  };
  controlledMediaRecorder.onstop = () => {
    const blob = new Blob(controlledChunks, { type: (controlledMediaRecorder.mimeType || 'video/webm') });
    controlledVideoBlobUrl = URL.createObjectURL(blob);
    downloadControlledVideoBtn.style.display = 'inline-block';
    removeControlledVideoBtn.style.display = 'inline-block';
    startControlledRecordingBtn.style.display = 'inline-block';
    stopControlledRecordingBtn.style.display = 'none';
    controlledRecordingTimeBar.style.display = 'none';
    controlledRecording = false;
  };
  controlledMediaRecorder.start();
  controlledRecordingStartTime = Date.now();
  controlledRecordingDuration = 0;
  controlledRecordingAnimationFrame = requestAnimationFrame(recordingFrameLoop);
};

stopControlledRecordingBtn.onclick = () => {
  if (controlledRecording && controlledMediaRecorder) {
    controlledMediaRecorder.stop();
    controlledRecording = false;
    cancelAnimationFrame(controlledRecordingAnimationFrame);
    controlledRecordingTimeBar.style.display = 'none';
  }
};

function recordingFrameLoop() {
  if (controlledRecording) {
    renderRecordingPreview();
    // Update timer on every frame
    controlledRecordingDuration = Math.floor((Date.now() - controlledRecordingStartTime) / 1000);
    const min = String(Math.floor(controlledRecordingDuration / 60)).padStart(2, '0');
    const sec = String(controlledRecordingDuration % 60).padStart(2, '0');
    controlledRecordingTimeLabel.textContent = `${min}:${sec}`;
    controlledRecordingAnimationFrame = requestAnimationFrame(recordingFrameLoop);
  }
}

downloadControlledVideoBtn.onclick = () => {
  if (controlledVideoBlobUrl) {
    const a = document.createElement('a');
    a.href = controlledVideoBlobUrl;
    a.download = 'sprites_controlled.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

removeControlledVideoBtn.onclick = () => {
  controlledVideoBlobUrl = '';
  downloadControlledVideoBtn.style.display = 'none';
  removeControlledVideoBtn.style.display = 'none';
};

// Save current frame as PNG during controlled recording
function saveCurrentFrameAsImage() {
  if (controlledRecording) {
    const link = document.createElement('a');
    link.download = `sprite_recorded_${selectedSpriteIndex + 1}.png`;
    link.href = recordingPreview.toDataURL();
    link.click();
  }
}

// Keyboard shortcut "S" to save frame
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && selectedSpriteIndex > 0) {
    selectedSpriteIndex--;
    updateSpriteNavigator();
  }
  if (e.key === 'ArrowRight' && selectedSpriteIndex < images.length - 1) {
    selectedSpriteIndex++;
    updateSpriteNavigator();
  }
  if (controlledRecording && (e.key === 's' || e.key === 'S')) {
    saveCurrentFrameAsImage();
  }
  // Space to start/stop recording
  if (e.code === 'Space') {
    if (!controlledRecording && startControlledRecordingBtn.style.display !== 'none') {
      startControlledRecordingBtn.click();
    } else if (controlledRecording && stopControlledRecordingBtn.style.display !== 'none') {
      stopControlledRecordingBtn.click();
    }
  }
});

// Click on canvas to save frame during controlled recording
recordingPreview.addEventListener('click', () => {
  saveCurrentFrameAsImage();
});

// Mouse click on preview selector during controlled recording
function renderSpritePreviewSelector() {
  spritePreviewSelector.innerHTML = '';
  images.forEach((img, idx) => {
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.style.maxWidth = '48px';
    thumb.style.maxHeight = '48px';
    thumb.style.border = idx === selectedSpriteIndex ? '3px solid #4CAF50' : '2px solid #888';
    thumb.style.borderRadius = '6px';
    thumb.style.background = '#fff';
    thumb.style.cursor = 'pointer';
    thumb.onclick = () => {
      selectedSpriteIndex = idx;
      updateSpriteNavigator();
    };
    // During controlled recording, allow mouse click to change sprite
    if (controlledRecording) {
      thumb.onclick = () => {
        selectedSpriteIndex = idx;
        updateSpriteNavigator();
      };
    }
    spritePreviewSelector.appendChild(thumb);
  });
}

// Hide download link when new video is started or images change
function updateNavigatorOnImagesChange() {
  if (selectedSpriteIndex >= images.length) selectedSpriteIndex = Math.max(0, images.length - 1);
  updateSpriteNavigator();
  downloadControlledVideoLink.style.display = 'none';
  downloadControlledVideoLink.href = '';
}

// Update navigator when images change
function updateNavigatorOnImagesChange() {
  if (selectedSpriteIndex >= images.length) selectedSpriteIndex = Math.max(0, images.length - 1);
  updateSpriteNavigator();
}

// Initial call
updateSpriteNavigator();

// Initial cache
updateSpriteBottomCache();