# StudySpark AI

**StudySpark AI** is an intelligent, topic-based learning assistant powered by **Google Gemini**.  
It helps students understand any concept by generating structured study material instantly — including explanations, key concepts, practice questions, equations or code examples, and even image reference suggestions.

This project is built to make self-learning faster, more organized, and more accessible.

---

## 🚀 Features

- **AI-Generated Topic Explanation**  
  Enter any topic (e.g., *Photosynthesis*, *Newton’s Laws*, *Recursion in JS*) and get a clear, structured explanation.

- **Dynamic Learning Sections**  
  Depending on the topic type, the sidebar automatically changes:
  - For **Math/Physics** → Key equations formatted with **MathJax**
  - For **Programming** → Code examples in formatted Markdown blocks
  - For **Biology/Descriptive subjects** → Key components or concept lists

- **Practice Questions**  
  Each topic comes with **5 generated practice questions** to help reinforce understanding.

- **Key Concepts Glossary**  
  Important terms listed clearly with short definitions.

- **Image / Diagram Suggestions**  
  Helpful keywords for searching reference diagrams online.

- **Clean UI with Dark Theme**  
  Stylish responsive layout with accordion sections for organized study flow.

---

## 🧠 How It Works

1. User enters a topic.
2. The server sends a structured prompt to **Google Gemini** (`gemini-1.5-flash`).
3. The AI returns multiple formatted content blocks.
4. The application parses the text into:
   - Explanation
   - Key Concepts
   - Practice Questions
   - Equations or Code Examples
   - Image Keywords
5. Math equations are rendered with **MathJax** for clarity.

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| Backend | Node.js, Express.js |
| Frontend Templating | EJS |
| AI Engine | Google Generative AI (Gemini) |
| Styling | Custom CSS (Dark/Night UI) |
| Equation Rendering | MathJax |
| Markdown Parsing | `marked` package |

---

## 📦 Installation & Setup

Clone the repository:


git clone https://github.com/sumit-sh2009/study-spark-ai.git
cd study-spark-ai

Install dependencies:

npm install


Create a .env file in the project root:

GEMINI_API_KEY=your_api_key_here


Start the server:

npm start


Visit:

http://localhost:3000



