// Netlify Function - Secure AI Chat Endpoint
// This keeps your API key secret on the server side

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse request body
    const { prompt, targetLanguage, nativeLanguage, lessonContext } = JSON.parse(event.body);

    // Validate input
    if (!prompt || !targetLanguage || !nativeLanguage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Get API key from environment variable (SECURE!)
    const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
    
    if (!HF_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const HF_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

    // Call Hugging Face API
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('HF API Error:', errorData);
      
      if (response.status === 503) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({ 
            error: 'Model is loading. Please wait 20 seconds and try again.',
            loading: true 
          })
        };
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'AI API request failed' })
      };
    }

    const data = await response.json();
    
    // Extract AI response
    let aiMessage = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiMessage = data[0].generated_text.trim();
    } else if (data.generated_text) {
      aiMessage = data.generated_text.trim();
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Unexpected response format' })
      };
    }

    // Return successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: aiMessage,
        success: true 
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
