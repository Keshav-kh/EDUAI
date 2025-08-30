import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Tag, Badge, Tooltip, Divider, Alert, Input, Empty } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  MessageOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const PeerCard = ({ peer, index, onConnect, connected }) => {
  const [isHovered, setIsHovered] = useState(false);

  const matchPercentage = peer.matchScore || Math.floor(Math.random() * 30) + 70; // 70-99% match
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`bg-[#26262F] text-white border-0 mb-3 hover:shadow-lg transition-all ${
          isHovered ? 'transform scale-[1.02]' : ''
        }`}
        bodyStyle={{ padding: '16px' }}
      >
        <motion.div 
          className="absolute top-2 right-2 text-xs font-semibold"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Tag color="#9981FF">{matchPercentage}% Match</Tag>
        </motion.div>
        
        <div className="flex">
          <Avatar 
            src={peer.avatar} 
            size={64}
            className="mr-4"
          />
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white text-lg font-medium m-0">{peer.name}</h4>
                <p className="text-gray-400 text-sm">
                  <BookOutlined className="mr-1" /> {peer.course}
                </p>
              </div>
              
              <Badge 
                color="green" 
                text={
                  <span className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Online Now
                  </span>
                } 
              />
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {peer.topics && peer.topics.map((topic, i) => (
                <Tag key={i} color="#9981FF">{topic}</Tag>
              ))}
              {!peer.topics && (
                <Tag color="#9981FF">{peer.course.split(' ')[0]}</Tag>
              )}
            </div>
            
            <div className="mt-3 flex justify-between">
              <Tooltip title="Start chat">
                <Button 
                  icon={<MessageOutlined />} 
                  type="text"
                  className="text-[#9981FF] hover:text-white"
                />
              </Tooltip>
              
              <Button
                type={connected ? "default" : "primary"}
                onClick={() => onConnect(peer)}
                style={connected ? 
                  { backgroundColor: '#333', borderColor: '#555' } : 
                  { backgroundColor: '#9981FF', borderColor: '#9981FF' }
                }
                icon={connected ? <CheckCircleOutlined /> : null}
              >
                {connected ? "Connected" : "Connect"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const StudyGroupCard = ({ group }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={isHovered ? 'transform scale-[1.02]' : ''}
    >
      <Card 
        className="bg-[#26262F] text-white border-0 mb-3 hover:shadow-lg transition-all"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-white text-lg font-medium m-0">{group.name}</h4>
          <Tag color={group.active ? "green" : "blue"}>
            {group.active ? "Active Now" : "Scheduled"}
          </Tag>
        </div>
        
        <p className="text-gray-400 text-sm mb-3">{group.description}</p>
        
        <div className="flex items-center mb-3 text-sm">
          <ClockCircleOutlined className="mr-1 text-[#9981FF]" />
          <span className="text-gray-300 mr-2">Next session:</span>
          <span className="text-white">{group.nextSession}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {group.topics.map((topic, i) => (
            <Tag key={i} color="#3F3D56">{topic}</Tag>
          ))}
        </div>
        
        <Divider className="bg-gray-700 my-3" />
        
        <div className="flex justify-between items-center">
          <Avatar.Group maxCount={3}>
            {group.members.map((member, i) => (
              <Tooltip key={i} title={member.name}>
                <Avatar src={member.avatar} />
              </Tooltip>
            ))}
          </Avatar.Group>
          
          <div>
            <Button 
              type="primary"
              icon={<TeamOutlined />}
              style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
            >
              {group.active ? "Join Now" : "Join Group"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const StudyPeers = ({ peers, recommendedGroups }) => {
  const [activeTab, setActiveTab] = useState('peers');
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [justMatched, setJustMatched] = useState(null);
  
  // Generate unique course list from peers
  const courses = ['All', ...new Set(peers.map(peer => peer.course.split(' ')[0]))];
  
  // Filter peers based on search and course filter
  const filteredPeers = peers.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          peer.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (peer.topics && peer.topics.some(topic => 
                            topic.toLowerCase().includes(searchQuery.toLowerCase())
                          ));
    
    const matchesCourse = selectedCourse === 'All' || 
                          peer.course.startsWith(selectedCourse);
    
    return matchesSearch && matchesCourse;
  });
  
  const handleConnect = (peer) => {
    if (connectedPeers.includes(peer.id)) {
      setConnectedPeers(connectedPeers.filter(id => id !== peer.id));
    } else {
      setConnectedPeers([...connectedPeers, peer.id]);
      
      // Show match animation
      setJustMatched(peer);
      setShowMatchAnimation(true);
      setTimeout(() => setShowMatchAnimation(false), 3000);
    }
  };
  
  return (
    <div className="study-peers">
      <Card
        title={
          <div className="flex items-center">
            <TeamOutlined className="text-[#9981FF] mr-2" />
            <span className="text-white">Study Connections</span>
          </div>
        }
        className="bg-[#1F1F2C] text-white border-0"
        headStyle={{ borderBottom: '1px solid #333' }}
      >
        <div className="flex mb-4 bg-[#26262F] p-1 rounded-lg">
          <Button 
            type={activeTab === 'peers' ? "primary" : "text"} 
            onClick={() => setActiveTab('peers')}
            block
            style={activeTab === 'peers' ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : { color: 'white' }}
          >
            Peer Matches
          </Button>
          <Button 
            type={activeTab === 'groups' ? "primary" : "text"} 
            onClick={() => setActiveTab('groups')}
            block
            style={activeTab === 'groups' ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : { color: 'white' }}
          >
            Study Groups
          </Button>
        </div>
        
        {/* Match Animation Overlay */}
        <AnimatePresence>
          {showMatchAnimation && justMatched && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMatchAnimation(false)}
            >
              <motion.div 
                className="bg-[#1F1F2C] p-6 rounded-xl text-center max-w-md"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-center mb-4">
                  <Avatar src={justMatched.avatar} size={80} className="border-4 border-[#9981FF]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">New Connection!</h2>
                <p className="text-lg text-gray-300 mb-4">
                  You've matched with <span className="text-[#9981FF] font-semibold">{justMatched.name}</span>
                </p>
                <p className="text-sm text-gray-400 mb-4">
                Both of you are working on <Tag color="#9981FF">{justMatched.course}</Tag>
                </p>
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />}
                  size="large"
                  style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
                >
                  Start Chatting
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {activeTab === 'peers' && (
          <div className="peers-tab">
            <div className="bg-[#26262F] p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white m-0">Students Working On Similar Tasks</h3>
                <Tag color="#9981FF">
                  <ClockCircleOutlined className="mr-1" /> Live Now
                </Tag>
              </div>
              <p className="text-gray-400 text-sm m-0">
                These students are currently working on similar courses or assignments. Connect to form study groups or share notes.
              </p>
            </div>
            
            <div className="mb-4 flex gap-2">
              <Input 
                placeholder="Search peers or topics..." 
                prefix={<SearchOutlined />} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#333] border-0 text-white"
              />
              
              <div className="flex-shrink-0">
                <Tooltip title="Filter by course">
                  <Button 
                    icon={<FilterOutlined />} 
                    className={selectedCourse !== 'All' ? 'bg-[#9981FF] text-white' : 'bg-[#333] text-white'}
                  >
                    {selectedCourse}
                  </Button>
                </Tooltip>
                <div className="absolute mt-1 bg-[#333] rounded-md shadow-lg z-10 hidden group-hover:block">
                  {courses.map(course => (
                    <div 
                      key={course}
                      className="px-4 py-2 hover:bg-[#444] cursor-pointer text-white"
                      onClick={() => setSelectedCourse(course)}
                    >
                      {course}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              {filteredPeers.map((peer, index) => (
                <PeerCard 
                  key={peer.id} 
                  peer={peer} 
                  index={index} 
                  onConnect={handleConnect} 
                  connected={connectedPeers.includes(peer.id)}
                />
              ))}
              
              {filteredPeers.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-400">
                      {searchQuery ? "No peers matching your search" : "No peers currently online matching your courses"}
                    </span>
                  }
                  className="my-8"
                />
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'groups' && (
          <div className="groups-tab">
            <div className="bg-[#26262F] p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white m-0">Recommended Study Groups</h3>
                <Tag color="#9981FF">
                  <CalendarOutlined className="mr-1" /> Scheduled Sessions
                </Tag>
              </div>
              <p className="text-gray-400 text-sm m-0">
                Join these study groups to collaborate on assignments, prepare for exams, and boost your learning.
              </p>
            </div>
            
            <div>
              {recommendedGroups.map((group) => (
                <StudyGroupCard key={group.id} group={group} />
              ))}
              
              {recommendedGroups.length === 0 && (
                <div className="text-center text-gray-400 py-6">
                  <TeamOutlined style={{ fontSize: 36 }} className="block mx-auto mb-3" />
                  <p>No study groups available for your courses</p>
                </div>
              )}
            </div>
            
            <div className="text-center mt-4">
              <Button 
                type="primary" 
                icon={<TeamOutlined />}
                style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
              >
                Create New Study Group
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Sample data for study groups
StudyPeers.defaultProps = {
  peers: [],
  recommendedGroups: [
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
        { name: "Maya Johnson", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2" }
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
        { name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=6" }
      ]
    }
  ]
};

export default StudyPeers;