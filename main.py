# main.py（完整修正版，2025 年最穩）

import base64
import os
from io import BytesIO

import azure.cognitiveservices.speech as speechsdk
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware   # ← 加這行
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from rembg import remove, new_session

load_dotenv()

app = FastAPI()

# ===== 這段一定要加！解決 405 OPTIONS 問題 =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發階段用 *，上線記得改成你域名，例如 ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],  # 容許 POST, OPTIONS 等等
    allow_headers=["*"],
)
# ==========================================

speech_key = os.getenv("SPEECH_KEY")
endpoint = os.getenv("ENDPOINT")

if not speech_key or not endpoint:
    raise RuntimeError("請設定 .env 的 SPEECH_KEY 和 ENDPOINT！")

stability_api_key = os.getenv("STABILITY_API_KEY")
if not stability_api_key:
    raise RuntimeError("請設定 .env 的 STABILITY_API_KEY！")

MAX_IMAGE_SIZE = 15 * 1024 * 1024
rembg_session = new_session()

def build_speech_config() -> speechsdk.SpeechConfig:
    config = speechsdk.SpeechConfig(subscription=speech_key, endpoint=endpoint)
    config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm
    )
    return config

VOICE_MAP = {
    "en": "en-US-Ava:DragonHDLatestNeural",
    "zh": "en-US-Ava:DragonHDLatestNeural",
    "jp": "en-US-Ava:DragonHDLatestNeural",
}


def build_mask(image_bytes: bytes) -> bytes:
    mask = remove(
        image_bytes,
        session=rembg_session,
        only_mask=True,
    )
    if not mask:
        raise RuntimeError("無法產生遮罩")
    return mask

class TTSRequest(BaseModel):
    text: str
    lang: str = "en"


@app.post("/api/tts")
async def tts(payload: TTSRequest):
    lang = payload.lang if payload.lang in VOICE_MAP else "en"
    speech_config = build_speech_config()
    speech_config.speech_synthesis_voice_name = VOICE_MAP[lang]

    # audio_config 設為 None，就可以從 result.audio_data 直接讀取 bytes
    speech_synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=None,
    )

    result = speech_synthesizer.speak_text_async(payload.text).get()

    if result.reason == speechsdk.ResultReason.Canceled:
        error = result.cancellation_details.error_details or "Unknown error"
        raise HTTPException(status_code=500, detail=error)

    if not result.audio_data:
        raise HTTPException(status_code=500, detail="No audio returned from Azure TTS")

    return StreamingResponse(BytesIO(result.audio_data), media_type="audio/wav")


@app.post("/api/remove-people")
async def remove_people(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="請上傳圖片檔案")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="檔案為空")

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="圖片不能超過 15MB")

    try:
        mask_bytes = build_mask(image_bytes)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=500, detail=f"產生遮罩失敗: {exc}") from exc

    try:
        response = requests.post(
            f"https://api.stability.ai/v2beta/stable-image/edit/erase",
            headers={
                "Authorization": f"Bearer {stability_api_key}",
                "Accept": "image/*",
            },
            files={
                "image": (
                    file.filename or "upload.png",
                    image_bytes,
                    file.content_type,
                ),
                "mask": (
                    "mask.png",
                    mask_bytes,
                    "image/png",
                ),
            },
            data={
                "prompt": "remove people from the image and fill the removed area with realistic scenery, high quality",
                "output_format": "png",
            },
            timeout=180,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Stability API 連線錯誤: {exc}") from exc

    if response.status_code != 200:
        try:
            error_payload = response.json()
        except ValueError:
            error_payload = {"detail": response.text}
        raise HTTPException(
            status_code=response.status_code,
            detail=error_payload,
        )

    base64_image = base64.b64encode(response.content).decode("ascii")
    return JSONResponse({"image": base64_image})