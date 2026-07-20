import os
import requests
from flask import render_template
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.core import RequestOptions
from mongodb import interviews

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path=dotenv_path)

app = Flask(__name__)


def get_config():
    load_dotenv(dotenv_path=dotenv_path, override=False)
    api_key = os.getenv("ELEVENLABS_API_KEY")
    agent_id = os.getenv("ELEVENLABS_AGENT_ID")
    return api_key, agent_id


def get_elevenlabs_client():
    api_key, agent_id = get_config()
    if not api_key:
        raise RuntimeError("ELEVENLABS_API_KEY is not set. Add it to the project .env file.")
    if not agent_id:
        raise RuntimeError("ELEVENLABS_AGENT_ID is not set. Add it to the project .env file.")
    return ElevenLabs(api_key=api_key), agent_id


def start_agent_interview(user_message: str):
    client, agent_id = get_elevenlabs_client()
    request_options = RequestOptions(timeout=15)

    agent = client.conversational_ai.agents.get(
        agent_id=agent_id,
        request_options=request_options,
    )

    return {
        "status": "ready",
        "message": "ElevenLabs agent is connected",
        "agent_name": getattr(agent, "name", None),
        "agent_id": agent_id,
        "prompt": user_message,
    }


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/start-interview", methods=["GET", "POST"])
def interview():

    payload = request.get_json(silent=True) or {}

    user_message = (
        payload.get("message")
        or payload.get("prompt")
        or "Please introduce yourself and start the interview."
    )

    try:

        response = start_agent_interview(user_message)

        response_payload = (
            response
            if isinstance(response, dict)
            else (
                response.model_dump()
                if hasattr(response, "model_dump")
                else str(response)
            )
        )

        _, agent_id = get_config()

        return jsonify({
            "status": "success",
            "message": "Interview started with the ElevenLabs agent",
            "agent_id": agent_id,
            "response": response_payload,
        })

    except Exception as exc:

        return jsonify({
            "status": "error",
            "message": "Could not start the ElevenLabs agent",
            "details": str(exc),
        }), 502


@app.route("/get-signed-url", methods=["GET"])
def get_signed_url():

    try:

        api_key, agent_id = get_config()

        url = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"

        headers = {
            "xi-api-key": api_key
        }

        params = {
            "agent_id": agent_id
        }

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=20
        )

        if response.status_code != 200:

            return jsonify({
                "status": "error",
                "details": response.text
            }), response.status_code

        return jsonify(response.json())

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ==========================================================
# NEW API
# ==========================================================

@app.route("/save-interview", methods=["POST"])
def save_interview():

    try:

        data = request.get_json()

        interviews.insert_one({

            "student_name": data.get("student_name"),

            "sender": data.get("sender"),

            "text": data.get("text")

        })

        return jsonify({

            "status": "success",

            "message": "Transcript saved successfully"

        })

    except Exception as e:

        return jsonify({

            "status": "error",

            "message": str(e)

        }), 500


# ==========================================================

if __name__ == "__main__":

    debug_mode = os.getenv(
        "FLASK_DEBUG",
        "0"
    ).lower() in {
        "1",
        "true",
        "yes",
        "on"
    }

    app.run(
        debug=debug_mode,
        use_reloader=False,
        host="0.0.0.0",
        port=5000
    )