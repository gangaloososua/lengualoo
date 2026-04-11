exports.handler = async (event, context) => {
  console.log('Smart Language Tutor - Function called');
  
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

    console.log('Lesson:', lessonContext, '| Target:', targetLanguage, '| Native:', nativeLanguage);

    // Smart contextual responses
    const getLessonResponse = () => {
      const key = `${lessonContext}-${targetLanguage}-${nativeLanguage}`;
      
      // Greetings & Introductions responses
      if (lessonContext === 'Greetings & Introductions') {
        if (targetLanguage === 'Spanish' && nativeLanguage === 'English') {
          return "Great! '¡Sí!' means 'Yes!' in Spanish. Now try: '¡Hola! Me llamo...' (Hello! My name is...). What's your name in Spanish?";
        }
        if (targetLanguage === 'Spanish' && nativeLanguage === 'German') {
          return "Sehr gut! '¡Sí!' bedeutet 'Ja!'. Versuche jetzt: '¡Hola! Me llamo...' (Hallo! Ich heiße...). Wie heißt du auf Spanisch?";
        }
        if (targetLanguage === 'English' && nativeLanguage === 'Spanish') {
          return "¡Perfecto! 'Yes!' en inglés. Intenta: 'Hello, my name is...' (Hola, me llamo...). ¿Cuál es tu nombre en inglés?";
        }
        if (targetLanguage === 'English' && nativeLanguage === 'German') {
          return "Sehr gut! 'Yes!' auf Englisch. Versuche: 'Hello, my name is...' (Hallo, ich heiße...). Wie heißt du auf Englisch?";
        }
      }
      
      // Generic fallback
      const responses = {
        'English': `Great! You're learning ${targetLanguage}. In "${lessonContext}", practice basic phrases. Try introducing yourself or asking a simple question!`,
        'Spanish': `¡Muy bien! Estás aprendiendo ${targetLanguage}. En "${lessonContext}", practica frases básicas. ¡Intenta presentarte o hacer una pregunta simple!`,
        'German': `Sehr gut! Du lernst ${targetLanguage}. In "${lessonContext}", übe grundlegende Phrasen. Versuche dich vorzustellen oder eine einfache Frage zu stellen!`,
        'French': `Très bien! Vous apprenez ${targetLanguage}. Dans "${lessonContext}", pratiquez des phrases de base. Essayez de vous présenter ou de poser une question simple!`,
        'Portuguese': `Muito bem! Você está aprendendo ${targetLanguage}. Em "${lessonContext}", pratique frases básicas. Tente se apresentar ou fazer uma pergunta simples!`
      };
      
      return responses[nativeLanguage] || responses['English'];
    };

    const aiMessage = getLessonResponse();

    console.log('✅ Response generated successfully');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: aiMessage, 
        success: true
      })
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal error', details: error.message })
    };
  }
};
