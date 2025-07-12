const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

router.post('/ai-suggestion', async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'User input is required.' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userInput }],
    });

    const suggestion = completion.data.choices[0].message.content;
    res.json({ suggestion });
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get suggestion from AI.' });
  }
});

module.exports = router;
