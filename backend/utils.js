import OpenAI from 'openai';
import { configDotenv } from 'dotenv';
import Joi from 'joi';

configDotenv();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

const scheduleSchema = Joi.object({
    schedule: Joi.array().items(
        Joi.object({
            class: Joi.string().required(),
            start_time: Joi.string().pattern(/^\d{2}:\d{2} (AM|PM)$/).required(),
            end_time: Joi.string().pattern(/^\d{2}:\d{2} (AM|PM)$/).required(),
        })
    ).required()
});

const quizSchema = Joi.array().items(
    Joi.object({
        question: Joi.string().required(),
        option1: Joi.string().required(),
        option2: Joi.string().required(),
        option3: Joi.string().required(),
        option4: Joi.string().required(),
        correctOption: Joi.string().valid('option1', 'option2', 'option3', 'option4').required(),
    })
).required();

const gptProfession = async (profession, grade) => {
    const prompt = `You are a schedule maker. You will make a schedule for a student between 9am to 3pm. 
    The schedule should include Classes, Duration, and Break Time in between each Class. This response must only be a JSON and you must check if the JSON is valid before submitting it.
    The schedule should be for a student who wants to be a ${profession} and is in grade ${grade}. You must pick the most appropriate classes for the student to take based on the profession and the grade.
    The JSON format should be:
    {
        "schedule": [
            {
                "class": "string",
                "start_time": "string", // in format HH:MM AM/PM
                "end_time": "string", // in format HH:MM AM/PM
            },
            ...
        ]
    }
    Ensure that all times and durations are formatted as strings and adhere to the provided formats.`;

    for (let attempt = 1; attempt <= 6; attempt++) {
        console.log(`Attempt ${attempt}`);
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
            ],
        });

        const responseContent = gptResponse.choices[0].message.content;

        try {
            const parsedResponse = JSON.parse(responseContent);
            const validation = scheduleSchema.validate(parsedResponse);

            if (validation.error) {
                throw new Error("Validation failed");
            }

            return parsedResponse;
        } catch (error) {
            if (attempt === 6) {
                throw new Error("Failed to get a valid JSON response after 6 attempts");
            }
        }
    }
};

const gptCompletion = async (messages) => {
    const chatCompletion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4o',
    });
    return chatCompletion.choices[0].message;
};

const genQuiz = async (all) => {
    const prompt = `You are a quiz generator. Based on the following course content, generate a quiz in JSON format. The quiz should consist of multiple-choice questions that test the students' understanding of the provided material. Each question should have four options, and one correct answer. Here is the course content: ${all}. The JSON format should be:

    [
        {
            "question": "string", // A question relevant to the provided course content.
            "option1": "string", // First possible answer.
            "option2": "string", // Second possible answer.
            "option3": "string", // Third possible answer.
            "option4": "string", // Fourth possible answer.
            "correctOption": "option1" // The correct answer, which can be "option1", "option2", "option3", or "option4".
        },
        ...
    ]
    
    Ensure the following:
    1. All questions are directly related to the provided course content.
    2. The format strictly adheres to the specified JSON structure.
    3. Each question must be clear and concise.
    4. Options should be plausible answers to the questions.
    5. The correct option should be clearly indicated.
    
    Example of a valid quiz entry based on arithmetic:
    
    [
        {
            "question": "What is 5 + 3?",
            "option1": "7",
            "option2": "8",
            "option3": "9",
            "option4": "10",
            "correctOption": "option2"
        },
        {
            "question": "Which of the following is a prime number?",
            "option1": "4",
            "option2": "6",
            "option3": "7",
            "option4": "8",
            "correctOption": "option3"
        }
    ]
    
    Use this example as a reference to ensure the output matches the required format.`;
    

    for (let attempt = 1; attempt <= 10; attempt++) {
        console.log(`Attempt ${attempt}`);
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
            ],
        });

        const responseContent = gptResponse.choices[0].message.content;

        try {
            const parsedResponse = JSON.parse(responseContent);
            const validation = quizSchema.validate(parsedResponse);

            if (validation.error) {
                throw new Error("Validation failed");
            }

            return parsedResponse;
        } catch (error) {
            if (attempt === 10) {
                throw new Error("Failed to get a valid JSON response after 10 attempts");
            }
        }
    }
};

export { gptProfession, gptCompletion, genQuiz };
