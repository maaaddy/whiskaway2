import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faMinus, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Friends from "./Friends";

function ChatPage({ closeChat, initialUserId }) {
  const [userInfoId, setUserInfoId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const scrollRef = useRef(null);
  const messagedFriends = friends.filter(f => f.latestMessage);
  const unmessagedFriends = friends.filter(f => !f.latestMessage);

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

  const filteredFriends = friends
  .filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt) : 0;
    const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt) : 0;
    return bTime - aTime;
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-[60vh] bg-white rounded-xl shadow-xl overflow-hidden border flex flex-col">
      {!selectedUser ? (
        <>
          <div className="pt-3 px-4 flex items-center justify-between">
            {showNewMessage ? (
              <>
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  <FontAwesomeIcon icon={faAngleLeft} size='lg' className="text-teal-600"/>
                </button>
                <span className="text-sm font-semibold">New Message</span>
                <button onClick={closeChat} className="text-gray-500">
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold">Messages</span>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} size="lg" className="text-teal-600"/>
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
              className="w-full p-1 pl-3 text-sm rounded-2xl bg-gray-50 outline-none border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {(showNewMessage ? unmessagedFriends : messagedFriends)
              .filter(user => user.username.toLowerCase().startsWith(search.toLowerCase()))
              .sort((a, b) => {
                const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt) : 0;
                const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt) : 0;
                return bTime - aTime;
              })
              .map(user => (
                <div
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowNewMessage(false);
                  }}
                  className="p-3 cursor-pointer hover:bg-gray-50 hover:rounded-xl border-x-4 border-white"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={user.profilePic || '/profilepic.jpg'}
                      alt={`${user.username}'s profile`}
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
          <div className="p-3 border-b bg-white shadow-sm shadow-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedUser(null)}
              >
                <FontAwesomeIcon icon={faAngleLeft} size='lg' className="text-teal-600"/>
              </button>
              <img
                src={selectedUser.profilePic || '/profilepic.jpg'}
                alt={`${selectedUser.username}'s profile`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-sm">
                {selectedUser.fName + ' ' + selectedUser.lName || selectedUser.username || 'User'}
              </span>
            </div>

            <button onClick={closeChat} className="text-gray-500">
              <FontAwesomeIcon icon={faMinus} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400">No messages yet</div>
            )}
            {messages.map(msg => {
              const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
              const isOwnMessage = senderId === userInfoId;
              const time = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit',
              });
              return (
                <div key={msg._id} className={`flex my-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2 rounded-md text-sm max-w-xs ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    <div>{msg.text}</div>
                    <div className="text-xs mt-1 text-right text-gray-400">{time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white">
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
      )}
    </div>
  );
}

export default ChatPage;