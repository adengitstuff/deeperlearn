import { useState, useMemo, useEffect } from 'react'
import { 
  Pi, 
  Atom, 
  Binary, 
  Brain,
  Code,
  Dna,
  TestTubes,
  SendHorizontal,
  Loader
} from 'lucide-react'

// Define our subject types and their associated keywords and icons
const subjects = {
  math: {
    keywords: ['equation', 'math', 'calculus', 'algebra', 'geometry', 'theorem', 'proof', 'number'],
    icon: Pi,
    color: 'text-blue-500'
  },
  physics: {
    keywords: ['force', 'energy', 'motion', 'quantum', 'gravity', 'momentum', 'physics'],
    icon: Atom,
    color: 'text-orange-500'
  },
  chemistry: {
    keywords: ['molecule', 'reaction', 'compound', 'chemistry', 'acid', 'base', 'element'],
    icon: TestTubes,
    color: 'text-blue-500'
  },
  biology: {
    keywords: ['cell', 'gene', 'protein', 'biology', 'organism', 'evolution', 'dna'],
    icon: Dna,
    color: 'text-green-500'
  }
}

const Message = ({ role, content }) => (
  <div className={`p-4 ${role === 'assistant' ? 'bg-gray-50' : 'bg-white'}`}>
    <div className="max-w-3xl mx-auto">
      <div className="font-medium text-sm text-gray-500 mb-2">
        {role === 'assistant' ? 'Claude' : 'You'}
      </div>
      <div className="text-gray-800 whitespace-pre-wrap">{content}</div>
    </div>
  </div>
)

export default function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  // Determine which subject icon to show based on input text
  const activeSubject = useMemo(() => {
    const lowercaseInput = input.toLowerCase()
    
    const matchedSubject = Object.entries(subjects).find(([_, subject]) => 
      subject.keywords.some(keyword => lowercaseInput.includes(keyword))
    )
    
    return matchedSubject ? matchedSubject[1] : null
  }, [input])

  const sendMessage = async (content) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }]
        })
      })
      
      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      setMessages(prev => [...prev, 
        { role: 'user', content },
        { role: 'assistant', content: data.message }
      ])
      
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const message = input
    setInput('')
    setHasStarted(true)
    await sendMessage(message)
  }

  // Dynamically render the appropriate icon
  const IconComponent = activeSubject?.icon || SendHorizontal
  const iconColor = activeSubject?.color || 'text-white'

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center -mt-24">
        <div className="max-w-5xl w-full px-8">
          <div className="space-y-12">
            {/* Hero Text */}
            <h1 className="text-7xl xl:text-9xl font-light tracking-tighter text-center text-gray-800">
              What do you want to learn?
            </h1>

            {/* Subjects with icons */}
            <div className="flex justify-center gap-8 text-gray-600">
              {Object.entries(subjects).map(([key, subject]) => (
                <div key={key} className="flex items-center gap-2">
                  <subject.icon size={20} className={subject.color} />
                  <span className="font-light capitalize">{key}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Binary size={20} className="text-gray-500" />
                <span className="font-light">Anything!</span>
              </div>
            </div>

            <p className="text-center text-2xl mx-auto max-w-xl font-light">
              Learn 10,000x faster than college textbooks, Professors, & classes!
            </p>

            {/* Chat Form */}
            <form onSubmit={handleSubmit} className="flex gap-4">
            <textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Ask me anything. Learn conversationally & really fast"
  className="basis-4/5 p-6 text-2xl font-light rounded-lg border border-gray-200
           tracking-wide placeholder:text-gray-400
           focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
           focus:outline-none transition-all duration-200
           resize-none"
  rows={1}
/>

              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="basis-1/5 p-6 bg-blue-500 text-white rounded-lg
                         hover:bg-blue-600 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-colors duration-200
                         flex items-center justify-center gap-3 text-2xl font-light"
              >
                {isLoading ? (
                  <Loader className="animate-spin" size={24} />
                ) : (
                  <IconComponent size={24} className={iconColor}/>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>

      {/* Input Form */}
      <div className="border-t">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
          <textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Wait, so how does this work?"
  className="basis-4/5 p-6 text-2xl font-light rounded-lg border border-gray-200
           tracking-wide placeholder:text-gray-400
           focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
           focus:outline-none transition-all duration-200
           resize-none"
  rows={1}
/>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 bg-blue-500 text-white rounded-lg
                       hover:bg-blue-600 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors duration-200
                       flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <SendHorizontal size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}