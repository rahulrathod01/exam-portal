let questions = [];
let currentQuestionIndex = 0;
let timer;
let score = 0;
const TIMER_DURATION = 60 * 15;
let selectedAnswers = []; // Array to keep track of selected answers
let shuffledOptions = []; // Array to keep track of shuffled options

document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("Please log in to access the exam.");
        window.location.href = "../loginpage/login.html"; // Redirect to login if not logged in
    } else {
        document.getElementById("app").style.display = "block";
    }
});

function startExam(category) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("Please log in to take the exam.");
        window.location.href = "../loginpage/login.html"; // Redirect to login if not logged in
        return;
    }

    // Check if the user is registered
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const isRegistered = registeredUsers.some(user => user.email === loggedInUser.email);

    if (!isRegistered) {
        alert("You need to register first. Redirecting to the registration page.");
        window.location.href = "../Registratin/registration.html"; // Redirect to registration if not registered
        return;
    }

    // Start fetching questions and set up the exam
    document.getElementById("spinner").style.display = "block";
    document.getElementById("category-list").style.display = "none";

    fetch(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`)
        .then(response => response.json())
        .then(data => {
            if (data.response_code === 0) {
                questions = data.results;
                currentQuestionIndex = 0;
                score = 0;
                selectedAnswers = Array(questions.length).fill(null); // Initialize selected answers array
                shuffledOptions = Array(questions.length).fill(null); // Initialize shuffled options array
                document.getElementById("category-title").innerText = `Exam for ${questions[0].category}`;
                document.getElementById("exam-section").style.display = "block";
                document.getElementById("spinner").style.display = "none";

                loadQuestion();
                startTimer();
            } else {
                alert("Error fetching questions. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error fetching questions:", error);
            alert("Error fetching questions. Please try again.");
        });
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endExam();
        return;
    }

    const question = questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;

    // Check if the options are already shuffled for this question
    if (!shuffledOptions[currentQuestionIndex]) {
        const options = [...question.incorrect_answers, question.correct_answer];
        shuffledOptions[currentQuestionIndex] = shuffleArray(options);
    }

    const options = shuffledOptions[currentQuestionIndex];
    let html = `<h3>Question ${questionNumber}: ${question.question}</h3>`;

    if (question.type === "multiple") {
        options.forEach((option, index) => {
            const isChecked = selectedAnswers[currentQuestionIndex] === option ? "checked" : "";
            html += `
                <div>
                    <input type="radio" name="option" id="option${index}" value="${option}" ${isChecked}>
                    <label class="custom-radio" for="option${index}">${option}</label>
                </div>`;
        });
    } else if (question.type === "boolean") {
        const trueChecked = selectedAnswers[currentQuestionIndex] === "True" ? "checked" : "";
        const falseChecked = selectedAnswers[currentQuestionIndex] === "False" ? "checked" : "";
        html += `
            <div>
                <input type="radio" name="option" id="optionTrue" value="True" ${trueChecked}>
                <label class="custom-radio" for="optionTrue">True</label>
            </div>
            <div>
                <input type="radio" name="option" id="optionFalse" value="False" ${falseChecked}>
                <label class="custom-radio" for="optionFalse">False</label>
            </div>`;
    }

    // Show Previous button if not on the first question
    if (currentQuestionIndex > 0) {
        html += `<button id="previous-button" onclick="loadPreviousQuestion()">Previous Question</button>`;
    }

    // Show Next button or Submit button based on the question index
    if (currentQuestionIndex === questions.length - 1) {
        html += `<button id="submit-button" onclick="submitExam()">Submit</button>`;
    } else {
        html += `<button id="next-button" onclick="loadNextQuestion()">Next Question</button>`;
    }

    document.getElementById("question-container").innerHTML = html;
}

function loadNextQuestion() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value; // Store selected answer
    }
    currentQuestionIndex++;
    loadQuestion();
}

function loadPreviousQuestion() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value; // Store selected answer
    }
    currentQuestionIndex--;
    loadQuestion();
}

function submitExam() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value; // Store selected answer
    }
    checkAnswers();
}

function checkAnswers() {
    questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correct_answer) {
            score++;
        }
    });

    clearInterval(timer);
    document.getElementById("exam-section").style.display = "none";
    document.getElementById("scorecard").style.display = "block";
    document.getElementById("score").innerText = `Your score is ${score} out of ${questions.length}.`;
}

function startTimer() {
    let timeLeft = TIMER_DURATION;
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitExam();
            return;
        }
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById("timer-count").innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, 1000);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
