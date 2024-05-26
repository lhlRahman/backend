import express from 'express';
import bodyParser from 'body-parser';
import { gptProfession } from './utils.js';

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
	console.log(req.body);
	const inputJson = req.body.Value.messages;

	function extractMessages(json) {
		return json.Value.map((item) => ({
			role: item.Value.role.Value,
			content: item.Value.message.Value,
		}));
	}

	const messages = extractMessages(inputJson);
	const response = await gptCompletion(messages);
	console.log('Our response is: ' + JSON.stringify(response));
	res.send(response);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});