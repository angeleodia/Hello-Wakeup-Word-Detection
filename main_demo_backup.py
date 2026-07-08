from app.analyzer import analyze_audio
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import shutil

from app.audio import load_audio
from app.detector import WakeDetector


app = FastAPI(
    title="Wake Word Detection HMM-GMM"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = WakeDetector()


@app.get("/")
def home():
    return {
        "status": "running",
        "model": "MFCC + HMM-GMM"
    }

@app.post("/detect")
async def detect(
    audio: UploadFile = File(...)
):

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".wav"
    )

    shutil.copyfileobj(
        audio.file,
        temp_file
    )

    temp_file.close()

    result = detector.predict(
        temp_file.name
    )

    return result

@app.post("/analyze")
async def analyze(
    audio: UploadFile = File(...)
):

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".wav"
    )

    shutil.copyfileobj(
        audio.file,
        temp_file
    )

    temp_file.close()


    result = analyze_audio(
        temp_file.name
    )


    return result
