from flask import Blueprint

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