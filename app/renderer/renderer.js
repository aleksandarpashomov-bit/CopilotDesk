const screenshotBtn = document.getElementById("screenshotBtn");
const askInput = document.getElementById("askInput");
const output = document.getElementById("output");

screenshotBtn.addEventListener("click", async () => {
    output.innerText = "Capturing screen...";

    const image = await window.api.captureScreen();

    output.innerText = "Analyzing screenshot with GPT-4o...";

    const response = await window.api.analyzeImage(image, askInput.value);

    output.innerText = response;
});
