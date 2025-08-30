import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Progress, 
  List, 
  Badge, 
  Switch, 
  Empty, 
  Tabs, 
  Statistic, 
  Row, 
  Col, 
  Button, 
  Alert,
  Tag,
  Tooltip
} from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FireOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { TabPane } = Tabs;

const TaskItem = ({ task, onToggleComplete }) => {
  const [isChecked, setIsChecked] = useState(task.completed);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle task completion toggle with animation
  const handleToggle = (checked) => {
    setIsAnimating(true);
    setIsChecked(checked);
    
    // Delay the actual toggling to allow animation to play
    setTimeout(() => {
      onToggleComplete(task.id, checked);
      setIsAnimating(false);
    }, 300);
  };
  
  return (
    <List.Item
      actions={[
        <Switch 
          checked={isChecked} 
          onChange={handleToggle}
          size="small"
          disabled={isAnimating}
        />
      ]}
      className={`bg-[#26262F] rounded-lg mb-2 hover:shadow-md transition-all ${isAnimating ? 'animate-pulse' : ''}`}
    >
      <List.Item.Meta
        avatar={
          <motion.div
            animate={isChecked ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.5 }}
          >
            {isChecked 
              ? <CheckCircleOutlined className="text-green-500 text-xl" /> 
              : <ClockCircleOutlined className="text-yellow-500 text-xl" />
            }
          </motion.div>
        }
        title={
          <motion.span 
            className={isChecked ? "text-gray-400 line-through" : "text-white"}
            animate={isAnimating ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.3, repeat: 2 }}
          >
            {task.name}
          </motion.span>
        }
        description={
          <div>
            <span className="text-gray-400">Due: {task.dueDate}</span>
            {task.estimatedTime && (
              <Badge 
                count={`${task.estimatedTime}h`} 
                style={{ backgroundColor: '#9981FF', marginLeft: 8 }} 
              />
            )}
            {task.priority === 'high' && (
              <Tag color="red" className="ml-2">High Priority</Tag>
            )}
          </div>
        }
      />
    </List.Item>
  );
};

const WeeklyProgress = ({ completedHours, totalHours, streak }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const adjustedToday = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday
  
  // Generate daily progress with realistic pattern
  const dailyProgress = daysOfWeek.map((day, index) => {
    // Past days have random but realistic progress
    // Today has current progress
    // Future days have 0 progress
    let percent;
    if (index < adjustedToday) {
      // Past days with realistic pattern (higher on weekdays, lower on weekends)
      const isWeekend = index >= 5;
      const base = isWeekend ? 50 : 80;
      percent = Math.floor(base + Math.random() * 20);
    } else if (index === adjustedToday) {
      // Today has 45% progress (like we're in the middle of the day)
      percent = 45;
    } else {
      // Future days have 0 progress
      percent = 0;
    }
    
    return {
      day,
      percent,
      isToday: index === adjustedToday
    };
  });
  
  return (
    <div className="weekly-progress">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-white m-0">Weekly Progress</h3>
          <p className="text-gray-400 text-sm">Your study hours this week</p>
        </div>
        <div className="flex items-center">
          <TrophyOutlined className="text-yellow-500 mr-2" />
          <span className="text-white">{streak} day streak</span>
          <Tooltip title="You've studied consistently for 5 days in a row!">
            <InfoCircleOutlined className="ml-2 text-gray-400 cursor-pointer" />
          </Tooltip>
        </div>
      </div>
      
      <Row gutter={[16, 16]} className="mb-4">
        <Col span={12}>
          <Card className="bg-[#26262F] border-0">
            <Statistic
              title={<span className="text-gray-400">Completed</span>}
              value={completedHours}
              suffix="hours"
              valueStyle={{ color: '#9981FF' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="bg-[#26262F] border-0">
            <Statistic
              title={<span className="text-gray-400">Target</span>}
              value={totalHours}
              suffix="hours"
              valueStyle={{ color: '#FFC107' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <div className="daily-progress grid grid-cols-7 gap-2 mb-2">
        {dailyProgress.map((day, index) => (
          <div key={index} className="text-center">
            <div 
              className={`progress-bar rounded-t-lg ${day.isToday ? 'bg-[#9981FF]' : 'bg-[#26262F]'}`}
              style={{ 
                height: `${Math.max(50, day.percent)}px`, 
                transition: 'height 0.5s ease',
                opacity: day.percent > 0 ? 1 : 0.5
              }}
            ></div>
            <div className={`text-xs mt-1 ${day.isToday ? 'text-[#9981FF] font-bold' : 'text-gray-400'}`}>
              {day.day}
              {day.percent > 0 && (
                <div className="text-xs">{day.percent}%</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <Progress 
        percent={Math.round((completedHours / totalHours) * 100)} 
        status="active" 
        strokeColor="#9981FF"
        className="mt-4"
      />
    </div>
  );
};

const ProgressTracker = ({ tasks, onToggleComplete }) => {
  const [taskList, setTaskList] = useState(tasks);
  const [activeTab, setActiveTab] = useState('1');
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [recentlyCompletedTask, setRecentlyCompletedTask] = useState(null);
  
  // Update taskList when tasks prop changes
  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);
  
  // Calculate progress statistics
  const completedTasks = taskList.filter(task => task.completed);
  const pendingTasks = taskList.filter(task => !task.completed);
  const completionPercentage = Math.round((completedTasks.length / taskList.length) * 100) || 0;
  
  // Calculate study hours (based on estimated times)
  const completedHours = completedTasks.reduce((total, task) => total + (task.estimatedTime || 0), 0);
  const totalHours = taskList.reduce((total, task) => total + (task.estimatedTime || 0), 0);
  const remainingHours = totalHours - completedHours;
  
  // Toggle task completion status with animation
  const handleToggleComplete = (taskId, isCompleted) => {
    const updatedTaskList = taskList.map(task => 
      task.id === taskId 
        ? { ...task, completed: isCompleted }
        : task
    );
    
    setTaskList(updatedTaskList);
    
    // If a task was just completed, show the animation
    if (isCompleted) {
      const justCompletedTask = taskList.find(task => task.id === taskId);
      setRecentlyCompletedTask(justCompletedTask);
      setShowCompletionAnimation(true);
      setTimeout(() => setShowCompletionAnimation(false), 3000);
    }
    
    if (onToggleComplete) {
      onToggleComplete(taskId, isCompleted);
    }
  };
  
  // Get appropriate color for progress
  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#FF5252';
    if (percentage < 70) return '#FFC107';
    return '#4CAF50';
  };
  
  return (
    <Card
      title={
        <div className="flex items-center">
          <BarChartOutlined className="text-[#9981FF] mr-2" />
          <span className="text-white">Progress Tracker</span>
        </div>
      }
      className="bg-[#1F1F2C] text-white border-0"
      headStyle={{ borderBottom: '1px solid #333' }}
    >
      {/* Task Completion Animation */}
      <AnimatePresence>
        {showCompletionAnimation && recentlyCompletedTask && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompletionAnimation(false)}
          >
            <motion.div
              className="bg-[#1F1F2C] p-6 rounded-xl text-center max-w-md"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircleOutlined style={{ fontSize: 32, color: 'white' }} />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Task Completed!</h2>
              <p className="text-lg text-gray-300 mb-4">{recentlyCompletedTask.name}</p>
              <div className="flex justify-center gap-4">
                <Statistic
                  title="Your Progress"
                  value={completionPercentage}
                  suffix="%"
                  valueStyle={{ color: '#4CAF50' }}
                />
                <Statistic
                  title="Completed Tasks"
                  value={completedTasks.length}
                  suffix={`/${taskList.length}`}
                  valueStyle={{ color: '#9981FF' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="progress-overview bg-[#26262F] p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-white text-lg m-0">Overall Progress</h3>
              <p className="text-gray-400 text-sm">
                {completedTasks.length} of {taskList.length} tasks completed
              </p>
            </div>
            <div className="progress-circle">
              <Progress 
                type="circle" 
                percent={completionPercentage} 
                width={80}
                strokeColor={getProgressColor(completionPercentage)}
                format={percent => (
                  <span style={{ color: 'white' }}>{percent}%</span>
                )}
              />
            </div>
          </div>
          
          <Progress 
            percent={completionPercentage} 
            status="active" 
            strokeColor={{
              '0%': '#9981FF',
              '100%': '#C09BFF',
            }}
            className="mb-1"
          />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>Just Started</span>
            <span>Halfway There</span>
            <span>Almost Done</span>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-[#1F1F2C] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 m-0">Completed</p>
              <p className="text-lg text-[#9981FF] font-semibold m-0">{completedHours} hrs</p>
            </div>
            <div className="bg-[#1F1F2C] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 m-0">Remaining</p>
              <p className="text-lg text-yellow-500 font-semibold m-0">{remainingHours} hrs</p>
            </div>
            <div className="bg-[#1F1F2C] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 m-0">Study Streak</p>
              <p className="text-lg text-green-500 font-semibold m-0">5 days</p>
            </div>
          </div>
        </div>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="custom-tabs"
          style={{ color: 'white' }}
        >
          <TabPane 
            tab={
              <span className="text-white">
                <ClockCircleOutlined /> Pending Tasks ({pendingTasks.length})
              </span>
            } 
            key="1"
          >
            {pendingTasks.length > 0 ? (
              <List
                dataSource={pendingTasks}
                renderItem={task => (
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TaskItem task={task} onToggleComplete={handleToggleComplete} />
                    </motion.div>
                  </AnimatePresence>
                )}
              />
            ) : (
              <Empty 
                description={<span className="text-gray-400">All tasks completed! 🎉</span>} 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span className="text-white">
                <CheckCircleOutlined /> Completed ({completedTasks.length})
              </span>
            } 
            key="2"
          >
            {completedTasks.length > 0 ? (
              <List
                dataSource={completedTasks}
                renderItem={task => (
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TaskItem task={task} onToggleComplete={handleToggleComplete} />
                    </motion.div>
                  </AnimatePresence>
                )}
              />
            ) : (
              <Empty 
                description={<span className="text-gray-400">No completed tasks yet</span>} 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span className="text-white">
                <CalendarOutlined /> Weekly
              </span>
            } 
            key="3"
          >
            <WeeklyProgress 
              completedHours={completedHours} 
              totalHours={totalHours}
              streak={5}
            />
          </TabPane>
        </Tabs>
        
        <div className="text-center mt-4">
          <Button 
            type="primary" 
            icon={<ArrowUpOutlined />}
            style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
          >
            View Detailed Analytics
          </Button>
        </div>
      </motion.div>
    </Card>
  );
};

export default ProgressTracker;