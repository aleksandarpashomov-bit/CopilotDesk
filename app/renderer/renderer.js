async function analyzeScreen() {
    // 1. Capture screenshot
    const base64img = await window.electronAPI.captureScreen();

    // 2. Send to GPT-4o Vision
    const result = await window.electronAPI.analyzeImage(base64img);

    // 3. Show pointer on screen
    window.electronAPI.showPointer(result.x, result.y);

    // 4. Quiet mode → only short response
    alert("Готово.");
}
