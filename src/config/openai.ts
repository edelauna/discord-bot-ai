import { OpenAIApi, Configuration } from 'openai';
import { openaiApiKey } from '../config/app';

const configuration = new Configuration({
    apiKey: openaiApiKey,
});
const openai = new OpenAIApi(configuration);

export { openai };
