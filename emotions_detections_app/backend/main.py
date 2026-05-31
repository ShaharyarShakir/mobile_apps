from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = joblib.load("emotion_pipeline.pkl")
emotion_mapping = joblib.load("emotion_mapping.pkl")
reverse_mapping = {v: k for k, v in emotion_mapping.items()}


class TextInput(BaseModel):
    text: str

@app.post("/predict")
def predict(body: TextInput):
    prediction = pipeline.predict([body.text])[0]
    probabilities = pipeline.predict_proba([body.text])[0]
    emotion_label = reverse_mapping[prediction]
    confidence = round(float(max(probabilities)) * 100, 2)
    return {"emotion": emotion_label, "confidence": confidence}

@app.get("/health")
def health():
    return {"status": "ok"}

