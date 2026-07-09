async function addStudent() {
    const name = document.getElementById("name").value || "Student";
    const message = `Start an interview for ${name}. Ask one question at a time and evaluate the answer.`;
    const statusBox = document.getElementById("students");
    const responseBox = document.getElementById("interview-response");

    statusBox.innerHTML = "Starting interview...";
    responseBox.textContent = "";

    try {
        const response = await fetch("http://127.0.0.1:5000/start-interview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });
        const data = await response.json();

        if (data.status === "success") {
            statusBox.innerHTML = "Interview connected successfully.";
            responseBox.textContent = JSON.stringify(data.response, null, 2);
        } else {
            statusBox.innerHTML = "Interview could not be started.";
            responseBox.textContent = data.message + (data.details ? `\n${data.details}` : "");
        }
    } catch (error) {
        statusBox.innerHTML = "Connection failed.";
        responseBox.textContent = error.message;
    }
}