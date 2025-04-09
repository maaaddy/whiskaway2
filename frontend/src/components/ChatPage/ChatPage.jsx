import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Friends from "./Friends";

function ChatPage({ closeChat, initialUserId }) {
  const [userInfoId, setUserInfoId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const profileRes = await axios.get('/api/profile');
        const fetchedUserInfoId = profileRes.data.userInfo;
        setUserInfoId(fetchedUserInfoId);
        const friendsRes = await axios.get(`/api/friends/${fetchedUserInfoId}`);
        setFriends(friendsRes.data);
      } catch (err) {
        console.error("Failed to load friends:", err);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (initialUserId && friends.length > 0) {
      const friend = friends.find(f => f._id === initialUserId);
      if (friend) {
        setSelectedUser(friend);
        const link = sessionStorage.getItem('sendRecipeLink');
        if (link) {
          setNewMessage(link);
        }
      }
    }
  }, [initialUserId, friends]);
  

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const otherUserInfoId = selectedUser.userInfo || selectedUser._id;
          const res = await axios.get(`/api/messages/${otherUserInfoId}`);
          setMessages(res.data);
        } catch (err) {
          console.error("Failed to load messages:", err);
        }
      }
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const otherUserInfoId = selectedUser.userInfo || selectedUser._id;

    try {
      const res = await axios.post('/api/messages', {
        recipient: otherUserInfoId,
        text: newMessage,
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-1/4 h-2/3 bg-white rounded-xl shadow-lg flex overflow-hidden border">
      <div className="w-1/3 bg-white border-r">
        <div className="text-lg font-bold p-3 border-b flex justify-between items-center">
          <span>Messages</span>
          <button className="text-sm text-red-400" onClick={closeChat}>X</button>
        </div>
        <div className="overflow-y-auto h-full">
          {friends.map(user => (
            <Friends
              key={user._id}
              user={user}
              selected={selectedUser?._id === user._id}
              onClick={() => setSelectedUser(user)}
            />
          ))}
          {friends.length === 0 && (
            <p className="text-sm text-gray-500 px-4">No friends found. Add some first!</p>
          )}
        </div>
      </div>
  
      <div className="w-2/3 bg-gray-50 flex flex-col h-full">
        {selectedUser ? (
          <>
            <div className="p-3 border-b text-sm font-semibold bg-white shadow-sm flex-none">
              Chat with {selectedUser.fName || 'User'}
            </div>

            <div className="flex-grow overflow-y-auto p-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400">No messages yet</div>
              )}
              {messages.map(msg => {
                const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                const isOwnMessage = senderId === userInfoId;

                const time = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div>
                  <div
                    key={msg._id}
                    className={`flex my-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-2 rounded-md text-sm max-w-xs ${
                        isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div>{msg.text}</div>
                      <div className="text-xs mt-1 text-right text-gray-400">{time}</div>
                    </div>
                  </div>
                  </div>
                );
              })}
              <div ref={scrollRef}></div>
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white flex-none">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message"
              />
              <button className="bg-blue-500 text-white px-4 rounded">Send</button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4">
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;