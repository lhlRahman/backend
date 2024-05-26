import express from 'express';
import bodyParser from 'body-parser';
import { gptProfession, gptCompletion } from './utils.js';

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/schedule', async (req, res) => {
    const profession = req.body.prompt;
    const grade = req.body.grade;
    const response = await gptProfession(profession, grade);
    res.send(response);
});

app.post('/gptCompletion', async (req, res) => {
    try {
        console.log(req.body);

        const { Value: { messages, subject, grade, profession } } = req.body;

        const prompt = {
            role: "system",
            content: `You are a ${profession}. You are teaching a class of ${grade} students about ${subject}. You must prepare a lesson plan for the class. The lesson`
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
