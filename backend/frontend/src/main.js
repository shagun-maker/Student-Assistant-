import "./style.css";
import { Conversation } from "@elevenlabs/client";

let conversation = null;

document.querySelector("#app").innerHTML = `
<div>
    <h1>Student AI Interview</h1>

    <input id="name" placeholder="Student Name"/>

    <button id="startBtn">
        Start Interview
    </button>

    <button id="stopBtn" disabled>
        Stop Interview
    </button>

    <p id="status"></p>
</div>
`;

const status = document.getElementById("status");

document
    .getElementById("startBtn")
    .addEventListener("click", startInterview);

document
    .getElementById("stopBtn")
    .addEventListener("click", stopInterview);

async function startInterview() {

    try {

        const studentName = document.getElementById("name").value;

        if (!studentName) {
            alert("Please enter student name.");
            return;
        }

        document.getElementById("startBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;

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

        conversation = await Conversation.startSession({

            signedUrl: data.signed_url,

            onConnect() {

                status.innerText = "Interview Started";

                console.log("Connected");

            },

            onDisconnect() {

                status.innerText = "Interview Ended";

                console.log("Disconnected");

                document.getElementById("startBtn").disabled = false;
                document.getElementById("stopBtn").disabled = true;

            },

            onError(error) {

                status.innerText = "Error";

                console.error(error);

                document.getElementById("startBtn").disabled = false;
                document.getElementById("stopBtn").disabled = true;

            }

        });

    }

    catch(err){

        console.error(err);

        status.innerText = err.message;

        document.getElementById("startBtn").disabled = false;
        document.getElementById("stopBtn").disabled = true;

    }

}

async function stopInterview(){

    try{

        if(conversation){

            await conversation.endSession();

            conversation = null;

            status.innerText = "Interview Stopped";

        }

    }

    catch(err){

        console.error(err);

    }

    document.getElementById("startBtn").disabled = false;

    document.getElementById("stopBtn").disabled = true;

}