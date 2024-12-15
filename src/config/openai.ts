import OpenAI from 'openai';
import { openaiApiKey } from '../config/app';

const openai = new OpenAI({
    apiKey: openaiApiKey,
});


enum Models {
    OPEN_AI = 'openai',
    GROK = 'grok'
}

export { openai, Models };
