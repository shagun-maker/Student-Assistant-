from flask import Blueprint, request,jsonify
from mongodb import interviews
from bson import ObjectId
from datetime import datetime

interview = Blueprint("interview", __name__)

@interview.route("/start-interview", methods=["GET"])
def start_interview():

    return {
        "status":"success",
        "message":"Interview Started"
    }
@app.route("/get-signed-url", methods=["GET"])
def get_signed_url():

    try:

        url = (
            "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
        )

        headers = {
            "xi-api-key": ELEVENLABS_API_KEY
        }

        params = {
            "agent_id": ELEVENLABS_AGENT_ID
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
    
@interview.route("/create-interview", methods=["POST"])
def create_interview():

    data = request.json

    interview_data = {

        "student_name": data["student_name"],

        "status": "running",

        "started_at": datetime.utcnow(),

        "conversation": []

    }

    result = interviews.insert_one(interview_data)

    return jsonify({

        "session_id": str(result.inserted_id)

    })
@interview.route("/save-message", methods=["POST"])
def save_message():

    data = request.json

    interviews.update_one(

        {

            "_id": ObjectId(data["session_id"])

        },

        {

            "$push":{

                "conversation":{

                    "speaker":data["speaker"],

                    "text":data["text"],

                    "time":datetime.utcnow()

                }

            }

        }

    )

    return jsonify({

        "status":"saved"

    })

@interview.route("/end-interview", methods=["POST"])
def end_interview():

    data = request.json

    interviews.update_one(

        {

            "_id":ObjectId(data["session_id"])

        },

        {

            "$set":{

                "status":"completed",

                "ended_at":datetime.utcnow()

            }

        }

    )

    return jsonify({

        "status":"completed"

    })