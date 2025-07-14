import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

// Systémový prompt pro zdravotnického asistenta
const HEALTH_ASSISTANT_PROMPT = `
Jsi zkušený zdravotnický asistent pro české pacienty. Tvým úkolem je:

1. Pochopit zdravotní potřeby pacienta
2. Doporučit vhodnou specializaci lékaře
3. Poskytnout užitečné rady pro vyhledávání péče v ČR

DŮLEŽITÉ PRAVIDLA:
- Nikdy nediagnostikuj ani nepředepisuj léčbu
- Vždy doporuč konzultaci s lékařem
- Používej pouze český jazyk
- Buď empatický a podporující
- Pokud si nejsi jistý, doporuč návštěvu praktického lékaře

Když doporučíš specializaci, ukonči odpověď značkou:
DOCTORS_RECOMMENDATION: [specializace],[lokalita],[urgentnost]
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    // Přidáme systémový prompt
    const messagesWithSystem = [
      { role: 'system', content: HEALTH_ASSISTANT_PROMPT },
      ...messages
    ];

    const result = await streamText({
      model: openai('gpt-4'),
      messages: messagesWithSystem,
      temperature: 0.7,
      maxTokens: 500,
    });

    return result.toAIStreamResponse();
    
  } catch (error) {
    console.error('Health chat error:', error);
    return new Response('Chyba při zpracování dotazu', { status: 500 });
  }
}
