import { useEffect, useRef, useState } from 'react';
import { matchIntent, fallbackReply } from './knowledge';

// Renders a single knowledge "block" inside a chat bubble.
function Block({ block }) {
  if (block.type === 'p') {
    return <p className="chat-p">{block.text}</p>;
  }
  if (block.type === 'step') {
    return (
      <div className="chat-step">
        <span className="chat-step-num">{block.num}</span>
        <p>{block.text}</p>
      </div>
    );
  }
  if (block.type === 'steps') {
    return (
      <ol className="chat-steps">
        {block.items.map((item, i) => <li key={i}><span>{item}</span></li>)}
      </ol>
    );
  }
  if (block.type === 'features') {
    return (
      <div className="chat-features">
        {block.items.map((f, i) => (
          <div key={i} className="chat-feature">
            <span className="chat-f-icon">{f.icon}</span>
            <div><b>{f.label}</b><p>{f.text}</p></div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Floating, fully-functional assistant for the editor.
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(() => [{
    role: 'bot',
    blocks: [
      { type: 'p', text: 'Hi! 👋 I\'m the VidioCut helper. I can show you the steps to create a video and explain every feature on the site.' },
      { type: 'features', items: [
        { icon: '🎬', label: 'Make a video', text: 'I\'ll walk you through import → edit → export.' },
        { icon: '🧩', label: 'Feature package', text: 'Every tool this website offers, explained.' },
      ] },
    ],
    quick: ['How do I create a video?', 'What features does this site have?', 'Add music'],
  }]);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }); }, [messages, typing]);

  // Add a bot reply with a short typing delay for a natural feel.
  const push = async (reply, quick) => {
    setTyping(true);
    await new Promise((res) => setTimeout(res, 500 + Math.random() * 350));
    setTyping(false);
    setMessages((prev) => [...prev, { role: 'bot', blocks: reply, quick }]);
  };

  const send = async (text) => {
    const value = String(text || input || '').trim();
    if (!value || typing) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', blocks: [{ type: 'p', text: value }] }]);
    const intent = matchIntent(value);
    if (intent) await push(intent.reply, intent.quick);
    else {
      const fb = fallbackReply();
      await push(fb.reply, fb.quick);
    }
  };

  return (
    <>
      {open && (
        <aside className="chat-panel" role="dialog" aria-label="VidioCut assistant">
          <header className="chat-head">
            <div className="chat-avatar"><span>⌖</span></div>
            <div>
              <b>CutBot</b>
              <span className="chat-online">● Assistant</span>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} title="Close chat" aria-label="Close chat">✕</button>
          </header>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'bot' ? 'chat-bubble bot' : 'chat-bubble user'}>
                {m.blocks.map((b, bi) => <Block key={bi} block={b} />)}
                {m.role === 'bot' && m.quick?.length > 0 && (
                  <div className="chat-quick">
                    {m.quick.map((q, qi) => (
                      <button key={qi} type="button" onClick={() => send(q)}>{q}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="chat-bubble bot">
                <div className="chat-typing"><i /><i /><i /></div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={typing ? 'CutBot is typing…' : 'Ask about editing…'}
              disabled={typing}
              aria-label="Message"
            />
            <button type="submit" disabled={typing || !input.trim()} aria-label="Send">➤</button>
          </form>
        </aside>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        title="Chat with CutBot"
        aria-label="Toggle chat"
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}