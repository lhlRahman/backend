import express from 'express';
import bodyParser from 'body-parser';
import { gptProfession, gptCompletion } from './utils.js';

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/schedule', async (req, res) => {
    const { Value: { grade, profession } } = req.body;
    const response = await gptProfession(profession, grade);
    res.send(response);
});

app.post('/gptCompletion', async (req, res) => {
    try {
        console.log(req.body);

        const { Value: { messages, subject, grade, profession } } = req.body;

        const prompt = {
            role: "system",
            content: `You are a ${profession} teaching a class of ${grade} students about ${subject}. Speak directly to the students and make the lesson engaging and interactive. Introduce the topic, explain the key concepts, provide examples, and ask questions to ensure understanding. Encourage participation and make the learning experience fun and educational.`
        };

        function extractMessages(json) {
            return json.map(item => ({
                role: item.role,
                content: item.message,
            }));
        }

        const messagesArray = extractMessages(messages);
        messagesArray.unshift(prompt);

        const response = await gptCompletion(messagesArray);
        console.log('Our response is: ' + JSON.stringify(response));

        res.send(response);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send({ error: 'An error occurred while processing your request' });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
