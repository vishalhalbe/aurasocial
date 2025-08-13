import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    const text = completion.choices[0].message.content.trim();
    res.json({ text });
  } catch (err) {
    console.error('AI generation failed', err);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

export default router;
