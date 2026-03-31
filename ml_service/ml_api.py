# ----------------------------
# IMPORTS
# ----------------------------
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import string
import re
import pandas as pd
import uvicorn

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# ----------------------------
# LOAD MODELS
# ----------------------------
team_model = joblib.load("team_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# ----------------------------
# PREPROCESSING
# ----------------------------
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\d+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))

    tokens = word_tokenize(text)

    tokens = [
        lemmatizer.lemmatize(word)
        for word in tokens
        if word not in stop_words and len(word) > 2
    ]

    return " ".join(tokens)

# ----------------------------
# FASTAPI INIT
# ----------------------------
app = FastAPI(title="Ticket AI Service")

class TicketRequest(BaseModel):
    ticket_title: str
    ticket_desc: str

# ----------------------------
# HEALTH CHECK
# ----------------------------
@app.get("/")
def health():
    return {"status": "ML Service Running 🚀"}

# ----------------------------
# ANALYZE ENDPOINT
# ----------------------------
@app.post("/analyze")
def analyze_ticket(ticket: TicketRequest):

    # Combine title + description
    full_text = f"{ticket.ticket_title} {ticket.ticket_desc}"

    # Clean
    clean_text = preprocess_text(full_text)

    # Vectorize
    vectorized = vectorizer.transform([clean_text])

    # Predict
    team_pred = team_model.predict(vectorized)[0]

    # Confidence
    team_conf = float(max(team_model.predict_proba(vectorized)[0]))

    print("Api called")

    return {
        "team": team_pred,
        "team_confidence": round(team_conf, 3),
    }

# ----------------------------
# RUN SERVER
# ----------------------------
if __name__ == "__main__":
    uvicorn.run("ml_api:app", host="127.0.0.1", port=5000, reload=True)