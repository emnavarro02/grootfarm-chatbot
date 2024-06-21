const express = require('express');
const path = require('path');
const natural = require('natural');
const fs = require('fs');
const fetch = require('node-fetch');

const URL_COORDINATOR = 'http://127.0.0.1:5000/api/v1/'
const exists = fs.existsSync('classifier.json');
const existAnswers = fs.existsSync('answers.json');

const log_prefix_info = "[I]"
const log_prefix_debug = "[D]"
const log_prefix_warn = "[W]"
const log_prefix_error = "[E]"

// Loads the classifier 
var classifier;
if (exists) {
    natural.BayesClassifier.load('classifier.json', null, loaded);
} else {
    console.log(`${log_prefix_info} Starting a new classifier`);
    classifier = new natural.BayesClassifier();
}

let answers;
if (existAnswers) {
    // Reads the file that contains the answers
    let answersRawData = fs.readFileSync('answers.json');
    // Parse JSON file
    answers = JSON.parse(answersRawData);
}

// Checks wether the classifier has been loaded
function loaded(err, cf) {
    classifier = cf;
    console.log(`${log_prefix_info} Classifier loaded`);
}

// Retrieves message category based on BayerClassifier
function getMessageCategory(message) {
    let category = classifier.classify(message);
    return category;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function buildAnswer(category, status, comparison) {
    let response;

    // Detect the lenght of the nested object
    let max = Object.keys(answers[category][status][comparison]['answer']).length;

    // Get a random answer
    pos = getRandomInt(0, max);

    // Get the answer
    response = answers[category][status][comparison]['answer'][pos];

    // Write to console
    console.log(`${log_prefix_debug} Status: ${status}; Answer: ${response}`);

    // Return the answer
    return response;
}


// ROUTES
var app = express();
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/frontend/index.html'));
});

app.get('/test', function (req, res) {
    res.json({ "status": 200 })
});

app.get('/response', async (req, res) => {
    console.log(`${log_prefix_info} Got a new message in path '/response'`);

    // Check if there's a message in the query
    if ("message" in req.query) {

        // Create a variable to store the response
        let response;

        // Get the message
        message = req.query.message;

        // Figure out the category of the message 
        let category = getMessageCategory(message);
        console.log(`${log_prefix_debug} The message's category is: ${category}`);

        // Switch based on the category
        switch (category) {
            case "greetings":
                // Detect the lenght of the nested object
                var max = Object.keys(answers[category]['answer']).length;
                // Get a random answer
                pos = getRandomInt(0, max);
                // Get the answer
                response = answers[category]['answer'][pos];
                break;
            case "temperature":
            case "moisture":
                try {
                    // Get the data from the coordinator
                    let r = await fetch(`${URL_COORDINATOR}/${category}`);

                    // Parse the data
                    let data = await r.json();

                    // Get status out of the parsed data
                    let status = data['wellbeing']['status'];         // 'good', 'warn', 'dire'

                    // Get the comparison out of the parsed data
                    let comparison = data['wellbeing']['comparison']; // 'higher', 'good', 'lower'

                    // Get the raw value out of the parsed data
                    let value = data['raw'];

                    // Build the answer
                    console.log(`${log_prefix_debug} message: ${message}, category: ${category}, status: ${status}, comparison: ${comparison}, value: ${value}`);
                    let answer = buildAnswer(category, status, comparison);

                    // Build the response
                    response = `${answer} My ${category} is ${value}.`;
                    console.log(`${log_prefix_debug} Response: ${response}`);
                }
                catch (e) {
                    console.log(`${log_prefix_error} Something went wrong: ${e}.`);
                    return res.json({ "status": 500, "response": "Sorry, something went wrong. Try again in a few seconds..." });
                }
                break;
            default:
                // Detect the lenght of the nested object
                var max = Object.keys(answers["default"]['answer']).length;

                // Get a random answer
                pos = getRandomInt(0, max);

                // Get the answer
                response = answers["default"]['answer'][pos];
                break;
        }
        // Finally, retrun the response
        console.log(`${log_prefix_debug} Status: 200; Return response: ${response}`);
        return res.json({ "status": 200, "message": message, "category": category, "response": response });
    }
    else {
        console.log(`${log_prefix_warn} Status: 501; Message seems empty. Ignoring it.`);
        // 501 = not implemented =]
        return res.json({ "status": 501, "response": "Message seems empty. Ignoring it." })
    }
});

app.listen(3000, function () {
    console.log(`${log_prefix_info} App started, listening on port 3000!`)
});