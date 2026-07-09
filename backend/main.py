from flask import render_template

from fastapi import FastAPI

app = FastAPI()

@app.route("/")
def home():
    return render_template("index.html")