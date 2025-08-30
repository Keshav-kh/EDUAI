import React, { useState, useEffect } from 'react';
import { Card, Badge, Progress, Tooltip, Tag, Alert, Button } from 'antd';
import { 
  AlertOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  BarChartOutlined,
  StarOutlined,
  BookOutlined,
  FireOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const PriorityCard = ({ task, index, onSelect }) => {
  // Calculate a deadline proximity score (0-100)
  const calculateDeadlineScore = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    // Score formula: fewer days = higher score
    // 0 days = 100%, 7+ days = 0%
    return Math.max(0, Math.min(100, 100 - (daysLeft * 14)));
  };
  
  // Calculate a difficulty score (0-100)
  const calculateDifficultyScore = () => {
    return task.difficulty ? task.difficulty * 10 : 50; // Default to 50 if not set
  };
  
  // Calculate impact score (0-100) based on priority
  const calculateImpactScore = () => {
    switch(task.priority) {
      case 'high': return 90;
      case 'medium': return 60;
      case 'low': return 30;
      default: return 50;
    }
  };
  
  // Get color based on priority
  const getPriorityColor = () => {
    switch(task.priority) {
      case 'high': return '#FF5252';
      case 'medium': return '#FFC107';
      case 'low': return '#2196F3';
      default: return '#9981FF';
    }
  };
  
  const deadlineScore = calculateDeadlineScore();
  const difficultyScore = calculateDifficultyScore();
  const impactScore = calculateImpactScore();
  
  // Calculate overall priority score (weighted average)
  const priorityScore = Math.round((deadlineScore * 0.4) + (difficultyScore * 0.3) + (impactScore * 0.3));
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect && onSelect(task)}
      className="cursor-pointer"
    >
      <Card 
        className="bg-[#26262F] text-white border-0 mb-3 hover:bg-[#2D2D36] transition-all"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <div className="flex items-start">
          <div className="mr-3 flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
              style={{ 
                backgroundColor: `${getPriorityColor()}20`, 
                border: `2px solid ${getPriorityColor()}`,
                boxShadow: priorityScore > 75 ? `0 0 10px ${getPriorityColor()}80` : 'none'
              }}
            >
              <span className="text-lg font-bold">{priorityScore}</span>
            </div>
            <span className="text-xs text-gray-400">Priority</span>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="text-white font-medium m-0 mb-1">{task.name}</h4>
              <Badge 
                color={getPriorityColor()} 
                text={
                  <span className="flex items-center">
                    {priorityScore > 75 && <FireOutlined className="mr-1 animate-pulse" />}
                    {task.priority.toUpperCase()}
                  </span>
                }
              />
            </div>
            
            <p className="text-gray-400 text-sm mb-2">
              <ClockCircleOutlined className="mr-1" /> Due: {task.dueDate}
            </p>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Tooltip title="Deadline Proximity - Higher score means the deadline is approaching soon">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center">
                      <AlertOutlined className="mr-1 text-red-500" /> Deadline
                    </span>
                    <span>{deadlineScore}%</span>
                  </div>
                  <Progress 
                    percent={deadlineScore} 
                    size="small" 
                    showInfo={false} 
                    strokeColor="#FF5252" 
                  />
                </div>
              </Tooltip>
              
              <Tooltip title="Task Difficulty - Based on the complexity of the task">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center">
                      <BarChartOutlined className="mr-1 text-yellow-500" /> Difficulty
                    </span>
                    <span>{difficultyScore}%</span>
                  </div>
                  <Progress 
                    percent={difficultyScore} 
                    size="small" 
                    showInfo={false} 
                    strokeColor="#FFC107" 
                  />
                </div>
              </Tooltip>
              
              <Tooltip title="Grade Impact - How important this task is for your overall grade">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center">
                      <StarOutlined className="mr-1 text-blue-500" /> Impact
                    </span>
                    <span>{impactScore}%</span>
                  </div>
                  <Progress 
                    percent={impactScore} 
                    size="small" 
                    showInfo={false} 
                    strokeColor="#2196F3" 
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const PriorityDashboard = ({ tasks, onTaskSelect }) => {
  const [showInfo, setShowInfo] = useState(true);
  const [sortedTasks, setSortedTasks] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('all');
  
  // Sort and filter tasks
  useEffect(() => {
    // Clone tasks to avoid modifying original
    let tasksToProcess = [...tasks];
    
    // Add priority scores to tasks
    tasksToProcess = tasksToProcess.map(task => {
      // Calculate deadline score
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      const deadlineScore = Math.max(0, Math.min(100, 100 - (daysLeft * 14)));
      
      // Calculate difficulty score
      const difficultyScore = task.difficulty ? task.difficulty * 10 : 50;
      
      // Calculate impact score based on priority
      let impactScore;
      switch(task.priority) {
        case 'high': impactScore = 90; break;
        case 'medium': impactScore = 60; break;
        case 'low': impactScore = 30; break;
        default: impactScore = 50;
      }
      
      // Calculate overall priority score
      const priorityScore = Math.round((deadlineScore * 0.4) + (difficultyScore * 0.3) + (impactScore * 0.3));
      
      return { ...task, priorityScore };
    });
    
    // Filter by selected priority if needed
    if (selectedPriority !== 'all') {
      tasksToProcess = tasksToProcess.filter(task => task.priority === selectedPriority);
    }
    
    // Sort by priority score (high to low)
    tasksToProcess.sort((a, b) => b.priorityScore - a.priorityScore);
    
    setSortedTasks(tasksToProcess);
  }, [tasks, selectedPriority]);
  
  // Get priority distribution
  const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityCount = tasks.filter(t => t.priority === 'low').length;
  
  return (
    <div className="priority-dashboard">
      <Card
        title={
          <div className="flex items-center">
            <AlertOutlined className="text-[#9981FF] mr-2" />
            <span className="text-white">Priority Dashboard</span>
            <Tooltip title="How it works">
              <InfoCircleOutlined 
                className="ml-2 text-gray-400 cursor-pointer" 
                onClick={() => setShowInfo(!showInfo)}
              />
            </Tooltip>
          </div>
        }
        className="bg-[#1F1F2C] text-white border-0"
        headStyle={{ borderBottom: '1px solid #333' }}
      >
        {showInfo && (
          <Alert
            message="Smart Priority System"
            description="Tasks are automatically prioritized based on deadlines, difficulty, and impact on your grades. Higher priority tasks will be automatically scheduled first in your weekly plan."
            type="info"
            closable
            onClose={() => setShowInfo(false)}
            className="mb-4 bg-[#26262F] border-[#9981FF] text-gray-300"
          />
        )}
        
        <div className="mb-4 bg-[#26262F] p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white text-lg m-0">Your Priorities</h3>
            <div className="flex gap-2">
              <Tag 
                color={selectedPriority === 'all' ? '#9981FF' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('all')}
              >
                All ({tasks.length})
              </Tag>
              <Tag 
                color={selectedPriority === 'high' ? '#FF5252' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('high')}
              >
                High ({highPriorityCount})
              </Tag>
              <Tag 
                color={selectedPriority === 'medium' ? '#FFC107' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('medium')}
              >
                Medium ({mediumPriorityCount})
              </Tag>
              <Tag 
                color={selectedPriority === 'low' ? '#2196F3' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('low')}
              >
                Low ({lowPriorityCount})
              </Tag>
            </div>
          </div>
          <p className="text-gray-400 text-sm m-0">
            Tasks are automatically prioritized based on deadlines, difficulty, and impact on your grades.
          </p>
        </div>
        
        <div className="mt-4">
          {sortedTasks.map((task, index) => (
            <PriorityCard key={task.id} task={task} index={index} onSelect={onTaskSelect} />
          ))}
          
          {sortedTasks.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <AlertOutlined style={{ fontSize: 24 }} className="block mx-auto mb-3" />
              <p>No tasks matching the selected filter</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <div className="inline-flex items-center bg-[#26262F] text-gray-400 text-sm px-3 py-2 rounded-lg">
            <BookOutlined className="mr-2 text-[#9981FF]" />
            <span>Tasks with high priority scores will be automatically scheduled first</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PriorityDashboard;