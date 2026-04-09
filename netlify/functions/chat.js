exports.handler = async (event, context) => {
  console.log('Function called with method:', event.httpMethod);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse body
    const body = JSON.parse(event.body || '{}');
    console.log('Request body:', body);

    const { prompt, targetLanguage, nativeLanguage } = body;

    // Validate
    if (!prompt || !targetLanguage || !nativeLanguage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get API key
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    console.log('API key available:', !!apiKey);
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Call Hugging Face - using a simpler model that's always available
    console.log('Calling Hugging Face API...');
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    console.log('HF API status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF API error:', errorText);
      
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
        body: JSON.stringify({ error: 'AI API request failed', details: errorText })
      };
    }

    const data = await response.json();
    console.log('HF API response:', data);
    
    // Extract message
    let aiMessage = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiMessage = data[0].generated_text.trim();
    } else if (data.generated_text) {
      aiMessage = data.generated_text.trim();
    } else {
      console.error('Unexpected response format:', data);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Unexpected response format' })
      };
    }

    console.log('Success! Returning message');
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
        details: error.m
