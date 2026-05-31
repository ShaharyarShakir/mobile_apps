import marimo

__generated_with = "0.19.10"
app = marimo.App(width="full")


@app.cell
def _():
    import pandas as pd
    import string
    import nltk
    import joblib
    from nltk.corpus import stopwords
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score

    return (
        LogisticRegression,
        Pipeline,
        TfidfVectorizer,
        accuracy_score,
        joblib,
        nltk,
        pd,
        stopwords,
        string,
        train_test_split,
    )


@app.cell
def _(pd):
    # Load data
    df = pd.read_csv('train.txt', sep=';', header=None, names=['text','emotion'])
    return (df,)


@app.cell
def _(nltk, stopwords):
    nltk.download('stopwords')
    stop_words = set(stopwords.words('english'))
    return (stop_words,)


@app.cell
def _(stop_words, string):
    def clean_text(text):
        text = text.lower()
        text = text.translate(str.maketrans('', '', string.punctuation))
        text = ''.join([i for i in text if not i.isdigit()])
        text = ''.join([i for i in text if i.isascii()])
        text = " ".join([word for word in text.split() if word not in stop_words])
        return text

    return (clean_text,)


@app.cell
def _(df):
    emotion_mapping = {label: idx for idx, label in enumerate(df['emotion'].unique())}
    df['emotion'] = df['emotion'].map(emotion_mapping)
    return (emotion_mapping,)


@app.cell
def _(clean_text, df):
    df['text'] = df['text'].apply(clean_text)
    return


@app.cell
def _(df, train_test_split):
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['emotion'], test_size=0.2, random_state=42
    )
    return X_test, X_train, y_test, y_train


@app.cell
def _(LogisticRegression, Pipeline, TfidfVectorizer):
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('model', LogisticRegression(max_iter=1000))
    ])
    return (pipeline,)


@app.cell
def _(X_train, pipeline, y_train):
    pipeline.fit(X_train, y_train)
    return


@app.cell
def _(X_test, accuracy_score, pipeline, y_test):
    pred = pipeline.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, pred))
    return


@app.cell
def _(emotion_mapping, joblib, pipeline):
    joblib.dump(pipeline, "emotion_pipeline.pkl")
    joblib.dump(emotion_mapping, "emotion_mapping.pkl")

    print("Model Saved Successfully")
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
