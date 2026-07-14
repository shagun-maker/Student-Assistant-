import "./style.css";
import { Conversation } from "@elevenlabs/client";

let conversation = null;
let lastMessage = "";

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

    <hr>

    <h2>Conversation</h2>

    <div id="transcript"></div>

</div>
`;

const status = document.getElementById("status");

document
    .getElementById("startBtn")
    .addEventListener("click", startInterview);

document
    .getElementById("stopBtn")
    .addEventListener("click", stopInterview);

function addMessage(sender, text) {

    if (!text) return;

    text = text.trim();

    if (text === "" || text === "...") return;

    // Prevent duplicate consecutive messages
    if (text === lastMessage) return;

    lastMessage = text;

    const transcript = document.getElementById("transcript");

    const div = document.createElement("div");

    div.className = sender;

    div.innerHTML = `
        <strong>${sender === "ai" ? "AI" : "You"}:</strong>
        ${text}
    `;

    transcript.appendChild(div);

    transcript.scrollTop = transcript.scrollHeight;
}

async function startInterview() {

    try {

        const studentName = document.getElementById("name").value;

        if (!studentName) {

            alert("Please enter student name.");

            return;

        }

        lastMessage = "";
        document.getElementById("transcript").innerHTML = "";

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

                console.log("Connected");

                status.innerText = "Interview Started";

            },

            onMessage(message) {

                console.log("========== MESSAGE RECEIVED ==========");
                console.log(message);

                if (!message.message) return;

                const text = message.message.trim();

                if (text === "" || text === "...") return;

                // AI message
                if (message.source === "ai" || message.role === "agent") {

                    addMessage("ai", text);

                }

                // User message
                else if (message.source === "user" || message.role === "user") {

                    addMessage("user", text);

                }

            },

            onDisconnect() {

                console.log("Disconnected");

                status.innerText = "Interview Ended";

                document.getElementById("startBtn").disabled = false;
                document.getElementById("stopBtn").disabled = true;

            },

            onError(error) {

                console.error(error);

                status.innerText = "Error";

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

        }

    }

    catch(err){

        console.error(err);

    }

    status.innerText = "Interview Stopped";

    document.getElementById("startBtn").disabled = false;

    document.getElementById("stopBtn").disabled = true;

}