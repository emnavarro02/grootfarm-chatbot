const divChat = document.getElementById('chat')
const inputTxt = document.getElementById('inputTxt');
const sendBtn = document.getElementById('sendBtn');
const CHATBOT_SERVER = 'http://localhost:3000/response'


// The first position of each array corresponds to the elements of the user, 
// and the second position corresponds to the elements of the bot.

// Message buble's background collor 
const messageBubbleCollor = ['container-message-light', 'container-message-dark'];

// User's image
const avatarSrc = ['./img/user.jpg', './img/bot.png'];

// Position of the image within the message buble
const imagePosition = ['image-left', 'image-right'];

// Position of the time within the message buble
const spanTimePos = ['time-right', 'time-left'];

// Event listener for the send button
sendBtn.addEventListener("click", function () {

    // get the message from the input field
    const message = inputTxt.value.trim()

    // check if the message is not empty    
    if (message !== "") {
        // add the user's message to the screen
        addConversationBuble(0, message.trim());

        // clear the input field
        inputTxt.value = ""

        // get the chatbot's response 
        getResponse(message)
            // adds the bot's response to the screen
            .then((response) => { addConversationBuble(1, response) })
    }
});


// Retrieve  response from Chatbot server API
async function getResponse(message) {
    // https://reactgo.com/javascript-get-data-from-api/

    console.log(`Query CHATBOT server API.`);

    // Query chatbot server API
    let resp = await fetch(CHATBOT_SERVER + "?message=" + message);

    // Parse the response
    var data = await resp.json();

    // Return the response
    return data.response
}

function hideloader() {
    document.getElementById('loading').style.display = 'none';
}

function addConversationBuble(user, message) {

    // Log the message and the user
    console.log(`Message: ${message}; User: ${user}`);

    // Prepare the div element that will hold the message
    const div = document.createElement("div");
    div.classList.add(messageBubbleCollor[user]);

    // Add the corresponding image
    let avatar = document.createElement('img');
    avatar.src = avatarSrc[user];
    avatar.classList.add(imagePosition[user]);
    avatar.alt = 'Avatar';

    // Prepare the message to be added
    const messageText = document.createElement('p');
    messageText.innerHTML = message;

    // Get the current date and time
    let date = new Date();
    const spanTime = document.createElement('span');
    spanTime.classList.add(spanTimePos[user]);
    spanTime.innerHTML = date.toLocaleTimeString("en-US");

    // Add all elements to the message bubble
    div.appendChild(avatar);
    div.append(messageText);
    div.append(spanTime);

    // Adds the message bubble to the screen
    divChat.prepend(div);
}