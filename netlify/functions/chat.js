exports.handler = async (event, context) => {
  console.log('Function called');
  
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
    const { prompt, targetLanguage, nativeLanguage } = JSON.parse(event.body || '{}');

    if (!prompt || !targetLanguage || !nativeLanguage) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const apiKey = process.env.HUGGING_FACE_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    // Use a simple, free model that's guaranteed to work
    const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        },
        options: {
          wait_for_model: true
        }
      })
    });

    console.log('API status:', response.status);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'AI request failed', details: errorText })
      };
    }

    const data = await response.json();
    console.log('API response received');
    
    let aiMessage = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiMessage = data[0].generated_text.trim();
    } else if (data.generated_text) {
      aiMessage = data.generated_text.trim();
    } else {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Unexpected response' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: aiMessage, success: true })
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
