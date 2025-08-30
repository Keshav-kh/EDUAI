import React, { useState } from 'react';
import { Modal, Card, Tag, Progress, Divider, Button, Tooltip, Select, DatePicker } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  WarningOutlined, 
  CheckCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

const DeadlinesModal = ({ visible, onClose, tasks }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Calculate days remaining for a deadline
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get color based on days remaining
  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining <= 1) return "#ff4d4f";
    if (daysRemaining <= 3) return "#faad14";
    return "#52c41a";
  };
  
  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      if (filter === 'high') return task.priority === 'high';
      if (filter === 'due-soon') {
        const daysLeft = getDaysRemaining(task.dueDate);
        return daysLeft <= 3 && !task.completed;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'course') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  
  // Get icon based on priority
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <FireOutlined style={{ color: "#ff4d4f" }} />;
      case "medium":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    }
  };
    
  return (
    <Modal
      title={
        <div className="flex items-center">
          <CalendarOutlined className="text-[#9981FF] mr-2" />
          <span>Upcoming Deadlines</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <div className="mb-6 bg-[#26262F] p-4 rounded-lg">
        <h3 className="text-white text-lg mb-3">Manage Your Deadlines</h3>
        <p className="text-gray-400 mb-4">
          View and track all your upcoming deadlines. Sort and filter to focus on what matters most right now.
        </p>
        
        <div className="flex justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-gray-400 mr-2">Filter:</span>
              <Select 
                value={filter} 
                onChange={setFilter} 
                style={{ width: 130 }}
                className="bg-[#333]"
              >
                <Option value="all">All Tasks</Option>
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="high">High Priority</Option>
                <Option value="due-soon">Due Soon</Option>
              </Select>
            </div>
            
            <div>
              <span className="text-gray-400 mr-2">Sort by:</span>
              <Select 
                value={sortBy} 
                onChange={setSortBy} 
                style={{ width: 130 }}
                className="bg-[#333]"
              >
                <Option value="date">Due Date</Option>
                <Option value="priority">Priority</Option>
                <Option value="course">Course</Option>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              icon={<WarningOutlined />}
              className="bg-[#9981FF] text-white border-0"
            >
              Overdue Tasks
            </Button>
            <Button 
              icon={<FireOutlined />}
              className="bg-[#333] text-white border-0"
            >
              Today's Deadlines
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredTasks.map((task, index) => {
            const daysRemaining = getDaysRemaining(task.dueDate);
            const urgencyColor = getUrgencyColor(daysRemaining);
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className="bg-[#26262F] border-0 h-full"
                  bodyStyle={{ padding: '16px' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <motion.div
                        animate={daysRemaining <= 1 && !task.completed ? 
                          { scale: [1, 1.2, 1] } : 
                          { scale: 1 }
                        }
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      >
                        {getPriorityIcon(task.priority)}
                      </motion.div>
                      <h3 className="text-white ml-2 text-lg font-medium">{task.name}</h3>
                    </div>
                    
                    <Tag 
                      color={task.completed ? "green" : urgencyColor}
                      className="ml-2"
                    >
                      {task.completed ? 
                        "Completed" : 
                        daysRemaining <= 0 ? 
                          "Overdue!" : 
                          `${daysRemaining} days left`
                      }
                    </Tag>
                  </div>
                  
                  <Divider className="my-3 bg-gray-700" />
                  
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                    <div>
                      <div className="text-gray-400 mb-1">Due Date</div>
                      <div className="text-white">{task.dueDate}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Estimated Time</div>
                      <div className="text-white">{task.estimatedTime} hours</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Priority</div>
                      <div className="text-white capitalize">{task.priority}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Difficulty</div>
                      <div className="text-white">{task.difficulty}/10</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Completion</span>
                      <span className="text-gray-300">{task.completed ? "100%" : "0%"}</span>
                    </div>
                    <Progress 
                      percent={task.completed ? 100 : 0} 
                      status={task.completed ? "success" : "active"}
                      showInfo={false}
                      strokeColor={task.completed ? "#52c41a" : "#9981FF"}
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <Button 
                      size="small"
                      icon={<ClockCircleOutlined />}
                      className="bg-[#333] text-white border-0"
                    >
                      Reschedule
                    </Button>
                    <Button 
                      size="small"
                      icon={task.completed ? <FireOutlined /> : <CheckCircleOutlined />}
                      type="primary"
                      className={task.completed ? "bg-[#333]" : "bg-[#9981FF]"}
                    >
                      {task.completed ? "Reopen" : "Mark Complete"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-[#26262F] rounded-lg">
            <WarningOutlined style={{ fontSize: 48 }} className="text-gray-500 mb-4" />
            <h3 className="text-white text-lg mb-2">No matching deadlines found</h3>
            <p className="text-gray-400">Try changing your filter settings or adding new tasks.</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center bg-[#26262F] p-4 rounded-lg">
        <div className="flex justify-center items-center gap-6">
          <div>
            <h4 className="text-white mb-1">All Tasks</h4>
            <p className="text-2xl text-[#9981FF]">{tasks.length}</p>
          </div>
          <div>
            <h4 className="text-white mb-1">Completed</h4>
            <p className="text-2xl text-green-500">{tasks.filter(t => t.completed).length}</p>
          </div>
          <div>
            <h4 className="text-white mb-1">High Priority</h4>
            <p className="text-2xl text-red-500">{tasks.filter(t => t.priority === 'high').length}</p>
          </div>
          <div>
            <h4 className="text-white mb-1">Due This Week</h4>
            <p className="text-2xl text-yellow-500">
              {tasks.filter(t => !t.completed && getDaysRemaining(t.dueDate) <= 7).length}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeadlinesModal;