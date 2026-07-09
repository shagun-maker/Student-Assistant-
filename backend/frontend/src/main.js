import './style.css';
import { Conversation } from "@elevenlabs/client";

document.querySelector('#app').innerHTML = `
  <div>
      <h1>Student AI Interview</h1>

      <input id="name" placeholder="Student Name"/>

      <button id="startBtn">
          Start Interview
      </button>

      <p id="status"></p>
  </div>
`;

const status = document.getElementById("status");

document
.getElementById("startBtn")
.addEventListener("click", startInterview);

async function startInterview() {

    try {

        status.innerText = "Getting signed URL...";

        const response = await fetch(
            "http://127.0.0.1:5000/get-signed-url"
        );

        const data = await response.json();

        status.innerText = "Requesting microphone...";

        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        status.innerText = "Connecting to ElevenLabs...";

        const conversation = await Conversation.startSession({

            signedUrl: data.signed_url,

            onConnect() {
                status.innerText = "Connected";
                console.log("Connected");
            },

            onDisconnect() {
                status.innerText = "Disconnected";
                console.log("Disconnected");
            },

            onError(error) {
                status.innerText = "Error";
                console.error(error);
            }

        });

        window.conversation = conversation;

    }

    catch(err){

        console.error(err);

        status.innerText = err.message;

    }

}