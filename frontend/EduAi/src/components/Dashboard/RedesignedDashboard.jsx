// src/components/Dashboard/RedesignedDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Avatar, 
  Tag, 
  Progress, 
  List,
  Divider,
  notification,
  Tooltip
} from "antd";
import { 
  SendOutlined, 
  MessageOutlined, 
  CalendarOutlined, 
  FireOutlined,
  ClockCircleOutlined,
  TeamOutlined, 
  UserOutlined,
  BookOutlined,
  RocketOutlined,
  BarChartOutlined,
  FlagOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import Aurora from "../Animations/Aurora";
import NavbarDefault from "../Layout/Navbar/Navbar";
import Chatbot from "../../Api/ChatbotApi";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const RedesignedDashboard = (props) => {
  const {
    tasks = [],
    setTasks,
    selectedTask,
    setSelectedTask,
    schedule = {},
    setSchedule,
    peers = [],
    setPeers,
    studyGroups = [],
    setStudyGroups,
    onEstimate,
    onToggleComplete,
    onTaskMove,
    recentlyEstimated,
    recentlyMoved,
    onOpenEstimator,
    onOpenSchedule,
    onOpenPriorities,
    onOpenPeers,
    onOpenProgress,
    onOpenCalendar,
    onOpenDeadlines,
    onOpenGoals,
    onOpenProfile
  } = props;
  
  // Get today's date for calendar display
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Calculate user stats based on tasks
  const userData = {
    name: "Keshav", // This should come from real user data
    avatarUrl: "https://api.dicebear.com/7.x/miniavs/svg?seed=kk5431",
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 20,
    tasksCompleted: tasks.filter(t => t.completed).length,
    tasksTotal: tasks.length,
    streak: 5 // This should come from real user data
  };
  
  // Get incomplete tasks, sorted by due date
  const incompleteTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);
  
  // Format tasks for display
  const formattedTasks = incompleteTasks.map(task => {
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      ...task,
      status: diffDays <= 0 ? "today" : "upcoming",
      days: diffDays
    };
  });
  
  // Sample study groups - should come from real data
  const activeStudyGroups = studyGroups.filter(group => group.active) || [
    { id: 1, name: "Physics Study Group", status: "live", time: "Next Session in 2 hours", members: 4 }
  ];
  
  // Sample goals - should come from real data
  const goals = [
    { id: 1, name: "Get an A in CMPSC 221", progress: 75, details: "Currently at B+, need to improve on next assignments" },
    { id: 2, name: "Study 25 hours per week", progress: 60, details: "Currently at 15 hours this week" },
    { id: 3, name: "Complete Data Structures course", progress: 45, details: "5 of 12 lessons completed" }
  ];
  
  // Sample suggestions - these could be dynamic based on user context
  const suggestions = [
    "Show me my weekly schedule",
    "What are my priorities?",
    "Estimate how long CMPSC 360 homework will take",
    "Find study peers for MATH 230"
  ];
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    // This would normally send the suggestion to the chat
    notification.info({
      message: 'Suggestion Selected',
      description: `Processing: "${suggestion}"`,
      placement: 'bottomRight',
    });
    
    // Determine which component to open based on the suggestion
    if (suggestion.toLowerCase().includes("schedule")) {
      onOpenSchedule && onOpenSchedule();
    } else if (suggestion.toLowerCase().includes("priorities")) {
      onOpenPriorities && onOpenPriorities();
    } else if (suggestion.toLowerCase().includes("estimate") || suggestion.toLowerCase().includes("how long")) {
      onOpenEstimator && onOpenEstimator();
    } else if (suggestion.toLowerCase().includes("peers") || suggestion.toLowerCase().includes("study group")) {
      onOpenPeers && onOpenPeers();
    }
  };
  
  // Handle opening study group modal
  const handleJoinStudyGroup = () => {
    onOpenPeers && onOpenPeers();
  };
  
  // Handle task card click - show details
  const handleTaskClick = (task) => {
    setSelectedTask && setSelectedTask(task);
    onOpenEstimator && onOpenEstimator();
  };
  
  // Handle task estimation directly
  const handleEstimateTask = (task, e) => {
    e.stopPropagation();
    if (setSelectedTask && onOpenEstimator) {
      setSelectedTask(task);
      onOpenEstimator();
    }
  };
  
  // Handle calendar click
  const handleCalendarClick = () => {
    onOpenCalendar && onOpenCalendar();
  };
  
  // Handle goals click
  const handleGoalsClick = () => {
    onOpenGoals && onOpenGoals();
  };
  
  // Handle progress click
  const handleProgressClick = () => {
    onOpenProgress && onOpenProgress();
  };
  
  // Weekly calendar days
  const calendarDays = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    const isToday = i === 0;
    return { date, isToday };
  });

  // Add state to track chat activity
  const [chatActive, setChatActive] = useState(false);

  // Add function to handle chat state changes
  const handleChatStateChange = (hasMessages) => {
    setChatActive(hasMessages);
  };
  
  // Card size styling - reduced dimensions
  const cardStyle = { 
    marginBottom: 12, // Reduced from 16
    background: "#26262F", 
    borderRadius: 12, 
    border: "none",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
  };
  
  const cardHeadStyle = { 
    borderBottom: "1px solid #333", 
    color: "#fff", 
    padding: "8px 12px" // Reduced from 12px 16px
  };
  
  const cardBodyStyle = { 
    padding: "8px 12px", // Reduced from 12px 16px
    maxHeight: "180px", // Reduced from 210px
    overflowY: "auto",
    scrollbarWidth: "none", /* Firefox */
    msOverflowStyle: "none" /* IE and Edge */
  };
  
  return (
    <Layout style={{ minHeight: "100vh", background: "#1A1A25" }}>
      {/* Header with Aurora effect */}
      <Header style={{ 
        padding: 0, 
        background: "transparent", 
        position: "relative", 
        height: 64, 
        display: "flex", 
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 100
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <Aurora 
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} 
            blend={0.5} 
            amplitude={1.5} 
            speed={0.5} 
          />
        </div>
        
        {/* Custom navbar */}
        <div style={{ width: "100%", zIndex: 1 }}>
          <NavbarDefault openProfile={onOpenProfile} />
        </div>
      </Header>
      
      <Content style={{ padding: '20px', position: "relative" }}>
        {/* Global style for scrollbars */}
        <style>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              display: none;
            }
            
            /* Progress bar animation */
            @keyframes progressPulse {
              0% { box-shadow: 0 0 0 0 rgba(153, 129, 255, 0.4); }
              70% { box-shadow: 0 0 0 10px rgba(153, 129, 255, 0); }
              100% { box-shadow: 0 0 0 0 rgba(153, 129, 255, 0); }
            }
            
            .progress-animate .ant-progress-bg {
              animation: progressPulse 2s infinite;
            }
            
            /* Add a transition for the chat container */
            .chat-container {
              transition: all 0.5s ease-in-out;
            }

            /* Enhanced chat container styling */
            .chat-container {
              transition: all 0.5s ease-in-out;
              min-height: 50px;
              max-height: 65vh;
            }
            
            .chat-container.active {
              min-height: 300px;
            }
            
            /* Ensure messages don't push input out of view */
            .chat-messages {
              overflow-y: auto;
              max-height: calc(100% - 60px);
              padding-bottom: 10px;
            }
            
            /* Keep input visible */
            .chat-input {
              position: relative;
              z-index: 10;
              margin-top: auto;
              bottom: 0;
            }
          `}
        </style>
        
        {/* Welcome banner moved further down */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: 15, // Reduced from 30
          position: "relative",
          width: "100%",
          zIndex: 1,
          padding: "10px 0 15px 0", // Reduced from "20px 0 30px 0"
          background: "transparent"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Avatar size={40} src={userData.avatarUrl} style={{ marginRight: 12 }} />
            <div>
              <Title level={3} style={{ margin: 0, color: "#fff", marginBottom: 4 }}>
                Welcome back, Jack!
              </Title>
              <Text style={{ color: "#9981FF", fontSize: 16 }}>Your AI study companion</Text>
            </div>
          </div>
        </div>
        
        <Row gutter={[12, 12]} style={{ height: 'calc(100vh - 120px)', marginTop: -50 }}> {/* Changed from 'calc(100vh - 160px)' and marginTop from 20 to 5 */}
          {/* Left sidebar */}
          <Col span={6}>
            {/* Today's Tasks with Time Estimator for each task*/}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ClockCircleOutlined style={{ color: "#9981FF", marginRight: 8 }} />
                  <span style={{ color: "#fff", fontSize: "14px" }}>Today's Tasks</span> {/* Reduced font size */}
                </div>
              }
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              onClick={onOpenDeadlines}
              className="cursor-pointer custom-scrollbar"
            >
              <List
                dataSource={formattedTasks}
                renderItem={task => (
                  <List.Item 
                    style={{ 
                      border: "none", 
                      marginBottom: 6, // Reduced from 8
                      background: "#1F1F2C", 
                      borderRadius: 8,
                      padding: "6px 10px" // Reduced from 8px 12px
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                    className="cursor-pointer hover:bg-[#2a2a33] transition-all"
                  >
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ color: "#fff", fontSize: "13px" }}>{task.name}</Text> {/* Reduced font size */}
                        {task.status === "today" ? (
                          <Tag color="red" style={{ fontSize: "10px" }}>Due today</Tag> // Reduced font size
                        ) : (
                          <Tag color="orange" style={{ fontSize: "10px" }}>{task.days} {task.days === 1 ? "day" : "days"} left</Tag> // Reduced font size
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}> {/* Reduced margin */}
                        <Text style={{ color: "#aaa", fontSize: 11 }}>Due: {task.dueDate}</Text> {/* Reduced font size */}
                        <Button 
                          type="text" 
                          size="small"
                          icon={<ClockCircleOutlined style={{ color: "#9981FF" }} />}
                          onClick={(e) => handleEstimateTask(task, e)}
                          style={{ padding: "0 4px", fontSize: 11 }} // Reduced font size
                        >
                          <span style={{ color: "#9981FF", marginLeft: 2 }}>Estimate</span>
                        </Button>
                      </div>
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: 'No upcoming tasks!' }}
              />
              
              {formattedTasks.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Text style={{ color: "#aaa" }}>No upcoming tasks!</Text>
                </div>
              )}
            </Card>
            
            {/* Priority Dashboard - Moved from right side */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FireOutlined style={{ color: "#9981FF", marginRight: 8 }} />
                  <span style={{ color: "#fff", fontSize: "14px" }}>Priorities</span> {/* Reduced font size */}
                </div>
              }
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              onClick={onOpenPriorities}
              className="cursor-pointer custom-scrollbar"
            >
              <div style={{ marginBottom: 10 }}> {/* Reduced from 12 */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}> {/* Reduced from 4 */}
                  <Text style={{ color: "#fff", fontSize: "13px" }}>MATH 230 - 16.1 Homework</Text> {/* Reduced font size */}
                  <Tag color="red" style={{ fontSize: "10px" }}>Due today</Tag> {/* Reduced font size */}
                </div>
                <Progress 
                  percent={90} 
                  status="active" 
                  strokeColor="#FF5252" 
                  trailColor="#333"
                  showInfo={false}
                  size="small" // Added to make progress bar smaller
                />
              </div>
              
              <div style={{ marginBottom: 10 }}> {/* Reduced from 12 */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}> {/* Reduced from 4 */}
                  <Text style={{ color: "#fff", fontSize: "13px" }}>CMPSC 132 - Recitation #10</Text> {/* Reduced font size */}
                  <Tag color="orange" style={{ fontSize: "10px" }}>1 day left</Tag> {/* Reduced font size */}
                </div>
                <Progress 
                  percent={75} 
                  status="active" 
                  strokeColor="#FAAD14" 
                  trailColor="#333"
                  showInfo={false}
                  size="small" // Added to make progress bar smaller
                />
              </div>
              
              <div style={{ marginBottom: 3 }}> {/* Reduced from 4 */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}> {/* Reduced from 4 */}
                  <Text style={{ color: "#fff", fontSize: "13px" }}>Cmpsc221 - Programming Assignment 5</Text> {/* Reduced font size */}
                  <Tag color="yellow" style={{ fontSize: "10px" }}>10 days left</Tag> {/* Reduced font size */}
                </div>
                <Progress 
                  percent={40} 
                  status="active" 
                  strokeColor="#FAAD14" 
                  trailColor="#333"
                  showInfo={false}
                  size="small" // Added to make progress bar smaller
                />
              </div>
            </Card>
            
            {/* Goals - Enhanced with more details */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FlagOutlined style={{ color: "#9981FF", marginRight: 8 }} />
                  <span style={{ color: "#fff", fontSize: "14px" }}>My Goals</span> {/* Reduced font size */}
                </div>
              }
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              onClick={handleGoalsClick}
              className="cursor-pointer custom-scrollbar"
            >
              {goals.map(goal => (
                <div key={goal.id} style={{ marginBottom: 12 }}> {/* Reduced from 16 */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}> {/* Reduced from 8 */}
                    <Text style={{ color: "#fff", fontSize: "13px" }}>{goal.name}</Text> {/* Reduced font size */}
                    <Text style={{ color: "#9981FF", fontSize: "13px" }}>{goal.progress}%</Text> {/* Reduced font size */}
                  </div>
                  <Progress 
                    percent={goal.progress} 
                    status="active" 
                    strokeColor={{
                      '0%': '#9981FF',
                      '100%': '#C09BFF',
                    }}
                    trailColor="#333"
                    showInfo={false}
                    size="small" // Added to make progress bar smaller
                    className={goal.progress > 70 ? "progress-animate" : ""}
                  />
                  {goal.details && (
                    <Text style={{ color: "#aaa", fontSize: 11, display: "block", marginTop: 2 }}> {/* Reduced font size and margin */}
                      {goal.details}
                    </Text>
                  )}
                </div>
              ))}
              
              <Tooltip title="Set new academic goals">
                <Button 
                  type="default" 
                  style={{ 
                    width: "100%", 
                    marginTop: 6, // Reduced from 8
                    backgroundColor: "#1F1F2C",
                    borderColor: "#333",
                    color: "#9981FF",
                    height: "28px", // Reduced button height
                    fontSize: "12px" // Reduced font size
                  }}
                >
                  Add New Goal
                </Button>
              </Tooltip>
            </Card>
          </Col>
          
          {/* Main content area section */}
          <Col span={12}>
            <div style={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column",
              // Keep justifyContent as flex-start to position content from the top
              justifyContent: "flex-start", 
              alignItems: "center",
              padding: "20px 40px 10px 40px" 
            }}>
              {/* Welcome Message */}
              <div style={{ textAlign: "center", marginBottom: 30, marginTop: 30 }}>
                {/* ... Welcome message content ... */}
              </div>
              
              {/* Suggestions */}
              {!chatActive && (
                <div style={{ width: "100%", marginBottom: 20 }}>
                  {/* ... Suggestions content ... */}
                </div>
              )}
              
              {/* Chat container - Adjust vertical positioning when active */}
              <div 
                className={`chat-container ${chatActive ? 'active' : ''}`}
                style={{ 
                  width: "80%",
                  position: "relative",
                  // Use margin to push it down slightly from the top elements
                  marginTop: chatActive ? "20px" : 0, 
                  // Remove bottom margin, let maxHeight control the bottom edge
                  marginBottom: 0, 
                  // Set a max-height relative to viewport height when active
                  maxHeight: chatActive ? "65vh" : "50px", // Use viewport height
                  flex: "none", // Don't let it grow indefinitely
                  display: "flex",
                  flexDirection: "column",
                  // Keep input at the bottom *of this container*
                  justifyContent: "flex-end", 
                  overflow: "hidden" // Changed from overflowY
                }}
              >
                <Chatbot 
                  tasks={tasks}
                  setTasks={setTasks}
                  selectedTask={selectedTask}
                  setSelectedTask={setSelectedTask}
                  schedule={schedule}
                  setSchedule={setSchedule}
                  peers={setPeers}
                  onOpenEstimator={onOpenEstimator}
                  onOpenSchedule={onOpenSchedule}
                  onOpenPriorities={onOpenPriorities}
                  onOpenPeers={onOpenPeers}
                  onOpenProgress={onOpenProgress}
                  onOpenCalendar={onOpenCalendar}
                  onOpenDeadlines={onOpenDeadlines}
                  onOpenGoals={onOpenGoals}
                  onConversationChange={handleChatStateChange}
                />
              </div>
            </div>
          </Col>
          
          {/* Right sidebar */}
          <Col span={6}>
            {/* Study Group - Bigger card with live sessions */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TeamOutlined style={{ color: "#9981FF", marginRight: 8 }} />
                  <span style={{ color: "#fff", fontSize: "14px" }}>Study Groups</span> {/* Reduced font size */}
                </div>
              }
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              onClick={onOpenPeers}
              className="cursor-pointer custom-scrollbar"
            >
              {activeStudyGroups.map(group => (
                <div key={group.id} style={{ marginBottom: 12 }}> {/* Reduced from 16 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}> {/* Reduced from 8 */}
                    <Text style={{ color: "#FBBA61", fontWeight: "bold", fontSize: "13px" }}>{group.name}</Text> {/* Reduced font size */}
                    <Tag color="green" style={{ fontWeight: "bold", fontSize: "10px" }}>LIVE</Tag> {/* Reduced font size */}
                  </div>
                  <Text style={{ color: "#aaa", display: "block", marginBottom: 2, fontSize: "12px" }}>Next Session in 2 hours</Text> {/* Reduced margins and font size */}
                  <Text style={{ color: "#aaa", display: "block", marginBottom: 6, fontSize: "12px" }}>4 members online</Text> {/* Reduced margins and font size */}
                  
                  <Button 
                    type="primary" 
                    style={{ 
                      background: "#9981FF", 
                      width: "100%",
                      border: "none",
                      height: "28px", // Reduced height
                      fontSize: "12px" // Reduced font size
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinStudyGroup();
                    }}
                  >
                    Join Study Group
                  </Button>
                </div>
              ))}

              {/* Additional live session information */}
              <div style={{ marginTop: 16, background: "#1F1F2C", padding: 10, borderRadius: 8 }}> {/* Reduced from 20 and padding from 12 */}
                <Text style={{ color: "#FBBA61", display: "block", marginBottom: 3, fontSize: "12px" }}> {/* Reduced margin and font size */}
                  <span style={{ display: "inline-block", width: 6, height: 6, backgroundColor: "#4CAF50", borderRadius: "50%", marginRight: 6 }}></span> {/* Reduced size and margin */}
                  Active Study Session Available
                </Text>
                <Text style={{ color: "#aaa", display: "block", fontSize: "12px" }}>Join Quantum Physics Discussion</Text> {/* Reduced font size */}
              </div>
            </Card>
            
            {/* Weekly Planner (Combined) */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CalendarOutlined style={{ color: "#9981FF", marginRight: 8 }} />
                  <span style={{ color: "#fff", fontSize: "14px" }}>Weekly Planner</span> {/* Reduced font size */}
                </div>
              }
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              onClick={handleCalendarClick}
              className="cursor-pointer custom-scrollbar"
            >
              <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", marginBottom: 10 }}> {/* Reduced from 12 */}
                {calendarDays.map((day, i) => (
                  <div key={i} style={{ padding: "0 4px" }}> {/* Reduced padding */}
                    <div 
                      style={{ 
                        height: 30, // Reduced from 36
                        width: 30, // Reduced from 36
                        borderRadius: 15, // Reduced from 18
                        background: day.isToday ? "#9981FF" : "#333", 
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 3px", // Reduced from 4px
                        fontSize: "12px" // Reduced font size
                      }}
                    >
                      {day.date.getDate()}
                    </div>
                    <Text style={{ color: day.isToday ? "#9981FF" : "#aaa", fontSize: 10 }}> {/* Reduced font size */}
                      {dayNames[day.date.getDay()]}
                    </Text>
                  </div>
                ))}
              </div>
              
              <Divider style={{ background: "#333", margin: "10px 0" }} /> {/* Reduced from 12px 0 */}
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}> {/* Reduced from 8 */}
                  <Text style={{ color: "#fff", fontSize: "13px" }}>Today's Focus</Text> {/* Reduced font size */}
                  <Tag color="green" style={{ fontSize: "10px" }}>1 Task</Tag> {/* Reduced from 10px */}
                </div>
                <div style={{ background: "#1F1F2C", padding: 6, borderRadius: 8 }}> {/* Reduced from 8 */}
                  <Text style={{ color: "#aaa", display: "block", fontSize: "12px" }}>MATH 230 - 16.1 Homework</Text> {/* Reduced font size */}
                </div>
              </div>
            </Card>
            
            {/* Enhanced Study Streak */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FireOutlined style={{ color: "#9981FF", marginRight: 8 }} />
                  <span style={{ color: "#fff", fontSize: "14px" }}>Study Streak</span> {/* Reduced font size */}
                </div>
              }
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
              onClick={handleProgressClick}
              className="cursor-pointer custom-scrollbar"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}> {/* Reduced from 12 */}
                <div>
                  <Title level={3} style={{ margin: 0, color: "#fff" }}>5</Title> {/* Changed from level 2 */}
                  <Text style={{ color: "#aaa", fontSize: "12px" }}>Day Streak</Text> {/* Reduced font size */}
                </div>
                
                <div style={{ position: "relative", width: 70, height: 70 }}> {/* Reduced from 90x90 */}
                  <Progress 
                    type="circle" 
                    percent={75} 
                    strokeColor="#9981FF"
                    trailColor="#333" 
                    width={70} // Reduced from 90
                    format={() => (
                      <span style={{ color: "#fff", fontSize: 14 }}>75%</span> // Reduced from 16
                    )}
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}> {/* Reduced from 8 */}
                <div style={{ textAlign: "center" }}>
                  <Title level={5} style={{ margin: 0, color: "#9981FF", fontSize: "14px" }}>12</Title> {/* Reduced font size */}
                  <Text style={{ color: "#aaa", fontSize: 11 }}>Hours this week</Text> {/* Reduced from 12 */}
                </div>
                <div style={{ textAlign: "center" }}>
                  <Title level={5} style={{ margin: 0, color: "#9981FF", fontSize: "14px" }}>3</Title> {/* Reduced font size */}
                  <Text style={{ color: "#aaa", fontSize: 11 }}>Tasks today</Text> {/* Reduced from 12 */}
                </div>
                <div style={{ textAlign: "center" }}>
                  <Title level={5} style={{ margin: 0, color: "#9981FF", fontSize: "14px" }}>85%</Title> {/* Reduced font size */}
                  <Text style={{ color: "#aaa", fontSize: 11 }}>Efficiency</Text> {/* Reduced from 12 */}
                </div>
              </div>
              
              <Text style={{ color: "#aaa", display: "block", marginTop: 10, fontSize: 11 }}> {/* Reduced from 12 and font size */}
                You're doing great! Keep studying daily to maintain your streak.
              </Text>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RedesignedDashboard;