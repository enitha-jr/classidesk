# ----------------------------
# IMPORTS
# ----------------------------
import pandas as pd
import string
import re
import joblib

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score

# ----------------------------
# PREPROCESSING SETUP
# ----------------------------
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def preprocess_text(text):

    if pd.isnull(text):
        return ""

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
# LOAD DATASET
# ----------------------------
df = pd.read_csv("dataset.csv")

df = df.dropna(subset=["text", "team"])

df["clean_text"] = df["text"].apply(preprocess_text)

print("\nTeam Distribution:")
print(df["team"].value_counts())

# ----------------------------
# TF-IDF VECTORIZATION
# ----------------------------
vectorizer = TfidfVectorizer(
    max_features=7000,
    ngram_range=(1,2),
    min_df=2
)

X = vectorizer.fit_transform(df["clean_text"])
y = df["team"]

# ----------------------------
# TRAIN TEST SPLIT
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ----------------------------
# TRAIN MODEL
# ----------------------------
team_model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

team_model.fit(X_train, y_train)

# ----------------------------
# EVALUATION
# ----------------------------
pred = team_model.predict(X_test)

print("\n--- Team Prediction ---")
print("Accuracy:", accuracy_score(y_test, pred))
print("F1 Score:", f1_score(y_test, pred, average="weighted"))

# ----------------------------
# SAVE MODEL
# ----------------------------
joblib.dump(team_model, "team_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("\nModels Saved Successfully 🚀")