import "./style.css"; 
import { Conversation } from "@elevenlabs/client";
import Vapi from "@vapi-ai/web";



let conversation = null;// This will hold the current conversation session

let lastMessage = ""; // This will hold the last message to prevent duplicates
const vapi = new Vapi.default("4dc0dbc6-8b1b-439b-8a13-21651273480c"); // step 1 of connecting to vapi
const VAPI_ASSISTANT_ID = "27d6af1e-1d26-4cd1-9b43-fe003428b57e"; //step 2 of connecting to vapi

// FIX: Added backticks around the HTML string
document.querySelector("#app").innerHTML = ` 
<div>

    <h1>Student Interview</h1>

    <input id="name" placeholder="Student Name"/>

    <div style="margin:20px 0;">

        <label style="margin-right:20px;">
            <input
                type="radio"
                name="provider"
                value="elevenlabs"
                checked
            />
            ElevenLabs
        </label>

        <label>
            <input
                type="radio"
                name="provider"
                value="vapi"
            />
            Vapi
        </label>

    </div>

    <button id="startBtn">
        START
    </button>

    <button id="stopBtn" disabled>
        STOP
    </button>

    <p id="status"></p>

    <hr>

    <h2>Conversation</h2>

    <div id="transcript"></div>

</div>
`;

const status = document.getElementById("status"); // This will display the current status of the interview

document 
    .getElementById("startBtn") 
    .addEventListener("click", startInterview);  // Add event listener for the start button

document
    .getElementById("stopBtn")
    .addEventListener("click", stopInterview); // Add event listener for the stop button

function addMessage(sender, text) { // This function adds a message to the transcript
    if (!text) return; // If the text is empty, do nothing

    text = text.trim(); // Trim whitespace from the text

    if (text === "" || text === "...") return;     // If the text is empty or just ellipsis, do nothing

    // Prevent duplicate consecutive messages
    if (text === lastMessage) return;  // If the text is the same as the last message, do nothing

    lastMessage = text; // Update the last message to the current text

    const transcript = document.getElementById("transcript"); // Get the transcript element where messages will be displayed
    const div = document.createElement("div");

    div.className = sender;

    // FIX: Added backticks around the innerHTML template literal
    div.innerHTML = `<strong>${sender === "ai" ? "AI" : "You"}:</strong> ${text}`;

    transcript.appendChild(div);
    transcript.scrollTop = transcript.scrollHeight;
}

async function startInterview() {
    try {
        const studentName = document.getElementById("name").value;
        const provider = document.querySelector(  
            'input[name="provider"]:checked' 
        ).value;

        console.log("Selected Provider:", provider); // Log the selected provider to the console

        if (!studentName) {
            alert("Please enter student name.");
            return;
        }

        lastMessage = "";
        document.getElementById("transcript").innerHTML = "";

        document.getElementById("startBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;
        // Choose AI Provider
        if (provider === "elevenlabs") {

            console.log("Starting ElevenLabs Interview...");

            // We'll keep your existing ElevenLabs code here.
            // Do NOT remove it.

        }
        else {

            console.log("Starting Vapi Interview...");

            status.innerText = "Requesting microphone...";

            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            status.innerText = "Connecting to Vapi...";

            await vapi.start(VAPI_ASSISTANT_ID);// step 3 , all of connecting microphone and start session with vapi

            status.innerText = "Interview Started";

            // AI messages
            vapi.on("message", (message) => {  // step 4, listen to messages from vapi

                console.log("Vapi Message:", message);

                if (!message) return;

                // AI response
                if (
                    message.type === "transcript" &&
                    message.role === "assistant" &&
                    message.transcriptType === "final"
                ) {
                    addMessage("ai", message.transcript);
                }

                // User speech
                if (
                    message.type === "transcript" &&
                    message.role === "user" &&
                    message.transcriptType === "final"
                ) {
                    addMessage("user", message.transcript);
                }

            });

            return;

        }

        status.innerText = "Getting signed URL...";

        const response = await fetch(
            "http://127.0.0.1:5000/get-signed-url"
        );

        const data = await response.json();

        console.log("Signed URL Response:", data);

        status.innerText = "Requesting microphone...";

        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        status.innerText = "Connecting to ElevenLabs...";

        conversation = await Conversation.startSession({
            signedUrl: data.signed_url,

            onConnect() {
                console.log("========== CONNECTED ==========");
                status.innerText = "Interview Started";
            },

            onMessage(message) {
                console.log("========== MESSAGE RECEIVED ==========");
                console.log(message);

                if (!message.message) return;

                const text = message.message.trim();

                if (text === "" || text === "...") return;

                if (message.source === "ai" || message.role === "agent") {
                    addMessage("ai", text);
                }
                else if (message.source === "user" || message.role === "user") {
                    addMessage("user", text);
                }
            },

            onDisconnect(event) {
                console.log("========== DISCONNECTED ==========");
                console.log(event);

                status.innerText = "Interview Ended";

                document.getElementById("startBtn").disabled = false;
                document.getElementById("stopBtn").disabled = true;
            },

            onError(error) {
                console.log("========== ERROR ==========");
                console.log(error);

                status.innerText = "Error";

                document.getElementById("startBtn").disabled = false;
                document.getElementById("stopBtn").disabled = true;
            }
        });
    }
    catch (err) {
        console.log("========== CATCH ERROR ==========");
        console.error(err);

        status.innerText = err.message;

        document.getElementById("startBtn").disabled = false;
        document.getElementById("stopBtn").disabled = true;
    }
}

async function stopInterview() {
    try {
        if (conversation) {
            console.log("========== STOP BUTTON CLICKED ==========");
            await conversation.endSession();
            conversation = null;
        }
    }
    catch (err) {
        console.error(err);
    }

    status.innerText = "Interview Stopped";
    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
}