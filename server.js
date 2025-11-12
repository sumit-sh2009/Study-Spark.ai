// Import all libraries and frameworks
// -----------------------------------------------------------------------
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { marked } from "marked";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Express service and web initiation
//-------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 3000;

// Google gemini API
//-------------------------------------------------------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//Setting up relative path to views
//-------------------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Setting up relative path to public
//-------------------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

                                                                //App initiation.

//Home page
//--------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('index', {
        topic: null,
        explanation: null,
        questions: null,
        equations: null,
        concepts: null,
        imageKeywords: null
    });
});

//Submiting user request and getting response
//-----------------------------------------------------------------------------
app.post('/generate', async (req, res) => {
    const { topic } = req.body; // topic = req.body.topic

    try {  
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); //Model selection

        //Prompt to gemini api
        const prompt = `
           You are a helpful learning assistant. For the topic "${topic}", provide the following information in clearly separated sections:
            
            ## Topic Category
            Classify this topic as "Science", "Programming", or "Other".

            ## Dynamic Section Title
            Provide a short, suitable title for the main content section (e.g., "Key Equations", "Key Syntax", "Biological Components").

            ## Dynamic Section Icon
            Suggest a single Font Awesome 6 Free Solid class for the title above (e.g., "fa-square-root-variable", "fa-code", "fa-dna").

            ## Dynamic Section Content
            Based on the topic, provide ONE of the following:
            - For math/physics topics, list important equations as pure LaTeX strings, using $ as a delimiter.
            - For programming topics, provide a single Markdown code block with relevant examples.
            - For descriptive topics (like biology), provide a Markdown list of key components or structures.

            ## Explanation
            A clear and concise explanation of the topic. Use Markdown for formatting.
            ## Key Concepts
            A bulleted list using the format "* **Term:** Definition". Use Markdown formatting.
            ## Practice Questions
            Provide 5 practice questions. Use Markdown formatting.
            ## Image Search Suggestions
            Provide 3-4 descriptive keywords for finding relevant images.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();  //In plain text

        const parseSection = (title, join = false) => { // For seperating topics
            const regex = new RegExp(`## ${title}\\s*([\\s\\S]*?)(?=\\s*##|$)`);
            const match = text.match(regex);
            if (!match || !match[1]) return join ? '' : [];
            const lines = match[1].trim().split('\n').filter(line => line.trim() !== '');
            return join ? lines.join('\n') : lines;
        };

        //Defining seperated topics
        //-----------------------------------------------------------------------------------
        const topicCategory = parseSection("Topic Category", true).trim().toLowerCase();
        const dynamicSectionTitle = parseSection("Dynamic Section Title", true) || 'Key Information';
        const dynamicSectionIcon = parseSection("Dynamic Section Icon", true) || 'fa-circle-info';
        const contentRaw = parseSection("Dynamic Section Content", true);
        const rawExplanation = parseSection("Explanation", true) || 'Could not generate explanation.';
        const conceptsRaw = parseSection("Key Concepts");
        const questionsRaw = parseSection("Practice Questions");
        const imageKeywords = parseSection("Image Search Suggestions");

        let explanation, questions, equations, concepts;

        let isMathContent = (topicCategory === 'science' && contentRaw.includes('$')); // Assigning content under Math category

        // Contents logistics falling under Math
        if (isMathContent) {
            explanation = marked(rawExplanation).replace(/\$(.*?)\$/g, '\\($1\\)');
            questions = questionsRaw.map(q => marked.parseInline(q.replace(/^\d+\.\s*/, '')).replace(/\$(.*?)\$/g, '\\($1\\)'));
            equations = contentRaw.split('$').map(eq => {
                let mathPart = eq.trim();
                let descriptionPart = '';
                const match = mathPart.match(/^(.*?)\s*\((.*?)\)$/);
                if (match) { mathPart = match[1].trim(); descriptionPart = match[2].trim(); }
                return { math: mathPart, description: descriptionPart };
            }).filter(item => item.math.length > 1);
            concepts = conceptsRaw.map(concept => {
                const match = concept.match(/\*\s*\*\*(.*?):\*\*\s*(.*)/);
                if (!match) return null;
                const term = match[1].trim().replace(/\s*\(ˆ\)/g, '').replace(/\$(.*?)\$/g, '\\($1\\)');
                const definition = match[2].trim().replace(/\$(.*?)\$/g, '\\($1\\)');
                return { term, definition };
            }).filter(Boolean);
        
        // For descriptive contents    
        //----------------------------------------------------------------------------------------------------
        } else {
            explanation = marked(rawExplanation);
            questions = questionsRaw.map(q => marked.parseInline(q.replace(/^\d+\.\s*/, '')));
            equations = [{ math: marked(contentRaw), description: '' }];
            concepts = conceptsRaw.map(concept => {
                const match = concept.match(/\*\s*\*\*(.*?):\*\*\s*(.*)/);
                if (!match) return null;
                const term = match[1].trim().replace(/\s*\(ˆ\)/g, '');
                const definition = marked(match[2].trim());
                return { term, definition };
            }).filter(Boolean);
        }
        // Updatig page
        res.render('index', {
            topic: topic,
            explanation: explanation,
            questions: questions,
            dynamicSectionTitle: dynamicSectionTitle,
            dynamicSectionIcon: dynamicSectionIcon,
            equations: equations,
            concepts: concepts,
            imageKeywords: imageKeywords,
            isMathContent: isMathContent
        });
    // Error handling
    // -----------------------------------------------------------------------------------------------------------------------
    } catch (error) {
        console.error('Error generating content:', error);
        res.render('index', {
            topic: topic,
            explanation: 'An error occurred...',
            questions: [],
            equations: [],
            concepts: [],
            imageKeywords: [],
            dynamicSectionTitle: 'Error',
            dynamicSectionIcon: 'fa-bug',
            isMathContent: false
        });
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});