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
    
    // Extract what the user actually said (it's in the prompt)
    const userInput = prompt.toLowerCase();
    
    // Smart conversational responses based on what user says
    const getSmartResponse = () => {
      // Check if user introduced themselves (said their name)
      if (userInput.includes('me llamo') || userInput.includes('my name is') || userInput.includes('ich heiße')) {
        if (nativeLanguage === 'English') {
          return "Excellent! You introduced yourself perfectly! Now try asking: '¿Cómo estás?' which means 'How are you?' in Spanish.";
        } else if (nativeLanguage === 'German') {
          return "Ausgezeichnet! Du hast dich perfekt vorgestellt! Versuche jetzt zu fragen: '¿Cómo estás?' bedeutet 'Wie geht es dir?' auf Spanisch.";
        } else if (nativeLanguage === 'Spanish') {
          return "¡Excelente! Te presentaste perfectamente! Ahora intenta preguntar: 'How are you?' que significa '¿Cómo estás?' en inglés.";
        }
      }
      
      // Check if user said hello/hola
      if (userInput.includes('hola') || userInput.includes('hello') || userInput.includes('hallo')) {
        if (nativeLanguage === 'English') {
          return "Perfect! You said hello! Now try introducing yourself: 'Me llamo [your name]' which means 'My name is [your name]' in Spanish.";
        } else if (nativeLanguage === 'German') {
          return "Perfekt! Du hast Hallo gesagt! Versuche jetzt dich vorzustellen: 'Me llamo [dein Name]' bedeutet 'Ich heiße [dein Name]' auf Spanisch.";
        } else if (nativeLanguage === 'Spanish') {
          return "¡Perfecto! Dijiste hola! Ahora intenta presentarte: 'My name is [tu nombre]' que significa 'Me llamo [tu nombre]' en inglés.";
        }
      }
      
      // Check if user said yes/si
      if (userInput.includes('si') || userInput.includes('yes') || userInput.includes('ja') || userInput.includes('oui')) {
        if (targetLanguage === 'Spanish' && nativeLanguage === 'English') {
          return "Great! '¡Sí!' means 'Yes!' in Spanish. Now try: '¡Hola! Me llamo...' (Hello! My name is...). What's your name in Spanish?";
        } else if (targetLanguage === 'Spanish' && nativeLanguage === 'German') {
          return "Sehr gut! '¡Sí!' bedeutet 'Ja!'. Versuche jetzt: '¡Hola! Me llamo...' (Hallo! Ich heiße...). Wie heißt du auf Spanisch?";
        } else if (targetLanguage === 'English' && nativeLanguage === 'Spanish') {
          return "¡Perfecto! 'Yes!' en inglés. Intenta: 'Hello, my name is...' (Hola, me llamo...). ¿Cuál es tu nombre en inglés?";
        }
      }
      
      // Check if user asked how are you
      if (userInput.includes('cómo estás') || userInput.includes('how are you') || userInput.includes('wie geht')) {
        if (nativeLanguage === 'English') {
          return "Great question! To answer in Spanish, say: 'Estoy bien, gracias' which means 'I'm fine, thank you'. Try it!";
        } else if (nativeLanguage === 'German') {
          return "Gute Frage! Um auf Spanisch zu antworten, sage: 'Estoy bien, gracias' bedeutet 'Mir geht es gut, danke'. Versuch es!";
        } else if (nativeLanguage === 'Spanish') {
          return "¡Buena pregunta! Para responder en inglés, di: 'I'm fine, thank you' que significa 'Estoy bien, gracias'. ¡Inténtalo!";
        }
      }
      
      // Check if user answered they're fine
      if (userInput.includes('bien') || userInput.includes('fine') || userInput.includes('gut')) {
        if (nativeLanguage === 'English') {
          return "Perfect! You answered correctly! In Spanish conversations, it's polite to ask back: '¿Y tú?' (And you?). Try saying that!";
        } else if (nativeLanguage === 'German') {
          return "Perfekt! Du hast richtig geantwortet! In spanischen Gesprächen ist es höflich zurückzufragen: '¿Y tú?' (Und du?). Versuch das zu sagen!";
        }
      }
      
      // Generic encouragement for any other input
      if (nativeLanguage === 'English') {
        return `Good attempt! You're practicing ${targetLanguage}. Keep going! Try greeting someone: say "Hola" (Hello) or introduce yourself: "Me llamo..." (My name is...).`;
      } else if (nativeLanguage === 'Spanish') {
        return `¡Buen intento! Estás practicando ${targetLanguage}. ¡Sigue así! Intenta saludar a alguien: di "Hello" o preséntate: "My name is..." (Me llamo...).`;
      } else if (nativeLanguage === 'German') {
        return `Guter Versuch! Du übst ${targetLanguage}. Mach weiter! Versuche jemanden zu grüßen: sage "Hola" (Hallo) oder stelle dich vor: "Me llamo..." (Ich heiße...).`;
      } else if (nativeLanguage === 'French') {
        return `Bonne tentative! Vous pratiquez ${targetLanguage}. Continuez! Essayez de saluer quelqu'un: dites "Hola" (Bonjour) ou présentez-vous: "Me llamo..." (Je m'appelle...).`;
      } else if (nativeLanguage === 'Portuguese') {
        return `Boa tentativa! Você está praticando ${targetLanguage}. Continue! Tente cumprimentar alguém: diga "Hola" (Olá) ou se apresente: "Me llamo..." (Meu nome é...).`;
      }
      
      return "Great! Keep practicing!";
    };

    const aiMessage = getSmartResponse();

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
