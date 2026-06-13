import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const testAIConnection = async () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is currently empty in your backend/.env file.');
    console.log('Please add your API key like: GEMINI_API_KEY=sk-or-v1...');
    process.exit(1);
  }

  // Detect OpenRouter Key
  if (apiKey.startsWith('sk-or-')) {
    console.log('Checking OpenRouter API Connection with key:', apiKey.substring(0, 10) + '...');
    
    try {
      console.log('Sending test request to OpenRouter (model: google/gemini-2.5-flash)...');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 150,
          messages: [
            { role: 'user', content: 'You are a professional astrologer. Respond in one sentence confirming your connection.' }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API status code ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;

      console.log('\n✅ OpenRouter Connection Successful!');
      console.log('OpenRouter Response:', responseText.trim());
    } catch (error) {
      console.error('\n❌ OpenRouter Connection Failed!');
      console.error('Error details:', error.message);
    }
    return;
  }

  // Fallback to Google Gemini SDK Check
  console.log('Checking Google Gemini SDK Connection with key:', apiKey.substring(0, 8) + '...');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('Sending test request to Google Gemini...');
    const result = await model.generateContent('You are a professional astrologer. Respond in one sentence confirming your connection.');
    const responseText = result.response.text();
    
    console.log('\n✅ Google Gemini Connection Successful!');
    console.log('Gemini Response:', responseText.trim());
  } catch (error) {
    console.error('\n❌ Google Gemini Connection Failed!');
    console.error('Error details:', error.message);
  }
};

testAIConnection();
