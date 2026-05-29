# Japan_Travel_Assistant

This is a class group project designed to provide an AI-powered assistant for travelers in Japan. The entire project was developed using **Vibe coding**, leveraging **V0** for frontend web construction, **Claude** for backend logic and integration, and various AI APIs and models for specialized functions.

## Overview

Japan_Travel_Assistant integrates multiple AI capabilities to enhance the travel experience, from planning itineraries to processing travel photos.

## Features & AI Integration

The project focuses on four primary functions, each powered by specific AI technologies:

1.  **Japan Itinerary & AI Chat**:
    *   **AI Model**: [Ollama](https://ollama.com/) (running `gemma3:1b` locally).
    *   **Description**: Provides personalized travel suggestions and answers queries about Japan travel.
2.  **Text-to-Speech (TTS)**:
    *   **AI Service**: [Azure AI Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech)
    *   **Description**: Converts assistant responses into natural-sounding speech.
3.  **Picture Removal & Upscale**:
    *   **AI Models**: [Stability AI](https://stability.ai/) (via FastAPI), [Replicate](https://replicate.com/) (via Next.js API), and [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN).
    *   **Description**: Allows users to remove unwanted people from travel photos and upscale images for better quality.
4.  **Translation**:
    *   **Description**: Facilitates communication by translating text between languages relevant to Japan travel.

---

## Screenshots

*(Space reserved for project images)*

<!-- [Add Screenshot 1 Here] -->
<!-- [Add Screenshot 2 Here] -->

---

## Prerequisites & Manual Setup

### 1. Ollama (Local LLM)
Users must manually download and install **Ollama** to run the local LLM used for the itinerary and chat functions.
*   Download: [https://ollama.com/](https://ollama.com/)
*   Model used: `gemma3:1b` (Run `ollama run gemma3:1b` to ensure it's available).

### 2. Real-ESRGAN (Image Upscaling)
Due to file size constraints, the Real-ESRGAN model must be downloaded manually.
*   Download from: [Real-ESRGAN GitHub](https://github.com/xinntao/Real-ESRGAN?tab=readme-ov-file)
*   Place the executable and models in the following directory:
    `public/tools/realesrgan_folder/`

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following keys:
```env
SPEECH_KEY=your_azure_speech_key
ENDPOINT=your_azure_speech_endpoint
STABILITY_API_KEY=your_stability_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

---

## Installation

### Frontend & Next.js API (Node.js)
Install the required dependencies, including specific flags for compatibility:
```bash
npm install
npm install microsoft-cognitiveservices-speech-sdk --legacy-peer-deps
npm install --save-dev @types/node --legacy-peer-deps
```

### Backend (Python)
Install the required Python packages:
```bash
pip install azure-cognitiveservices-speech
pip install dotenv
pip install fastapi
pip install uvicorn python-multipart requests rembg torch torchvision opencv-python numpy Pillow segment-anything ultralytics pydub
```

---

## Execution Order

To run the project locally, follow this specific order:

1.  **Start the Python Backend**:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

2.  **Start the Next.js Development Server**:
    ```bash
    npm run dev
    ```

The application will be accessible via the Next.js local server (typically `http://localhost:3000`).

---

## Acknowledgments
*   Developed as a class group project.
*   Built with [v0.app](https://v0.app).
*   AI assistance by Claude.
