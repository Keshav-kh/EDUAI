import React, { useState, useEffect } from 'react';
import { Card, Tag, Badge, Tooltip, Alert, Button, notification } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined, 
  SwapOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeeklyPlanner = ({ schedule, onTaskMove }) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [recentlyMovedTask, setRecentlyMovedTask] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Clear the recently moved task highlight after 3 seconds
  useEffect(() => {
    if (recentlyMovedTask) {
      const timer = setTimeout(() => {
        setRecentlyMovedTask(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyMovedTask]);
  
  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };
  
  // Get the day of week from date
  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Sunday
  };
  
  // Handle drag start
  const handleDragStart = (e, day, task) => {
    setDraggedTask({ day, task });
    // Create a ghost image for drag
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('task-ghost');
    ghostElement.style.padding = '8px';
    ghostElement.style.background = '#9981FF';
    ghostElement.style.borderRadius = '4px';
    ghostElement.style.color = 'white';
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    ghostElement.style.opacity = '0.8';
    ghostElement.innerText = task;
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    // Use a timeout to remove the ghost element
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };
  
  // Handle drag over
  const handleDragOver = (e, day) => {
    e.preventDefault();
    setHoveredDay(day);
  };
  
  // Handle drop
  const handleDrop = (e, targetDay) => {
    e.preventDefault();
    if (draggedTask && draggedTask.day !== targetDay) {
      if (onTaskMove) {
        onTaskMove(draggedTask.day, targetDay, draggedTask.task);
        setRecentlyMovedTask({
          task: draggedTask.task,
          fromDay: draggedTask.day,
          toDay: targetDay
        });
        
        // Show success notification
        notification.success({
          message: 'Task Rescheduled',
          description: `"${draggedTask.task.split(' (')[0]}" moved from ${getDayOfWeek(draggedTask.day)} to ${getDayOfWeek(targetDay)}`,
          placement: 'bottomRight',
        });
      }
    }
    setDraggedTask(null);
    setHoveredDay(null);
  };

  // Helper to check if a task was recently moved
  const isRecentlyMoved = (day, task) => {
    return recentlyMovedTask && 
           recentlyMovedTask.toDay === day && 
           recentlyMovedTask.task === task;
  };
  
  return (
    <div className="weekly-planner">
      {showInstructions && (
        <Alert
          message="Drag and Drop to Reschedule"
          description="Click and drag any task to move it to a different day. The system will automatically update your schedule. Your changes are saved automatically."
          type="info"
          showIcon
          closable
          icon={<SwapOutlined />}
          onClose={() => setShowInstructions(false)}
          className="mb-4 bg-[#1F1F2C] border-[#9981FF] text-gray-300"
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(schedule).map(([date, tasks]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`day-card ${hoveredDay === date ? 'day-hovered' : ''}`}
            onDragOver={(e) => handleDragOver(e, date)}
            onDrop={(e) => handleDrop(e, date)}
          >
            <Card 
              title={
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">{getDayOfWeek(date)}</span>
                  <Tag color="purple">{formatDate(date)}</Tag>
                </div>
              }
              className={`bg-[#26262F] text-white border-0 h-full ${
                hoveredDay === date ? 'ring-2 ring-[#9981FF]' : ''
              }`}
              bodyStyle={{ 
                height: '100%', 
                overflow: 'auto',
                background: hoveredDay === date ? '#2A2A35' : '#26262F',
                transition: 'all 0.3s ease'
              }}
              headStyle={{ borderBottom: '1px solid #333', padding: '12px' }}
            >
              {tasks.length === 0 ? (
                <div className="text-gray-400 text-center py-4 border-2 border-dashed border-gray-700 rounded-lg h-32 flex items-center justify-center">
                  <div>
                    <p>No tasks scheduled</p>
                    <p className="text-xs">Drop tasks here</p>
                  </div>
                </div>
              ) : (
                <ul className="list-none p-0 m-0 space-y-2">
                  {tasks.map((task, idx) => (
                    <AnimatePresence mode="popLayout" key={`${date}-${idx}`}>
                      <motion.li 
                        draggable
                        onDragStart={(e) => handleDragStart(e, date, task)}
                        className={`bg-[#333] p-3 rounded-lg cursor-move hover:bg-[#444] transition-all ${
                          isRecentlyMoved(date, task) ? 'ring-2 ring-green-500' : ''
                        }`}
                        initial={isRecentlyMoved(date, task) ? { scale: 0.9 } : { opacity: 1 }}
                        animate={isRecentlyMoved(date, task) ? 
                          { scale: 1, boxShadow: '0 0 8px rgba(0, 255, 0, 0.5)' } : 
                          { opacity: 1 }
                        }
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start gap-2">
                          <ClockCircleOutlined className="mt-1 text-[#9981FF]" />
                          <div>
                            <div className="text-sm font-medium">{task.split(' (')[0]}</div>
                            {task.includes('(') && (
                              <Badge color="#9981FF" text={task.match(/\((.*?)\)/)[1]} />
                            )}
                          </div>
                          {isRecentlyMoved(date, task) && (
                            <Tag color="green" className="ml-auto animate-pulse">
                              Just moved
                            </Tag>
                          )}
                        </div>
                      </motion.li>
                    </AnimatePresence>
                  ))}
                </ul>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-gray-400 text-center flex justify-center items-center bg-[#1F1F2C] p-3 rounded-lg">
        <BarChartOutlined className="mr-2 text-[#9981FF]" /> 
        <span>
          Drag and drop tasks to reschedule • All changes are automatically saved
        </span>
      </div>
    </div>
  );
};

export default WeeklyPlanner;