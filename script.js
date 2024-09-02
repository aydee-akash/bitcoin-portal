const rssFeedElement = document.getElementById('rss-feed');

// Quiz data
const quizQuestions = [
    {
        question: "What is Bitcoin?",
        options: ["A type of digital currency", "A type of stock", "A type of bond", "A physical coin"],
        answer: 0,
    },
    {
        question: "Who created Bitcoin?",
        options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Roger Ver"],
        answer: 1,
    },
    {
        question: "What technology does Bitcoin use?",
        options: ["Blockchain", "Cloud computing", "Artificial intelligence", "Quantum computing"],
        answer: 0,
    },
    {
        question: "What is the maximum supply of Bitcoin?",
        options: ["21 million", "50 million", "1 billion", "No limit"],
        answer: 0,
    },
    {
        question: "What is the unit of Bitcoin?",
        options: ["Bit", "Satoshi", "Byte", "Ether"],
        answer: 1,
    },
];

let currentQuestionIndex = 0;
let score = 0;

// Fetch RSS feed using a proxy to avoid CORS issues
const fetchRSSFeed = async () => {
    const rssUrl = 'https://cointelegraph.com/rss/tag/bitcoin';
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "application/xml");

        const items = xmlDoc.querySelectorAll("item");
        let news = [];  // Initialize an array to hold news items

        items.forEach(item => {
            const title = item.querySelector("title").textContent;
            const link = item.querySelector("link").textContent;
            let description = item.querySelector("description").textContent;

            let imageUrl = '';

            // Try to get the image from media:content or enclosure
            const mediaContent = item.querySelector('media\\:content, enclosure');
            if (mediaContent) {
                imageUrl = mediaContent.getAttribute('url');
            }

            // Clean the description to remove any images
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;

            // Remove all images from the description
            const images = tempDiv.querySelectorAll('img');
            images.forEach(img => img.remove());

            // Update description to remove images
            description = tempDiv.innerHTML;

            // Push the news item into the array
            news.push({
                title,
                link,
                description,
                thumbnail: imageUrl || 'default-thumbnail.png'  // Fallback thumbnail
            });
        });

        displayNews(news);  // Call the displayNews function with the news array

    } catch (error) {
        rssFeedElement.innerHTML = `<li>Error fetching RSS feed: ${error}</li>`;
        console.error('Error fetching RSS feed:', error);
    }
};

// Display Bitcoin News
function displayNews(news) {
    const newsContainer = document.getElementById('news');
    newsContainer.innerHTML = '';  // Clear any previous content

    news.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}" class="thumbnail">
            <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
            <p>${item.description}</p>`;
        newsContainer.appendChild(newsItem);
    });
}

// Show a specific section based on user click
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'price-section') {
        fetchBitcoinPrice();
    }

     if (sectionId === 'chart-section') {
     loadTradingViewWidget();
    }
}

function loadTradingViewWidget() {
    const widgetContainer = document.getElementById('tradingview-widget-container');
    widgetContainer.innerHTML = ''; // Clear any previous widget

    // Create the TradingView widget script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: 'COINBASE:BTCUSD',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '2',
        locale: 'en',
        allow_symbol_change: true,
        calendar: false,
        support_host: 'https://www.tradingview.com'
    });

    widgetContainer.appendChild(script);
}

// Initialize the portal by fetching the RSS feed and displaying the news
async function init() {
    await fetchRSSFeed();
    // Initialize quiz
    initQuiz();
    
    // Initialize price chart with dummy data
    initPriceChart();
}

// Call the init function when the page loads
window.onload = init;

// Quiz Functions
function initQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}

function showQuestion() {
    const quizContainer = document.getElementById('quiz-section');
    quizContainer.innerHTML = '';

    if (currentQuestionIndex < quizQuestions.length) {
        const questionData = quizQuestions[currentQuestionIndex];
        
        const questionElement = document.createElement('h3');
        questionElement.textContent = questionData.question;

        quizContainer.appendChild(questionElement);

        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'quiz-option';
            button.onclick = () => checkAnswer(index);
            quizContainer.appendChild(button);
        });
    } else {
        showScore();
    }
}

function checkAnswer(selectedIndex) {
    const questionData = quizQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.quiz-option');

    if (selectedIndex === questionData.answer) {
        score++;
        buttons[selectedIndex].classList.add('correct');
    } else {
        buttons[selectedIndex].classList.add('incorrect');
        buttons[questionData.answer].classList.add('correct'); // Show correct answer
    }

    // Disable buttons after selection
    buttons.forEach(button => {
        button.disabled = true;
    });

    // Move to the next question after a short delay
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 1500);
}

function showScore() {
    const quizContainer = document.getElementById('quiz-section');
    quizContainer.innerHTML = `<h3>Your score: ${score} / ${quizQuestions.length}</h3>`;
}

// Fetch Bitcoin Price
async function fetchBitcoinPrice() {
    const apiUrl = 'https://api.coindesk.com/v1/bpi/currentprice/BTC.json';

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const price = data.bpi.USD.rate_float.toFixed(2);
        document.getElementById('bitcoin-price').innerText = `$${price}`;
    } catch (error) {
        document.getElementById('bitcoin-price').innerText = 'Error fetching price';
        console.error('Error fetching price:', error);
    }
}

// CSS to enhance appearance (add to your existing CSS)

