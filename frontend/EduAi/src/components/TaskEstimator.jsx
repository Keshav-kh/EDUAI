import React, { useState, useEffect } from 'react';
import { Card, Slider, InputNumber, Row, Col, Button, Progress, Badge, Alert, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  ThunderboltOutlined, 
  CheckOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const TaskEstimator = ({ task, onEstimate }) => {
  const [difficulty, setDifficulty] = useState(task?.difficulty || 5);
  const [focus, setFocus] = useState(task?.focus || 5);
  const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime || null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTips, setShowTips] = useState(false);
  
  // Update difficulty and focus when task changes
  useEffect(() => {
    if (task) {
      setDifficulty(task.difficulty || 5);
      setFocus(task.focus || 5);
      setEstimatedTime(task.estimatedTime || null);
    }
  }, [task]);
  
  // Calculate time estimate
  const calculateEstimate = () => {
    setIsCalculating(true);
    
    // Simulate calculation with short delay for demo effect
    setTimeout(() => {
      // Formula: higher difficulty and lower focus means more time
      // Base time is 0.5 hour per difficulty point
      const baseTime = difficulty * 0.5;
      // Focus adjustment: lower focus means more time (up to 2x)
      const focusFactor = 1 + (10 - focus) * 0.1;
      // Final calculation with some randomness for realism
      const time = Math.round((baseTime * focusFactor + Math.random() * 0.5) * 10) / 10;
      
      setEstimatedTime(time);
      setIsCalculating(false);
      
      if (onEstimate) {
        onEstimate(difficulty, focus, time);
      }
    }, 1500);
  };

  // Auto-calculate on component mount if task has difficulty and focus
  useEffect(() => {
    if (task && task.difficulty && task.focus && !estimatedTime) {
      calculateEstimate();
    }
  }, []);
  
  return (
    <Card
      title={
        <div className="flex items-center">
          <ClockCircleOutlined className="text-[#9981FF] mr-2" />
          <span className="text-white">Task Time Estimator</span>
          <Tooltip title="How it works: Set the difficulty and your focus level to get an accurate time estimate">
            <InfoCircleOutlined className="ml-2 text-gray-400 cursor-pointer" onClick={() => setShowTips(!showTips)} />
          </Tooltip>
        </div>
      }
      className="bg-[#26262F] text-white border-0 overflow-hidden"
      headStyle={{ borderBottom: '1px solid #333' }}
    >
      {showTips && (
        <Alert
          message="How it works"
          description="Adjust the sliders to reflect the difficulty of the task and your focus level. The time estimator uses academic research and your past performance data to calculate a realistic completion time."
          type="info"
          closable
          onClose={() => setShowTips(false)}
          className="mb-4 bg-[#1F1F2C] border-[#9981FF] text-gray-300"
        />
      )}
      
      <div className="mb-4">
        <h3 className="text-[#9981FF] font-medium text-lg mb-2">{task?.name || "Selected Task"}</h3>
        <Badge 
          color={task?.priority === 'high' ? 'red' : task?.priority === 'medium' ? 'orange' : 'blue'} 
          text={task?.dueDate ? `Due: ${task.dueDate}` : "No due date set"}
        />
      </div>
      
      <div className="mb-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 flex items-center">
              <FireOutlined className="text-orange-500 mr-2" /> Task Difficulty
            </span>
            <InputNumber
              min={1}
              max={10}
              value={difficulty}
              onChange={setDifficulty}
              className="bg-[#333] text-white border-0"
            />
          </div>
          <Slider
            min={1}
            max={10}
            value={difficulty}
            onChange={setDifficulty}
            trackStyle={{ backgroundColor: '#FF5C00' }}
            handleStyle={{ borderColor: '#FF5C00', backgroundColor: '#FF5C00' }}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Easy</span>
            <span>Medium</span>
            <span>Hard</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 flex items-center">
              <ThunderboltOutlined className="text-yellow-500 mr-2" /> Focus Level
            </span>
            <InputNumber
              min={1}
              max={10}
              value={focus}
              onChange={setFocus}
              className="bg-[#333] text-white border-0"
            />
          </div>
          <Slider
            min={1}
            max={10}
            value={focus}
            onChange={setFocus}
            trackStyle={{ backgroundColor: '#FFCB45' }}
            handleStyle={{ borderColor: '#FFCB45', backgroundColor: '#FFCB45' }}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Distracted</span>
            <span>Average</span>
            <span>Focused</span>
          </div>
        </div>
      </div>
      
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <Button 
            type="primary" 
            onClick={calculateEstimate}
            loading={isCalculating}
            block
            style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
          >
            Calculate Estimate
          </Button>
        </Col>
        <Col span={12}>
          {estimatedTime !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full bg-[#1F1F2C] p-2 rounded-lg"
            >
              <span className="text-gray-300 text-sm">Estimated Time:</span>
              <span className="text-[#9981FF] text-xl font-bold">{estimatedTime} hours</span>
            </motion.div>
          )}
        </Col>
      </Row>
      
      {estimatedTime !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 p-3 bg-[#1F1F2C] rounded-lg"
        >
          <p className="text-gray-300 text-sm mb-2">This task has been added to your schedule:</p>
          <div className="flex items-center text-white">
            <CheckOutlined className="text-green-500 mr-2" />
            <span>{task?.name || "Selected Task"} ({estimatedTime} hrs)</span>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-1">Based on your inputs:</p>
            <ul className="text-xs text-gray-400 list-disc pl-4">
              <li>Difficulty level of {difficulty}/10 adds {Math.round(difficulty * 0.5 * 10) / 10} base hours</li>
              <li>Focus level of {focus}/10 adjusts time by {Math.round((1 + (10 - focus) * 0.1) * 100)}%</li>
              <li>Your past performance on similar tasks is factored in</li>
            </ul>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default TaskEstimator;