import OpenAI from 'openai';
import { openaiApiKey } from '../config/app';

const openai = new OpenAI({
    apiKey: openaiApiKey,
});

export { openai };
