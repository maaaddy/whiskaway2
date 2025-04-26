import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faMinus, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Friends from "./Friends";

const SkeletonFriend = ({ delay = 0 }) => (
  <div className="p-3 border-x-4 border-white cursor-default animate-pulse" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-1 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/5"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const SkeletonMessage = ({ alignment = 'left', delay = 0 }) => (
  <div className={`flex my-2 ${alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
    <div
      className="p-2 rounded-md max-w-xs bg-gray-200 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-4 w-28 mb-2 bg-gray-300 rounded"></div>
      <div className="h-3 w-16 bg-gray-300 rounded"></div>
    </div>
  </div>
);

function ChatPage({ closeChat, initialUserId }) {
  const [userInfoId, setUserInfoId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const scrollRef = useRef(null);
  const chatRef = useRef(null);

  const messagedFriends = friends.filter(f => f.latestMessage);
  const unmessagedFriends = friends.filter(f => !f.latestMessage);

  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const profileRes = await axios.get('/api/profile');
      const fetchedUserInfoId = profileRes.data.userInfo;
      setUserInfoId(fetchedUserInfoId);
      const friendsRes = await axios.get(`/api/friends/${fetchedUserInfoId}`);
      setFriends(friendsRes.data);
    } catch (err) {
      console.error("Failed to load friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (initialUserId && friends.length > 0) {
      const friend = friends.find(f => f._id === initialUserId);
      if (friend) {
        setSelectedUser(friend);
        const link = sessionStorage.getItem('sendRecipeLink');
        if (link) setNewMessage(link);
      }
    }
  }, [initialUserId, friends]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      setLoadingMessages(true);
      try {
        const otherUserInfoId = selectedUser.userInfo || selectedUser._id;
        const res = await axios.get(`/api/messages/${otherUserInfoId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingMessages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setSelectedUser(null);
        closeChat();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const recipient = selectedUser.userInfo || selectedUser._id;
      const res = await axios.post('/api/messages', { recipient, text: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      await fetchFriends();
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
    }
  };

  const filteredFriends = (showNewMessage ? unmessagedFriends : messagedFriends)
    .filter(u => u.username.toLowerCase().startsWith(search.toLowerCase()))
    .sort((a,b) => {
      const aT = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt) : 0;
      const bT = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt) : 0;
      return bT - aT;
    });

  return (
    <div
      ref={chatRef}
      className="fixed bottom-4 right-4 z-50 w-80 h-[60vh] bg-white rounded-lg shadow-md overflow-hidden border flex flex-col"
    >
      {!selectedUser ? (
        <>
          <div className="pt-3 px-4 flex items-center justify-between">
            {showNewMessage ? (
              <>
                <button onClick={() => setShowNewMessage(false)} className="text-blue-500">
                  <FontAwesomeIcon icon={faAngleLeft} size="lg" />
                </button>
                <span className="font-semibold">New Message</span>
                <button onClick={closeChat} className="text-gray-500">
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              </>
            ) : (
              <>
                <span className="font-semibold">Messages</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowNewMessage(true)} className="text-teal-600">
                    <FontAwesomeIcon icon={faPenToSquare} size="md" />
                  </button>
                  <button onClick={closeChat} className="text-gray-500">
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="px-3 py-2">
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full p-1 pl-3 text-sm rounded-2xl bg-gray-50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingFriends
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonFriend key={i} delay={i*100} />)
              : filteredFriends.map(user => (
                  <div
                    key={user._id}
                    onClick={() => { setSelectedUser(user); setShowNewMessage(false); }}
                    className="p-3 cursor-pointer hover:bg-gray-50 hover:rounded-xl border-x-4 border-white"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.profilePic || '/user.png'}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.username}</span>
                        <span className="text-xs text-gray-400 truncate w-40">
                          {user.latestMessage?.text || 'Start a chat!'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
          <div className="p-3 border-t text-center">
            <a href="/profile" className="text-xs text-gray-400 hover:underline"></a>
          </div>
        </>
      ) : (
        <>
          <div className="p-3 border-b bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => {
                setSelectedUser(null);
                fetchFriends();
              }}>
                <FontAwesomeIcon icon={faAngleLeft} size="lg" className="text-teal-600" />
              </button>
              <img
                src={selectedUser.profilePic || '/user.png'}
                alt={selectedUser.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-sm">
                {selectedUser.fName ? `${selectedUser.fName} ${selectedUser.lName}` : selectedUser.username}
              </span>
            </div>
            <button onClick={closeChat} className="text-gray-500">
              <FontAwesomeIcon icon={faMinus} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-3">
            {loadingMessages
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonMessage key={i} alignment={i % 2 === 0 ? 'left' : 'right'} delay={i * 100} />
                ))
              : messages.length === 0
                ? <div className="text-center text-gray-400">No messages yet</div>
                : messages.map(msg => {
                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                    const isOwn = senderId === userInfoId;
                    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg._id} className={`flex my-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`py-2 pl-3 pr-3 rounded-3xl text-sm max-w-xs ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          <div>{msg.text}</div>
                          <div className={`text-xs mt-1 ${isOwn ? 'text-slate-300' : 'text-gray-400'}`}>{time}</div>
                        </div>
                      </div>
                    );
                  })
            }
            <div ref={scrollRef}></div>
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white">
            <input
              type="text"
              className="flex-1 p-1 pl-4 border rounded-3xl"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message"
            />
            <button className="bg-blue-500 text-white text-xs px-4 rounded-full">Send</button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatPage;