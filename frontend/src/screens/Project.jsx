import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../context/user.context';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState('');
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage('project-message', (data) => {
      appendIncomingMessage(data);
    });

    axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project);
    });

    axios.get('/users/all').then((res) => {
      setUsers(res.data.users);
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  const scrollToBottom = () => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  };

  const appendIncomingMessage = (msgObj) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md';
    messageElement.innerHTML = `
      <small class='opacity-65 text-xs'>${msgObj.sender.email}</small>
      <p class='text-sm'>${msgObj.message}</p>
    `;
    messageBox.current.appendChild(messageElement);
    scrollToBottom();
  };

  const appendOutgoingMessage = (msg) => {
    const newMessage = document.createElement('div');
    newMessage.className = 'ml-auto max-w-56 message flex flex-col p-2 bg-slate-50 w-fit rounded-md';
    newMessage.innerHTML = `
      <small class='opacity-65 text-xs'>${user.email}</small>
      <p class='text-sm'>${msg}</p>
    `;
    messageBox.current.appendChild(newMessage);
    scrollToBottom();
  };

  const send = () => {
    if (!message.trim()) return;
    sendMessage('project-message', {
      message,
      sender: user
    });
    appendOutgoingMessage(message);
    setMessage('');
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const addCollaborators = () => {
    axios.put('/projects/add-user', {
      projectId: project._id,
      users: Array.from(selectedUserId)
    }).then((res) => {
      setIsModalOpen(false);
      setProject(res.data.project); // Update project users
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <main className='h-screen w-screen flex'>
      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
        {/* Header */}
        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute top-0 z-10'>
          <button className='flex items-center gap-2' onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-line text-xl"></i>
            <p>Add collaborator</p>
          </button>
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
            <i className="ri-group-fill text-xl"></i>
          </button>
        </header>

        {/* Chat */}
        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
          </div>
          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='p-2 px-4 border-none outline-none flex-grow'
              type="text"
              placeholder='Enter message'
            />
            <button
              onClick={send}
              className='px-5 bg-slate-950 text-white'>
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 z-20`}>
          <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>
            <h1 className='font-semibold text-lg'>Collaborators</h1>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2 p-2 overflow-auto">
            {project.users?.map(user => (
              <div key={user._id} className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                  <i className="ri-user-fill"></i>
                </div>
                <h1 className='font-semibold text-lg'>{user.email}</h1>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className='p-2'>
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map(user => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${selectedUserId.has(user._id) ? 'bg-slate-200' : ''} p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                    <i className="ri-user-fill"></i>
                  </div>
                  <h1 className='font-semibold text-lg'>{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
