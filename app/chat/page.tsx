import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Asistent - DoktorNaDohled',
  description: 'Konverzace s AI asistentem pro vyhledávání lékařů a zdravotnických služeb.',
}

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Asistent pro zdraví
          </h1>
          <p className="text-lg text-gray-600">
            Chat interface bude implementován v následujících krocích podle PRP.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold mb-2">Připravujeme AI asistenta</h2>
          <p className="text-gray-600 mb-6">
            Pracujeme na implementaci inteligentního chatbota pro české zdravotnictví.
          </p>
          <div className="text-sm text-gray-500">
            Status: Implementace pokračuje podle PRP...
          </div>
        </div>
      </div>
    </div>
  )
}