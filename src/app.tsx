import { useState, useMemo, useRef, useEffect } from 'react'
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
/** Firebase! Let's go: */
import { realtimedb } from './firebase';
/** Simplebar :) let's go! */
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css'; // REQUIRED CSS
import './app.css';
import { ref, onValue, get } from 'firebase/database';



/** Try video player - 2.16 */

const VideoPlayer = ({ url }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="animate-spin" size={24} />
        </div>
      )}
      <video 
        className="max-w-full max-h-full rounded-xl"
        controls 
        autoPlay
        playsInline
        preload="metadata"
        src={url}
        onLoadedData={() => setIsLoading(false)}
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
      </video>
    </div>
  );
};
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

const ScrollingSubjects = () => {
  // This uses your existing subjects object from above
  const allSubjects = [
    ...Object.entries(subjects),
    ['anything', { icon: Binary, color: 'text-gray-500' }],
    ...Object.entries(subjects),
    ['anything', { icon: Binary, color: 'text-gray-500' }]
  ];

  return (
    <div className="w-[800px] mx-auto overflow-hidden">
      <div className="animate-scroll flex gap-14 py-4">
        {allSubjects.map(([key, subject], index) => (
          <div key={`${key}-${index}`} className="flex items-center gap-2 shrink-0">
            <subject.icon size={20} className={subject.color} />
            <span className="font-light capitalize whitespace-nowrap">
              {key === 'anything' ? 'Anything!' : key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};



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

  // Global Rendering stuff:
  const [renderingGlobal, setRenderingGlobal] = useState('FREE');
  const [lastVideo, setLastVideo] = useState('NONE'); // None, Completed, In-Progress, or Error

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentVideo, setCurrentVideo] = useState('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4')
  /** Current job: */
  const [currentJobId, setCurrentJobId] = useState(null); // Current Job

  /** Job States */
  const [videoStatus, setVideoStatus] = useState('NONE');

  useEffect(() => {
    if (!currentJobId) return;
    
    console.log('Setting up Firebase listener for job:', currentJobId);
    
    const currentJobStatusRef = ref(realtimedb, `jobs/${currentJobId}/status`);
    const statusUnsubscribe = onValue(currentJobStatusRef, (snapshot) => {
      const status = snapshot.val() as string;
      console.log('Job status update:', status);

      if (status === 'complete') {
        // Status is complete, now fetch the video URL
        const videoUrlRef = ref(realtimedb, `jobs/${currentJobId}/videoUrl`);
        get(videoUrlRef).then((snapshot) => {
          const videoUrl = snapshot.val();
          console.log('Job complete! Video URL:', videoUrl);
          setCurrentVideo(videoUrl);
          setRenderingGlobal('FREE');
          setLastVideo('COMPLETED');
          setCurrentJobId(null);
        });
      } else if (status === 'error') {
        // Status is error, fetch the error message
        const errorRef = ref(realtimedb, `jobs/${currentJobId}/error`);
        get(errorRef).then((snapshot) => {
          const errorMsg = snapshot.val();
          console.error('Job error:', errorMsg);
          setRenderingGlobal('FREE');
          setLastVideo('ERROR');
          setCurrentJobId(null);
        });
      }
      // Other statuses keep us in INPROGRESS state
    });
    
    // Clean up listener when component unmounts or job ID changes
    return () => statusUnsubscribe();
  }, [currentJobId]);
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
      
      const AIvideostatus = lastVideo;
      // 1. Send message to Claude
      const response = await fetch('https://au8y9d35aj.execute-api.us-east-1.amazonaws.com/fastClaude', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          lastVideoStatus: AIvideostatus,
        })
      })
      
      console.log('passed the first const response!!! converting it to JSON');
      const data = await response.json()
      const parsedMessage = JSON.parse(data.message);

      console.log('Full response data:', data);

      // 2. Add message to chat immediately
      setMessages(prev => [...prev,
        { role: 'user', content },
        { role: 'assistant', content: data.Chat || data.message || "Error in AI response" }
      ])
      
      // 3. Check for Scene Visualization!
      if (parsedMessage.VisualizationPlan) { /** Note: make sure to change RENDERING GLOBAL on s3 completion, potential breaking point */
        console.log('FOUND A VISUALIZATION PLAN!');
        setRenderingGlobal('RENDERING');
        setLastVideo('INPROGRESS');
  
        /** Add lambda and ec2 calls here in a second */
  
        /** Call Lambda 2! */
        try {
          console.log('Calling lambda two!');
          const manimcodeResponse = await fetch('https://au8y9d35aj.execute-api.us-east-1.amazonaws.com/manimcode', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              stderrs: '',
              scenePlan: parsedMessage.VisualizationPlan,
              noteFromAI: parsedMessage.NoteToAI || '',
              time: parsedMessage.Time || 20
            })
          });
  
          const manimCodeData = await manimcodeResponse.json();
          console.log('Received Code :) : ', JSON.stringify(manimCodeData));
          console.log(manimCodeData.message); 
            // Parse the inner JSON if it's in a message property
          let trueManimCode = '';
          try {
            const parsedMsg = JSON.parse(manimCodeData.message);
            trueManimCode = parsedMsg.code.replace(/^"""|"""$/g, '').trim();
            console.log('Extracted Manim Code:', trueManimCode);
        } catch (parseError) {
            console.error('Error parsing code:', parseError);
            console.error('Original message:', manimCodeData.message);
        }

          

          /** Now try EC2 :) */
            // Now send to EC2
          try {
            console.log('Sending to EC2...');
            const renderResponse = await fetch('http://3.87.242.180:5000/render', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'aPE2GYgMKX233232323233232MVR'
              },
              body: JSON.stringify({ code: trueManimCode })  // Send as JSON
            });
            
            const renderData = await renderResponse.json();
            console.log('Render response:', renderData);
            
            // Store job ID
            setCurrentJobId(renderData.jobId);
            
            // Set up Firebase listener for this job ID
            // (to-do: add this in a useEffect)
            
          } catch (renderError) {
            console.error('Error calling EC2 render service:', renderError);
            setRenderingGlobal('FREE');
            setLastVideo('ERROR');
          }

  
        } catch(error) {
          /** Catch block for manim code response: */
          console.error('Error in the Try block for Lambda 2! In the second API Gateway');
          setRenderingGlobal('FREE');
          setLastVideo('ERROR');
        }
      }
      
    } catch (error) {
      console.error('Error:', error)
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

            {/* Subjects with icons 
              * Replacing with scrolling component - 2.16
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
            </div>*/}

            <ScrollingSubjects />


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
    <div className="min-h-screen bg-white">
  <div className="max-w-7xl mx-auto px-4">
    <div className={`flex transition-all duration-300 ease-in-out ${currentVideo ? 'space-x-6' : ''}`}>
      {/* Chat section */}
      <div className={`flex-1 transition-all duration-300 ${currentVideo ? 'w-1/2' : 'w-full'} relative z-10`}>
        <div className="flex flex-col h-screen">
          {/* Messages */}
          {/* <div className="flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <Message key={index} {...message} />
            ))}
          </div> */}
          <SimpleBar 
            className="flex-1" 
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            scrollableNodeProps={{
              className: 'overflow-y-auto' // Keep your existing overflow class
            }}
          >
            {messages.map((message, index) => (
              <div key={index} id={`message-${index}`}>
                <Message {...message} />
              </div>
            ))}
          </SimpleBar>

          {/* Input Form */}
          <div className="border-t">
            <div className="max-w-3xl mx-auto p-4">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Wait, so how does this work?"
                  className="flex-1 p-6 text-xl font-light rounded-lg border border-gray-200
                           tracking-wide placeholder:text-gray-400
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                           focus:outline-none transition-all duration-200
                           resize-none items-center"
                  rows={2}
                />
                
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-8 bg-blue-500 text-white rounded-lg
                           hover:bg-blue-600 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-colors duration-200
                           flex items-center justify-center gap-3 min-w-[100px]"
                >
                  {isLoading ? (
                    <Loader className="animate-spin" size={24} />
                  ) : (
                    <>
                      <IconComponent size={24} className={iconColor} />
                      <span className="text-lg">Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Video section */}
      {currentVideo && (
        <div className="w-5/12 h-screen p-4 sticky top-0 transition-opacity duration-300 shadow-lg z-0">
          <div className="h-full">
            <VideoPlayer url={currentVideo} />
          </div>
        </div>
      )}
    </div>
  </div>
</div>

  );
}