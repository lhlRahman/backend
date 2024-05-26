import express from 'express';
import bodyParser from 'body-parser';
import { gptProfession, gptCompletion, genQuiz } from './utils.js';

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/schedule', async (req, res) => {
    console.log(req.query);
    const { grade, profession } = req.query;
    const response = await gptProfession(profession, grade);
    res.send(response);
});

app.post('/quiz', async (req, res) => {
   const all = JSON.stringify(req.body)
    const response = await genQuiz(all);
    res.send(response);
});

app.post('/gptCompletion', async (req, res) => {
    try {
        console.log(req.body);

        const { Value: { messages, subject, grade, profession } } = req.body;

        // Extract and handle the values
        const subjectValue = subject?.Value || 'a subject';
        const gradeValue = grade?.Value || 'students';
        const professionValue = profession?.Value || 'a professional';

        const prompt = {
            role: "system",
            content: `You are ${professionValue} teaching a class of ${gradeValue} about ${subjectValue}. Speak directly to the students and make the lesson engaging and interactive. Introduce the topic, explain the key concepts, provide examples, and ask questions to ensure understanding. Encourage participation and make the learning experience fun and educational. you are a interactive tutor so you must make the lesson interactive and engaging. and you must teach with chucks and confirm with the student, keep your replies to one paragraph max.`
        };

        function extractMessages(json) {
            if (!json || json.Value === null) {
                return [];
            }
            return json.Value.map(item => ({
                role: item.role,
                content: item.message,
            }));
        }

        const messagesArray = messages ? extractMessages(messages) : [];
        messagesArray.unshift(prompt);

        const response = await gptCompletion(messagesArray);
        console.log('Our response is: ' + JSON.stringify(response.content));

        res.send(response.content);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request.');
    }
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
