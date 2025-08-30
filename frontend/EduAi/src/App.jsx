import { useState, useEffect } from "react";
import { Experience } from "./components/Experience";
import NavbarDefault from "./components/Layout/Navbar/Navbar";
import Leftcardlayout from "./components/Layout/Cards/Leftcardlayout";
import Rightcardlayout from "./components/Layout/Cards/Rightcardlayout";
import Chatbot from "./Api/ChatbotApi";
import Aurora from "./components/Animations/Aurora";
import { ConfigProvider, theme, notification, Modal } from "antd";
import TaskEstimator from "./components/TaskEstimator";
import WeeklyPlanner from "./components/WeeklyPlanner";
import PriorityDashboard from "./components/PrioritySettings";
import StudyPeers from "./components/StudyPeers";
import ProgressTracker from "./components/ProgressTracker";
import BigCalendarComponent from "./components/Calendar/BigCalendarComponent";
import DeadlinesModal from "./components/DeadlinesModal";
import ProfileSettingsModal from "./components/ProfileSettings";
import GoalsModal from "./components/GoalsModal";
import RedesignedDashboard from "./components/Dashboard/RedesignedDashboard"; // NEW: Import redesigned dashboard
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  FireOutlined, 
  TeamOutlined,
  BarChartOutlined 
} from "@ant-design/icons";

// Demo data
const DEMO_TASKS = [
  { id: 1, name: "CMPSC 132 - Recitation #10", dueDate: "2025-04-12", priority: "high", estimatedTime: 2.5, difficulty: 7, focus: 6, completed: false },
  { id: 2, name: "MATH 230 - 16.1 Homework", dueDate: "2025-04-09", priority: "medium", estimatedTime: 3, difficulty: 8, focus: 7, completed: false },
  { id: 3, name: "Geog 30N - Written Assignment 3", dueDate: "2025-03-24", priority: "high", estimatedTime: 4, difficulty: 6, focus: 8, completed: true },
  { id: 4, name: "CMPSC 360 - HW8", dueDate: "2025-04-25", priority: "medium", estimatedTime: 2, difficulty: 5, focus: 6, completed: false },
  { id: 5, name: "Cmpsc221 - Programming Assignment 5", dueDate: "2025-04-21", priority: "high", estimatedTime: 5, difficulty: 9, focus: 7, completed: false },
];

const STUDY_PEERS = [
  { 
    id: 1, 
    name: "Alex Chen", 
    course: "CMPSC 132", 
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
    topics: ["Binary Trees", "Algorithms"],
    matchScore: 92
  },
  { 
    id: 2, 
    name: "Maya Johnson", 
    course: "MATH 230", 
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
    topics: ["Triple Integrals", "Vector Fields"],
    matchScore: 87
  },
  { 
    id: 3, 
    name: "Raj Patel", 
    course: "CMPSC 360", 
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=3",
    topics: ["Discrete Math", "Proofs"],
    matchScore: 79
  },
];

const WEEKLY_SCHEDULE = {
  "2025-04-08": ["CMPSC 132 - Recitation #10 (2hrs)", "Study Group - MATH 230 (1hr)"],
  "2025-04-09": ["CMPSC 360 - HW8 (3hrs)", "Review MATH 230 notes (1hr)"],
  "2025-04-10": ["MATH 230 - 16.1 Homework (2.5hrs)", "Start research for Geog 30N (1hr)"],
  "2025-04-11": ["Complete Cmpsc221 assignment (3hrs)", "METEO 1N readings (1hr)"],
  "2025-04-12": ["Review session - CMPSC 132 (2hrs)", "Free study time (2hrs)"],
};

const STUDY_GROUPS = [
  {
    id: 1,
    name: "CMPSC 132 Study Group",
    description: "Weekly sessions focusing on data structures and algorithms from the course.",
    nextSession: "Today, 7:00 PM",
    active: true,
    topics: ["Binary Trees", "Heaps", "Recitation #10"],
    members: [
      { name: "Alex Chen", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1" },
      { name: "Sofia Garcia", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=4" },
      { name: "Raj Patel", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=3" },
    ]
  },
  {
    id: 2,
    name: "MATH 230 Calculus Group",
    description: "Practice group for multivariable calculus problems and exam prep.",
    nextSession: "Tomorrow, 5:30 PM",
    active: false,
    topics: ["Triple Integrals", "Homework 16.1"],
    members: [
      { name: "Maya Johnson", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2" },
      { name: "Carlos Rodriguez", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=5" },
    ]
  }
];

function App() {
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [schedule, setSchedule] = useState(WEEKLY_SCHEDULE);
  const [peers, setPeers] = useState(STUDY_PEERS);
  const [studyGroups, setStudyGroups] = useState(STUDY_GROUPS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [recentlyEstimated, setRecentlyEstimated] = useState(false);
  const [recentlyMoved, setRecentlyMoved] = useState(false);
  const [useRedesignedDashboard, setUseRedesignedDashboard] = useState(true); // NEW: Flag to toggle dashboard layouts
  
  // Add modal visibility states
  const [showEstimator, setShowEstimator] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPriorities, setShowPriorities] = useState(false);
  const [showPeers, setShowPeers] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGoals, setShowGoals] = useState(false); // NEW state for GoalsModal
  
  // Initial demo setup
  useEffect(() => {
    // Simulate first-time user experience
    notification.info({
      message: 'Welcome to EDUAI!',
      description: 'Click on any card to get detailed information and control your study experience.',
      placement: 'bottomRight',
      duration: 5
    });
  }, []);

  // Handle task estimation
  const handleTaskEstimate = (difficulty, focus, time) => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, difficulty, focus, estimatedTime: time }
          : task
      );
      setTasks(updatedTasks);
      setRecentlyEstimated(true);
      
      // Update the selected task
      setSelectedTask({...selectedTask, difficulty, focus, estimatedTime: time});
      
      // Show success notification
      notification.success({
        message: 'Time Estimated',
        description: `"${selectedTask.name}" estimated to take ${time} hours to complete.`,
        placement: 'bottomRight',
      });
      
      // Reset flag after some time
      setTimeout(() => setRecentlyEstimated(false), 5000);
    }
  };

  // Handle task completion toggle
  const handleToggleComplete = (taskId, isCompleted) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: isCompleted }
        : task
    );
    setTasks(updatedTasks);
    
    // Update the selected task if it's the one being toggled
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({...selectedTask, completed: isCompleted});
    }
    
    // Show notification
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      notification.info({
        message: isCompleted ? 'Task Completed' : 'Task Reopened',
        description: `"${task.name}" has been marked as ${isCompleted ? 'completed' : 'pending'}.`,
        placement: 'bottomRight',
      });
    }
  };

  // Handle task movement in schedule
  const handleTaskMove = (fromDay, toDay, task) => {
    const updatedSchedule = { ...schedule };
    
    // Remove from original day
    updatedSchedule[fromDay] = updatedSchedule[fromDay].filter(t => t !== task);
    
    // Add to new day
    updatedSchedule[toDay] = [...updatedSchedule[toDay], task];
    
    setSchedule(updatedSchedule);
    setRecentlyMoved(true);
    
    // Reset flag after some time
    setTimeout(() => setRecentlyMoved(false), 5000);
  };
  
  // Handle task selection for details
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    
    // Show notification
    notification.info({
      message: 'Task Selected',
      description: `You've selected "${task.name}". You can now estimate time, view details, or mark it as complete.`,
      placement: 'bottomRight',
    });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#9981FF',
          colorBgBase: '#1F1F2C',
          borderRadius: 8,
        },
      }}
    >
      {useRedesignedDashboard ? (
        // NEW REDESIGNED DASHBOARD LAYOUT
        <RedesignedDashboard
          tasks={tasks}
          setTasks={setTasks}
          selectedTask={selectedTask}
          setSelectedTask={handleTaskSelect}
          schedule={schedule}
          setSchedule={setSchedule}
          peers={peers}
          setPeers={setPeers}
          studyGroups={studyGroups}
          setStudyGroups={setStudyGroups}
          onEstimate={handleTaskEstimate}
          onToggleComplete={handleToggleComplete}
          onTaskMove={handleTaskMove}
          recentlyEstimated={recentlyEstimated}
          recentlyMoved={recentlyMoved}
          onOpenEstimator={() => setShowEstimator(true)}
          onOpenSchedule={() => setShowSchedule(true)}
          onOpenPriorities={() => setShowPriorities(true)}
          onOpenPeers={() => setShowPeers(true)}
          onOpenProgress={() => setShowProgress(true)}
          onOpenCalendar={() => setShowCalendar(true)}
          onOpenDeadlines={() => setShowDeadlines(true)}
          onOpenGoals={() => setShowGoals(true)}
          onOpenProfile={() => setShowProfile(true)}
        />
      ) : (
        // ORIGINAL LAYOUT
        <>
          {/* Navbar with profile prop */}
          <div className="relative max-w-full w-full h-20">
            <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.5}
              speed={0.5}
              className="absolute top-0 left-0 w-full h-full"
            />
            <NavbarDefault openProfile={() => setShowProfile(true)} />
          </div>
          
          {/* Main content area with Rightcardlayout deadlines and goals props */}
          <div className="flex m-4 h-[calc(100vh-140px)] relative">
            <Leftcardlayout 
              tasks={tasks}
              selectedTask={selectedTask}
              setSelectedTask={handleTaskSelect}
              onEstimate={handleTaskEstimate}
              onToggleComplete={handleToggleComplete}
              recentlyEstimated={recentlyEstimated}
            />
            <Experience />
            <Rightcardlayout 
              peers={peers}
              schedule={schedule}
              onTaskMove={handleTaskMove}
              tasks={tasks}
              recentlyMoved={recentlyMoved}
              onOpenDeadlines={() => setShowDeadlines(true)}
              onOpenGoals={() => setShowGoals(true)}
            />
          </div>
          
          {/* Chatbot with modal control functions */}
          <div className="fixed bottom-0 left-0 right-0 mx-auto px-4 pb-4 max-w-[60%]">
            <Chatbot 
              tasks={tasks}
              setTasks={setTasks}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              schedule={schedule}
              setSchedule={setSchedule}
              peers={setPeers}
              // Pass modal control functions
              onOpenEstimator={() => setShowEstimator(true)}
              onOpenSchedule={() => setShowSchedule(true)}
              onOpenPriorities={() => setShowPriorities(true)}
              onOpenPeers={() => setShowPeers(true)}
              onOpenProgress={() => setShowProgress(true)}
              onOpenCalendar={() => setShowCalendar(true)}
              onOpenDeadlines={() => setShowDeadlines(true)}
              onOpenGoals={() => setShowGoals(true)}
            />
          </div>
        </>
      )}

        {/* Modals - these are shown regardless of which layout is used */}
        {/* Time Estimator Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <ClockCircleOutlined className="text-[#9981FF] mr-2" />
              <span>Task Time Estimator</span>
            </div>
          }
          open={showEstimator}
          onCancel={() => setShowEstimator(false)}
          footer={null}
          width="80%"
        >
          <TaskEstimator 
            task={selectedTask || (tasks && tasks[0])}
            onEstimate={handleTaskEstimate}
          />
        </Modal>
        
        {/* Weekly Planner Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <CalendarOutlined className="text-[#9981FF] mr-2" />
              <span>Weekly Planning</span>
            </div>
          }
          open={showSchedule}
          onCancel={() => setShowSchedule(false)}
          footer={null}
          width="90%"
        >
          <WeeklyPlanner 
            schedule={schedule}
            onTaskMove={handleTaskMove}
          />
        </Modal>
        
        {/* Priority Dashboard Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <FireOutlined className="text-[#9981FF] mr-2" />
              <span>Priority Dashboard</span>
            </div>
          }
          open={showPriorities}
          onCancel={() => setShowPriorities(false)}
          footer={null}
          width="90%"
        >
          <PriorityDashboard tasks={tasks} />
        </Modal>
        
        {/* Study Peers Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <TeamOutlined className="text-[#9981FF] mr-2" />
              <span>Study Groups & Peers</span>
            </div>
          }
          open={showPeers}
          onCancel={() => setShowPeers(false)}
          footer={null}
          width="90%"
        >
          <StudyPeers 
            peers={peers}
            recommendedGroups={studyGroups}
          />
        </Modal>
        
        {/* Progress Tracker Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <BarChartOutlined className="text-[#9981FF] mr-2" />
              <span>Progress Tracker</span>
            </div>
          }
          open={showProgress}
          onCancel={() => setShowProgress(false)}
          footer={null}
          width="90%"
        >
          <ProgressTracker 
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
          />
        </Modal>
        
        {/* Calendar Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <CalendarOutlined className="text-[#9981FF] mr-2" />
              <span>Full Calendar View</span>
            </div>
          }
          open={showCalendar}
          onCancel={() => setShowCalendar(false)}
          footer={null}
          width="90%"
        >
          <BigCalendarComponent events={schedule} />
        </Modal>

        {/* Deadlines Modal */}
        <DeadlinesModal
          visible={showDeadlines}
          onClose={() => setShowDeadlines(false)}
          tasks={tasks}
        />

        {/* Goals Modal */}
        <GoalsModal
          visible={showGoals}
          onClose={() => setShowGoals(false)}
        />

        {/* Profile Settings Modal */}
        <ProfileSettingsModal
          visible={showProfile}
          onClose={() => setShowProfile(false)}
          userData={{
            name: "Keshav Khandelwal",
            email: "kk5431@psu.edu",
            preferences: {
              dailyStudyHours: 4,
              preferredStudyTime: "evening",
              difficultyAdjustment: 1.1,
              focusAdjustment: 0.9
            },
            courses: [
              { id: 1, name: "CMPSC 221", difficulty: 8, focus: 7 },
              { id: 2, name: "CMPSC 360", difficulty: 9, focus: 8 },
              { id: 3, name: "MATH 141", difficulty: 7, focus: 6 },
              { id: 4, name: "PHYS 212", difficulty: 8, focus: 7 },
              { id: 5, name: "ENGL 202C", difficulty: 5, focus: 5 }
            ],
            notifications: {
              deadlineReminders: true,
              studyReminders: true,
              peerActivity: false,
              progressReports: true
            }
          }}
        />
    </ConfigProvider>
  );
}

export default App;