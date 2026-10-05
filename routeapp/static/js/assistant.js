/* =========================================================
   SAFEPATH - ASSISTANT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const assistantButton =
        document.getElementById("assistantBtn");

    const assistantBox =
        document.getElementById("assistantBox");

    const assistantInput =
        document.getElementById("assistantInput");

    const assistantMessages =
        document.getElementById("assistantMessages");

    if (!assistantButton) {
        console.log("Assistant button not found.");
        return;
    }

    /* Open / close assistant */

    assistantButton.addEventListener("click", function () {

        if (assistantBox) {
            assistantBox.classList.toggle("active");
        }

    });


    /* Send message */

    function sendMessage() {

        if (!assistantInput || !assistantMessages) {
            return;
        }

        const message =
            assistantInput.value.trim();

        if (!message) {
            return;
        }


        /* User message */

        addMessage(message, "user");

        assistantInput.value = "";


        /* Assistant response */

        setTimeout(function () {

            const response =
                getAssistantResponse(message);

            addMessage(response, "assistant");

        }, 400);

    }


    /* Enter key */

    if (assistantInput) {

        assistantInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                }

            }
        );

    }


    /* Add message */

    function addMessage(message, type) {

        if (!assistantMessages) {
            return;
        }

        const messageElement =
            document.createElement("div");

        messageElement.className =
            "assistant-message " + type;

        messageElement.textContent = message;

        assistantMessages.appendChild(
            messageElement
        );

        assistantMessages.scrollTop =
            assistantMessages.scrollHeight;

    }


    /* Assistant responses */

    function getAssistantResponse(message) {

        const text =
            message.toLowerCase();


        if (
            text.includes("route") ||
            text.includes("path")
        ) {

            return "You can use Safe Route to find a safer route between two locations.";

        }


        if (
            text.includes("safety") ||
            text.includes("safe")
        ) {

            return "SafePath analyzes road safety using CCTV, street lights, police stations, hospitals and crime-related information.";

        }


        if (
            text.includes("map")
        ) {

            return "Open the Safety Map to explore road segments and their safety scores.";

        }


        if (
            text.includes("dashboard")
        ) {

            return "The Dashboard shows SafePath statistics, safety categories and machine learning information.";

        }


        if (
            text.includes("emergency") ||
            text.includes("sos")
        ) {

            return "For an emergency, open the Emergency page and contact 112.";

        }


        if (
            text.includes("hello") ||
            text.includes("hi")
        ) {

            return "Hello! 👋 I'm the SafePath Assistant. How can I help you?";

        }


        return "I can help you with Safe Route, Safety Map, Dashboard and Emergency features.";

    }


    /* Make function available globally */

    window.sendAssistantMessage =
        sendMessage;


    console.log(
        "SafePath Assistant loaded successfully."
    );

});