// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import { initSocket, getSocket } from './socket';
import axios from 'axios';

export default function App() {
  const [userId, setUserId] = useState('user1'); // demo value
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    initSocket(userId);
    const socket = getSocket();
    if (!socket) return;
    socket.on('private_message', (msg) => {
      setMessages((m) => [...m, msg]);
    });
    return () => {
      socket.off('private_message');
    };
  }, [userId]);

  async function sendMsg() {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('private_message', {
      toUserId: 'user2',
      fromUserId: userId,
      body: text
    });
    setMessages((m) => [...m, { fromUserId: userId, body: text, ts: Date.now() }]);
    setText('');
  }

  async function fetchMatches() {
    const resp = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/match/for-user`, {
      userId,
      topK: 5
    });
    setMatches(resp.data.matches || []);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>SwappNow - Demo</h1>
      <div>
        <label>
          User ID: <input value={userId} onChange={(e) => setUserId(e.target.value)} />
        </label>
        <button onClick={() => getSocket()?.emit('join', userId)}>Join</button>
      </div>

      <section style={{ marginTop: 12 }}>
        <h2>Messages</h2>
        <div style={{ border: '1px solid #ddd', padding: 12, minHeight: 100 }}>
          {messages.map((m, i) => (
            <div key={i}>
              <strong>{m.fromUserId}</strong>: {m.body}
            </div>
          ))}
        </div>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={sendMsg}>Send to user2</button>
      </section>

      <section style={{ marginTop: 12 }}>
        <h2>Matches</h2>
        <button onClick={fetchMatches}>Fetch Matches</button>
        <ul>
          {matches.map((mm, i) => (
            <li key={i}>{mm.name || mm._id}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}