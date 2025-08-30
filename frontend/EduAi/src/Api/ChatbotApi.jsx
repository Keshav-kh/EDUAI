import { useState, useEffect, useRef } from "react";
import { Input, Spin, notification, Button, Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import manthinkingvatar from "/manthinkingvatar.svg";
import { 
  LoadingOutlined, 
  SendOutlined, 
  CloseCircleOutlined, 
  DeleteOutlined,
  ClearOutlined
} from "@ant-design/icons";
import Topleftcard from "../components/Layout/Cards/leftcards/Topleftcard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios from "axios";

// Predefined message examples for demonstration
const EXAMPLE_MESSAGES = [
  "How long will my CMPSC 132 Recitation #10 take?",
  "Show me my weekly schedule",
  "What are my highest priorities right now?",
  "Find study peers for MATH 230",
  "Track my progress this semester"
];

// Command patterns that will trigger component visibility
const COMMAND_PATTERNS = {
  "estimate": ["how long", "estimate", "time needed", "take me", "duration"],
  "schedule": ["schedule", "plan", "weekly", "timetable", "show me my week"],
  "priorities": ["priority", "priorities", "important", "urgent", "critical", "what should i do first"],
  "peers": ["peer", "study group", "classmate", "friend", "study with", "study partner", "connect"],
  "progress": ["progress", "track", "completed", "done", "finished", "how am i doing"],
  "deadlines": ["deadline", "due", "upcoming", "assignment", "when is", "overdue"],
  "calendar": ["calendar", "monthly view", "full calendar"]
  // "goals" pattern removed to prevent accidental triggering
};

// Custom Markdown components for styling
const MarkdownComponents = {
  // Style code blocks with syntax highlighting
  code(props) {
    const { children, className, node, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        {...rest}
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code {...rest} className="bg-[#2a2a3a] px-1 py-0.5 rounded font-mono text-sm">
        {children}
      </code>
    );
  },
  // Style headings
  h1: (props) => <h1 className="text-2xl font-bold mb-4 text-[#9981FF]" {...props} />,
  h2: (props) => <h2 className="text-xl font-bold mb-3 text-[#9981FF]" {...props} />,
  h3: (props) => <h3 className="text-lg font-bold mb-2 text-[#9981FF]" {...props} />,
  h4: (props) => <h4 className="text-base font-bold mb-2 text-[#9981FF]" {...props} />,
  // Style paragraphs
  p: (props) => <p className="mb-4 text-white" {...props} />,
  // Style lists
  ul: (props) => <ul className="list-disc pl-5 mb-4 text-white" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 mb-4 text-white" {...props} />,
  li: (props) => <li className="mb-1" {...props} />,
  // Style emphasis
  em: (props) => <em className="italic" {...props} />,
  // Style strong emphasis
  strong: (props) => <strong className="font-bold text-[#C09BFF]" {...props} />,
  // Style blockquotes
  blockquote: (props) => (
    <blockquote 
      className="border-l-4 border-[#9981FF] pl-4 italic my-4 text-gray-300" 
      {...props} 
    />
  ),
  // Style links
  a: (props) => (
    <a 
      className="text-[#9981FF] hover:text-[#C09BFF] underline" 
      target="_blank" 
      rel="noopener noreferrer" 
      {...props}
    />
  ),
  // Style tables
  table: (props) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border-collapse border border-gray-700" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-[#2a2a3a]" {...props} />,
  th: (props) => <th className="border border-gray-700 px-4 py-2 text-left" {...props} />,
  td: (props) => <td className="border border-gray-700 px-4 py-2" {...props} />,
  // Style horizontal rule
  hr: () => <hr className="border-gray-700 my-4" />
};

const Chatbot = ({
  tasks,
  setTasks,
  selectedTask,
  setSelectedTask,
  schedule,
  setSchedule,
  peers,
  setPeers,
  // Modal control props
  onOpenEstimator,
  onOpenSchedule,
  onOpenPriorities,
  onOpenPeers,
  onOpenProgress,
  onOpenCalendar,
  onOpenDeadlines,
  onOpenGoals,
  // NEW: Add callback for tracking conversation state
  onConversationChange
}) => {
  // State variables
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [specialAnimation, setSpecialAnimation] = useState(false);
  const [exampleMessage, setExampleMessage] = useState(EXAMPLE_MESSAGES[0]);
  const [sessionId, setSessionId] = useState("default-session");
  const [conversation, setConversation] = useState([]);
  const [chatExpanded, setChatExpanded] = useState(true);
  
  // References
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const exampleInterval = useRef(null);
  
  // Initialize session ID and setup example message rotation
  useEffect(() => {
    // Generate a unique session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    
    // Setup rotation of example messages
    let index = 0;
    exampleInterval.current = setInterval(() => {
      index = (index + 1) % EXAMPLE_MESSAGES.length;
      setExampleMessage(EXAMPLE_MESSAGES[index]);
    }, 5000);
    
    return () => {
      if (exampleInterval.current) {
        clearInterval(exampleInterval.current);
      }
    };
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    
    // NEW: Notify parent component about conversation state
    if (onConversationChange) {
      onConversationChange(conversation.length > 0);
    }
  }, [conversation, onConversationChange]);

  // Check if a message matches any command pattern
  const matchesCommandPattern = (msg) => {
    if (!msg) return null;
    
    const lowercaseMsg = msg.toLowerCase();
    for (const [command, patterns] of Object.entries(COMMAND_PATTERNS)) {
      if (patterns.some(pattern => lowercaseMsg.includes(pattern))) {
        return command;
      }
    }
    return null;
  };

  // Open the relevant modal based on command type
  const openModalForCommandType = (commandType, userMessage) => {
    if (!commandType) return;
    
    // Find a relevant task if possible for estimation
    if (commandType === "estimate") {
      const relevantTask = findRelevantTask(userMessage);
      if (relevantTask && setSelectedTask) {
        setSelectedTask(relevantTask);
      }
    }
    
    // Open the appropriate modal based on the command type
    switch(commandType) {
      case "estimate":
        if (onOpenEstimator) onOpenEstimator();
        break;
      case "schedule":
        if (onOpenSchedule) onOpenSchedule();
        break;
      case "priorities":
        if (onOpenPriorities) onOpenPriorities();
        break;
      case "peers":
        if (onOpenPeers) onOpenPeers();
        break;
      case "progress":
        if (onOpenProgress) onOpenProgress();
        break;
      case "calendar":
        if (onOpenCalendar) onOpenCalendar();
        break;
      case "deadlines":
        if (onOpenDeadlines) onOpenDeadlines();
        break;
      // "goals" case removed to prevent accidental triggering
      default:
        break;
    }
    
    // Show notification about what's happening
    notification.info({
      message: `${commandType.charAt(0).toUpperCase() + commandType.slice(1)} View`,
      description: `Opening the ${commandType} component based on your request.`,
      placement: 'bottomRight',
    });
  };
  
  // Find a relevant task mentioned in the message
  const findRelevantTask = (message) => {
    if (!tasks || tasks.length === 0 || !message) return null;
    
    const lowercaseMsg = message.toLowerCase();
    return tasks.find(task => 
      lowercaseMsg.includes(task.name.toLowerCase()) || 
      lowercaseMsg.includes(task.name.split(' - ')[0].toLowerCase())
    );
  };

  const handleSendMessage = async () => {
    // Use example message if input is empty
    const messageToSend = message.trim() || exampleMessage;
    
    if (!messageToSend) return;

    // Add user message to conversation
    setConversation(prev => [...prev, { 
      type: 'user', 
      content: messageToSend,
      id: Date.now()
    }]);
    
    setLoading(true);
    setMessage(""); // Clear input immediately for better UX

    try {
      // Check if this is a direct component command
      const commandType = matchesCommandPattern(messageToSend);
      
      if (commandType) {
        // Handle direct component commands
        // Add bot response to conversation
        const localResponse = generateLocalResponse(messageToSend, commandType);
        
        setConversation(prev => [...prev, { 
          type: 'bot', 
          content: localResponse,
          responseType: commandType,
          id: Date.now() + 1
        }]);
        
        // Open the appropriate modal (only for direct commands, not for any message)
        openModalForCommandType(commandType, messageToSend);
      } else {
        // Send to backend API for processing
        try {
          const backendResponse = await sendToBackend(messageToSend);
          
          // Add bot response to conversation
          setConversation(prev => [...prev, { 
            type: 'bot', 
            content: backendResponse.response,
            responseType: backendResponse.response_type || 'default',
            id: Date.now() + 1
          }]);
          
          // Handle special response types
          const responseType = backendResponse.response_type || "default";
          
          // Make sure goals responses don't trigger any modals
          if (responseType !== "default" && responseType !== "error" && responseType !== "goals") {
            // Open the appropriate modal (only for response types from backend)
            openModalForCommandType(responseType, messageToSend);
          }
          
        } catch (error) {
          console.error("Error with backend request:", error);
          const errorResponse = "I encountered an issue processing your request. Let me provide a simpler answer while our backend catches up.";
          
          // Add error response to conversation
          setConversation(prev => [...prev, { 
            type: 'bot', 
            content: errorResponse,
            responseType: 'error',
            id: Date.now() + 1
          }]);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorResponse = "I'm sorry, I encountered an error. Please try asking in a different way.";
      
      // Add error response to conversation
      setConversation(prev => [...prev, { 
        type: 'bot', 
        content: errorResponse,
        responseType: 'error',
        id: Date.now() + 1
      }]);
    } finally {
      setLoading(false);
      
      // Refocus the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Generate a local response for direct commands
  const generateLocalResponse = (message, commandType) => {
    switch(commandType) {
      case "estimate":
        return "Let me help you estimate how long your task will take. Opening the time estimator...\n\n**Based on my analysis:**\n\n- Task difficulty is a key factor\n- Your focus level impacts completion time\n- I've considered your past performance with similar assignments\n\nThe time estimator will help you plan more effectively.";
      
      case "schedule":
        return "# Your Weekly Schedule\n\nHere's your weekly plan. I've organized your tasks based on:\n\n- **Priority** - High priority tasks are scheduled first\n- **Due dates** - Tasks due sooner are given precedence\n- **Estimated time** - Each task has its allocated study time\n\nYou can **drag and drop** tasks to different days if your availability changes. The system will automatically adjust your weekly plan.";
      
      case "priorities":
        return "# Task Priorities\n\nI've analyzed your upcoming deadlines and identified your top priorities based on:\n\n1. **Deadline proximity** - How soon the assignment is due\n2. **Task difficulty** - How challenging the work will be\n3. **Grade impact** - How important the assignment is for your final grade\n\n## Top 3 Priorities:\n\n| Task | Due Date | Priority Score |\n| ---- | -------- | -------------- |\n| CMPSC 132 - Recitation #10 | April 12 | 91% |\n| MATH 230 - 16.1 Homework | April 9 | 78% |\n| CMPSC 221 - Programming Assignment 5 | April 21 | 72% |";
      
      case "peers":
        return "# Study Peers Matching\n\nI've found several students currently working on similar subjects:\n\n## Top Matches\n\n1. **Alex Chen** (91% match)\n   - Studying: CMPSC 132\n   - Topics: Binary Trees, Algorithms\n   - Available: Evenings, Weekends\n\n2. **Maya Johnson** (85% match)\n   - Studying: MATH 230\n   - Topics: Triple Integrals, Vector Fields\n   - Available: Afternoons, Evenings\n\n3. **Raj Patel** (78% match)\n   - Studying: CMPSC 360\n   - Topics: Discrete Math, Proofs\n   - Available: Mornings, Evenings\n\n## Active Study Groups\n\nThere's also an active **CMPSC 132 Study Group** with a session today at 7:00 PM.";
      
      case "progress":
        return "# Progress Report\n\n## Overall Progress\n- **Tasks completed:** 40% (2 of 5 tasks)\n- **Study streak:** 5 days 🔥\n- **Weekly target:** 15.5 hours (8.5 hours completed)\n\n## Course Progress\n- CMPSC 221: 50% complete (B+)\n- CMPSC 360: 50% complete (A)\n- MATH 141: 45% complete (B)\n- PHYS 212: 40% complete (C+)\n\n> You're making steady progress and maintaining a great study streak. Keep focusing on your high-priority tasks to stay on track!";
      
      case "deadlines":
        return "# Upcoming Deadlines\n\nHere are your upcoming deadlines:\n\n1. **CMPSC 132 - Recitation #10** (Due: Apr 12)\n   • Priority: High\n   • Days remaining: 4 days\n\n2. **MATH 230 - 16.1 Homework** (Due: Apr 9)\n   • Priority: Medium\n   • Days remaining: 1 day\n\n3. **CMPSC 360 - HW8** (Due: Apr 25)\n   • Priority: Medium\n   • Days remaining: 17 days\n\nWould you like to see all deadlines or mark any as completed?";
      
      case "calendar":
        return "# Monthly Calendar View\n\nI'm opening the full calendar view where you can see all your scheduled tasks, deadlines, and events for the month. This helps you get a broader perspective of your academic schedule.\n\nYou can:\n- Navigate between months\n- See all scheduled tasks in one view\n- Identify busy periods and available time slots\n- Click on any day to see detailed information";
      
      default:
        return "I'll help you with that right away.";
    }
  };

  // Send message to backend
  const sendToBackend = async (userMessage) => {
    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: userMessage,
        session_id: sessionId
      }, {
        timeout: 10000 // 10 second timeout
      });

      // Make sure goals responses are turned into default responses
      if (response.data && response.data.response_type === "goals") {
        response.data.response_type = "default";
      }

      return response.data;
    } catch (error) {
      console.error("Backend error:", error);
      
      // Create a fallback response
      const commandType = matchesCommandPattern(userMessage);
      const fallbackResponse = {
        response: generateLocalResponse(userMessage, commandType || "default"),
        response_type: commandType || "default"
      };
      
      return fallbackResponse;
    }
  };

  // Remove a single message
  const handleRemoveMessage = (messageId) => {
    setConversation(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Clear all messages
  const handleClearAll = () => {
    setConversation([]);
  };

  // Toggle chat window visibility
  const toggleChatExpanded = () => {
    setChatExpanded(!chatExpanded);
  };

  return (
    <div className="chatbot-container flex flex-col" style={{ marginTop: "20px" }}>
      {/* Chat Header with Controls */}
      {conversation.length > 0 && (
        <div className="chat-header flex justify-between items-center bg-[#232331] p-2 rounded-t-lg mb-0">
          <div className="flex items-center">
            <span className="text-white font-medium ml-2">EDUAI Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip title="Clear all messages">
              <Button 
                type="text" 
                icon={<ClearOutlined />} 
                onClick={handleClearAll}
                className="text-gray-400 hover:text-white"
                size="small"
              />
            </Tooltip>
            <Tooltip title={chatExpanded ? "Minimize chat" : "Expand chat"}>
              <Button 
                type="text" 
                icon={chatExpanded ? <CloseCircleOutlined /> : <SendOutlined />} 
                onClick={toggleChatExpanded}
                className="text-gray-400 hover:text-white"
                size="small"
              />
            </Tooltip>
          </div>
        </div>
      )}
      
      {/* Chat Messages Area */}
      {chatExpanded && conversation.length > 0 && (
        <div 
          ref={chatContainerRef}
          className="chat-messages bg-[#1F1F2C] rounded-lg p-4 mb-4 overflow-y-auto shadow-inner"
          style={{ 
            height: "60vh",
            marginBottom: "10px",
            borderTopLeftRadius: conversation.length > 0 ? "0" : "lg"
          }}
        >
          <AnimatePresence>
            {conversation.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`message mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
              >
                {msg.type === 'user' ? (
                  <div className="flex justify-end items-start group">
                    <div className="bg-[#9981FF] text-white px-4 py-2 rounded-lg max-w-[70%] relative">
                      {msg.content}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          type="text" 
                          icon={<CloseCircleOutlined />} 
                          size="small"
                          className="text-white opacity-50 hover:opacity-100"
                          onClick={() => handleRemoveMessage(msg.id)}
                        />
                      </div>
                    </div>
                    <img src={manthinkingvatar} alt="User" className="w-8 h-8 ml-2 mt-1 rounded-full" />
                  </div>
                ) : (
                  <div className="flex justify-start items-start group">
                    <div className="bg-[#26262F] p-4 rounded-lg max-w-[90%] markdown-content relative">
                      {loading && msg.id === conversation[conversation.length - 1].id ? (
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                      ) : (
                        <>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              type="text" 
                              icon={<CloseCircleOutlined />}
                              size="small" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => handleRemoveMessage(msg.id)}
                            />
                          </div>
                          <ReactMarkdown
                            components={MarkdownComponents}
                            remarkPlugins={[remarkGfm]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Input Field */}
      <div className="chat-input relative">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Try asking: "${exampleMessage}"`}
          onPressEnter={handleSendMessage}
          style={{
            width: "100%",
            height: "50px",
            backgroundColor: "#1a1a1a",
            color: "white",
            border: "1px solid #9e9e9e52",
            borderRadius: chatExpanded && conversation.length > 0 ? "0 0 50px 50px" : "50px",
          }}
          disabled={loading}
          suffix={
            <div 
              className={`cursor-pointer ${loading ? 'text-gray-500' : 'text-[#9981FF] hover:text-purple-400'} flex items-center`}
              onClick={!loading ? handleSendMessage : undefined}
            >
              {loading ? (
                <LoadingOutlined className="mr-1" />
              ) : (
                <SendOutlined className="mr-1" />
              )}
              Ask
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Chatbot; 