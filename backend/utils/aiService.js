import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Call AI Service (Supports both OpenRouter and Google Gemini API keys)
 */
const callAIService = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No API key configured');
  }

  // Detect OpenRouter Key
  if (apiKey.startsWith('sk-or-')) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Astrologer CRM'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Fallback to official Google Generative AI SDK
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Approximate Zodiac Sign based on Month and Day
 */
const getZodiacSign = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Aries';
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

/**
 * Generate Consultation Summary
 */
export const generateConsultationSummary = async (clientData, notes, predictions) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a professional astrologer's AI assistant. Summarize this astrological consultation for the client named ${clientData.name}.
      
      Consultation Notes: ${notes}
      Predictions Given: ${predictions}
      
      Provide a professional, clear, and encouraging summary of the consultation in 3-4 sentences. Format the response as plain text.`;
      
      const text = await callAIService(prompt);
      return text.trim();
    } catch (error) {
      console.warn('AI Service call failed, falling back to simulated summary. Error:', error.message);
    }
  }

  // Fallback Rule Engine
  const zodiac = getZodiacSign(clientData.dateOfBirth);
  return `Conducted a comprehensive astrological reading for ${clientData.name} (${zodiac}). The session focused on discussing current life transits, particularly in relation to their birth chart inputs (Born: ${clientData.placeOfBirth} at ${clientData.timeOfBirth}). Key topics explored included: ${notes.substring(0, 150)}... Detailed predictions were discussed regarding career paths, financial stability, and personal relationship transits in the coming quarters.`;
};

/**
 * Generate Follow-up Notes
 */
export const generateFollowUpNotes = async (clientData, remedies, followUpDate) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const dateStr = followUpDate ? new Date(followUpDate).toDateString() : 'the next session';
      const prompt = `You are a professional astrologer's AI assistant. Generate follow-up reminders and instructions for the client ${clientData.name}.
      
      Remedies Suggested: ${remedies}
      Planned Follow-up Date: ${dateStr}
      
      Create a warm, actionable bullet-point list of follow-up tasks and remedy practices the client should focus on before their next session. Format the response as a bulleted list.`;
      
      const text = await callAIService(prompt);
      return text.trim();
    } catch (error) {
      console.warn('AI Service call failed, falling back to simulated follow-up notes. Error:', error.message);
    }
  }

  // Fallback Rule Engine
  const targetDate = followUpDate ? new Date(followUpDate).toLocaleDateString() : 'our next scheduled session';
  return `• Continue performing the daily planetary chants and wearing recommended metal/gemstones as suggested.
• Keep a gratitude journal focusing on career aspects discussed during our reading.
• Practice mindfulness during the upcoming full moon transit to ground energetic alignments.
• Schedule a follow-up appointment around ${targetDate} to analyze the progress of the transit remedies.`;
};

/**
 * Generate Client Insights (Astrological Chart Analysis Simulation)
 */
export const generateClientInsights = async (clientData, consultationNotesList = []) => {
  const zodiac = getZodiacSign(clientData.dateOfBirth);
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const notesHistory = consultationNotesList.map(c => c.notes).join(' | ');
      const prompt = `You are an expert Vedic and Western Astrologer. Analyze the profile and session notes of this client to generate astrological insights.
      
      Client Profile:
      - Name: ${clientData.name}
      - DOB: ${new Date(clientData.dateOfBirth).toDateString()}
      - TOB: ${clientData.timeOfBirth}
      - POB: ${clientData.placeOfBirth}
      - Gender: ${clientData.gender}
      - Estimated Zodiac Sign: ${zodiac}
      
      Historical Consultation Themes: ${notesHistory || 'No previous readings'}
      
      Provide a highly detailed, professional analysis (2 paragraphs) covering:
      1. General personality tendencies, elemental balance, and behavioral traits associated with their birth details.
      2. Life areas currently under transit influence (e.g., career, relationships, spiritual growth) and tailored advice for the astrologer to note.
      Format the response as plain text.`;
      
      const text = await callAIService(prompt);
      return text.trim();
    } catch (error) {
      console.warn('AI Service call failed, falling back to simulated client insights. Error:', error.message);
    }
  }

  // Fallback Rule Engine
  const birthYear = new Date(clientData.dateOfBirth).getFullYear();
  const elements = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };
  const element = elements[zodiac] || 'Earth';

  return `Based on their birth parameters (${clientData.placeOfBirth}, born in ${birthYear}), ${clientData.name} exhibits a strong alignment with the ${element} element under the sign of ${zodiac}. This placement suggests a personality marked by ${
    element === 'Fire' ? 'passionate drive, leadership instincts, and a desire for rapid progress' :
    element === 'Earth' ? 'practicality, grounded resilience, attention to structural details, and reliability' :
    element === 'Air' ? 'intellectual curiosity, strong communication, adaptability, and social connection' :
    'deep emotional intelligence, intuitive wisdom, creativity, and highly empathetic boundaries'
  }. There is a notable planetary alignment highlighting their 10th House of career and 7th House of partnerships.

For the astrologer's attention: The client is currently undergoing a significant planetary transit that calls for patience in professional expansions. Advise focus on internal alignment and daily meditation. Monitor their Saturn/Jupiter transit positions as they approach the follow-up period to evaluate how these energies settle.`;
};
