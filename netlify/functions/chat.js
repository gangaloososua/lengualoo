exports.handler = async (event, context) => {
  console.log('AI Tutor - Function called');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { prompt, targetLanguage, nativeLanguage, lessonContext } = JSON.parse(event.body || '{}');

    if (!prompt || !targetLanguage || !nativeLanguage) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    // Get API key from environment
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('GROQ_API_KEY not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured. Please set GROQ_API_KEY in Netlify environment variables.' })
      };
    }

    console.log('Calling Groq AI API...');

    // Call Groq AI - FREE and FAST!
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast, free model
        messages: [
          {
            role: 'system',
            content: `You are a friendly language tutor. The student speaks ${nativeLanguage} and is learning ${targetLanguage}. Respond in ${nativeLanguage} but teach ${targetLanguage}. Keep responses to 2-3 sentences. Include one phrase in ${targetLanguage} with translation.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    console.log('Groq API status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'AI request failed', details: errorText })
      };
    }

    const data = await response.json();
    console.log('Groq AI response received');
    
    const aiMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('✅ Success!');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: aiMessage.trim(), 
        success: true 
      })
    };

  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal error', details: error.message })
    };
  }
};
