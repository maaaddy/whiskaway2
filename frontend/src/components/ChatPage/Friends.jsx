function Friends({ user, selected, onClick }) {
    return (
      <div
        onClick={onClick}
        className={`p-4 cursor-pointer flex items-center gap-2 hover:bg-blue-50 ${selected ? 'bg-blue-100' : ''}`}
      >
        <div className="font-medium text-gray-800">{user.username}</div>
      </div>
    );
  }
  
  export default Friends;