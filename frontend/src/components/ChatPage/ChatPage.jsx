import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Friends from "./Friends";

function ChatPage() {
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
    <div className="flex h-screen pb-20">
      <div className="w-1/3 bg-white border-r pt-20">
        <h2 className="text-lg font-bold p-4">Messages</h2>
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

      <div className="w-2/3 p-4 bg-gray-50 flex flex-col">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto mb-2">
              {messages.length === 0 && (
                <div className="text-center text-gray-400">No messages yet</div>
              )}
              {messages.map(msg => {
                const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                const isOwnMessage = senderId === userInfoId;

                const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={msg._id}
                    className={`flex my-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-2 rounded-md text-sm max-w-xs ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      <div>{msg.text}</div>
                      <div className={"text-xs mt-1 ${isOwnMessage ? 'text-gray-400 text-right' : 'text-gray-500 text-left'}"}>{time}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef}></div>
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
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
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;