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
    
    // Smart conversational responses based on lesson and what user says
    const getSmartResponse = () => {
      
      // NUMBERS & COUNTING LESSON
      if (lessonContext === 'Numbers & Counting') {
        if (userInput.includes('si') || userInput.includes('yes')) {
          if (nativeLanguage === 'English') {
            return "Perfect! Let's learn numbers in Spanish. Try counting: 'uno' (1), 'dos' (2), 'tres' (3). Can you count to three in Spanish?";
          } else if (nativeLanguage === 'German') {
            return "Perfekt! Lass uns Zahlen auf Spanisch lernen. Versuche zu zählen: 'uno' (1), 'dos' (2), 'tres' (3). Kannst du bis drei auf Spanisch zählen?";
          } else if (nativeLanguage === 'Spanish') {
            return "¡Perfecto! Aprendamos números en inglés. Intenta contar: 'one' (1), 'two' (2), 'three' (3). ¿Puedes contar hasta tres en inglés?";
          }
        }
        if (userInput.includes('uno') || userInput.includes('dos') || userInput.includes('tres')) {
          if (nativeLanguage === 'English') {
            return "Excellent! You're counting in Spanish! Now try higher numbers: 'cuatro' (4), 'cinco' (5), 'seis' (6). Practice saying them!";
          } else if (nativeLanguage === 'German') {
            return "Ausgezeichnet! Du zählst auf Spanisch! Versuche jetzt höhere Zahlen: 'cuatro' (4), 'cinco' (5), 'seis' (6). Übe sie zu sagen!";
          }
        }
        if (userInput.includes('one') || userInput.includes('two') || userInput.includes('three')) {
          if (nativeLanguage === 'Spanish') {
            return "¡Excelente! Estás contando en inglés! Ahora intenta números más altos: 'four' (4), 'five' (5), 'six' (6). ¡Practícalos!";
          }
        }
        // Generic for numbers lesson
        if (nativeLanguage === 'English') {
          return "Good! In this numbers lesson, practice counting in Spanish: uno, dos, tres, cuatro, cinco. Try saying some numbers!";
        } else if (nativeLanguage === 'German') {
          return "Gut! In dieser Zahlenlektion, übe auf Spanisch zu zählen: uno, dos, tres, cuatro, cinco. Versuche einige Zahlen zu sagen!";
        }
      }
      
      // GREETINGS & INTRODUCTIONS LESSON
      if (lessonContext === 'Greetings & Introductions') {
        // Check if user introduced themselves
        if (userInput.includes('me llamo') || userInput.includes('my name is') || userInput.includes('ich heiße')) {
          if (nativeLanguage === 'English') {
            return "Excellent! You introduced yourself perfectly! Now try asking: '¿Cómo estás?' which means 'How are you?' in Spanish.";
          } else if (nativeLanguage === 'German') {
            return "Ausgezeichnet! Du hast dich perfekt vorgestellt! Versuche jetzt zu fragen: '¿Cómo estás?' bedeutet 'Wie geht es dir?' auf Spanisch.";
          } else if (nativeLanguage === 'Spanish') {
            return "¡Excelente! Te presentaste perfectamente! Ahora intenta preguntar: 'How are you?' que significa '¿Cómo estás?' en inglés.";
          }
        }
        
        // Check if user said hello
        if (userInput.includes('hola') || userInput.includes('hello') || userInput.includes('hallo')) {
          if (nativeLanguage === 'English') {
            return "Perfect! You said hello! Now try introducing yourself: 'Me llamo [your name]' which means 'My name is [your name]' in Spanish.";
          } else if (nativeLanguage === 'German') {
            return "Perfekt! Du hast Hallo gesagt! Versuche jetzt dich vorzustellen: 'Me llamo [dein Name]' bedeutet 'Ich heiße [dein Name]' auf Spanisch.";
          }
        }
        
        // Check if user said yes
        if (userInput.includes('si') || userInput.includes('yes') || userInput.includes('ja')) {
          if (targetLanguage === 'Spanish' && nativeLanguage === 'English') {
            return "Great! '¡Sí!' means 'Yes!' in Spanish. Now try: '¡Hola! Me llamo...' (Hello! My name is...). What's your name in Spanish?";
          } else if (targetLanguage === 'Spanish' && nativeLanguage === 'German') {
            return "Sehr gut! '¡Sí!' bedeutet 'Ja!'. Versuche jetzt: '¡Hola! Me llamo...' (Hallo! Ich heiße...). Wie heißt du auf Spanisch?";
          }
        }
        
        // Check if user asked how are you
        if (userInput.includes('cómo estás') || userInput.includes('how are you')) {
          if (nativeLanguage === 'English') {
            return "Great question! To answer in Spanish, say: 'Estoy bien, gracias' which means 'I'm fine, thank you'. Try it!";
          } else if (nativeLanguage === 'German') {
            return "Gute Frage! Um auf Spanisch zu antworten, sage: 'Estoy bien, gracias' bedeutet 'Mir geht es gut, danke'. Versuch es!";
          }
        }
      }
      
      // FAMILY & RELATIONSHIPS LESSON
      if (lessonContext === 'Family & Relationships') {
        if (userInput.includes('si') || userInput.includes('yes')) {
          if (nativeLanguage === 'English') {
            return "Great! Let's learn family words. In Spanish: 'madre' (mother), 'padre' (father), 'hermano' (brother), 'hermana' (sister). Try saying one!";
          } else if (nativeLanguage === 'German') {
            return "Gut! Lass uns Familienwörter lernen. Auf Spanisch: 'madre' (Mutter), 'padre' (Vater), 'hermano' (Bruder), 'hermana' (Schwester). Versuch eins zu sagen!";
          }
        }
      }
      
      // COLORS LESSON
      if (lessonContext === 'Colors') {
        if (userInput.includes('si') || userInput.includes('yes')) {
          if (nativeLanguage === 'English') {
            return "Awesome! Let's learn colors in Spanish: 'rojo' (red), 'azul' (blue), 'verde' (green), 'amarillo' (yellow). What's your favorite color?";
          } else if (nativeLanguage === 'German') {
            return "Super! Lass uns Farben auf Spanisch lernen: 'rojo' (rot), 'azul' (blau), 'verde' (grün), 'amarillo' (gelb). Was ist deine Lieblingsfarbe?";
          }
        }
      }
      
      // GENERIC FALLBACK for any lesson
      if (userInput.includes('si') || userInput.includes('yes') || userInput.includes('ja')) {
        if (nativeLanguage === 'English') {
          return `Perfect! You're ready to learn about "${lessonContext}" in ${targetLanguage}. Let's start with the basics. Try saying something related to this topic!`;
        } else if (nativeLanguage === 'German') {
          return `Perfekt! Du bist bereit über "${lessonContext}" auf ${targetLanguage} zu lernen. Lass uns mit den Grundlagen beginnen. Versuch etwas zu diesem Thema zu sagen!`;
        } else if (nativeLanguage === 'Spanish') {
          return `¡Perfecto! Estás listo para aprender sobre "${lessonContext}" en ${targetLanguage}. Empecemos con lo básico. ¡Intenta decir algo relacionado con este tema!`;
        }
      }
      
      // Generic encouragement for any input
      if (nativeLanguage === 'English') {
        return `Good attempt! In this "${lessonContext}" lesson, practice relevant vocabulary in ${targetLanguage}. Keep going!`;
      } else if (nativeLanguage === 'German') {
        return `Guter Versuch! In dieser "${lessonContext}"-Lektion, übe relevantes Vokabular auf ${targetLanguage}. Mach weiter!`;
      } else if (nativeLanguage === 'Spanish') {
        return `¡Buen intento! En esta lección de "${lessonContext}", practica vocabulario relevante en ${targetLanguage}. ¡Sigue así!`;
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
