import { useState } from 'react';
import DashboardTab from './DashboardTab';
import UsersTab from './UsersTab';
import PagesTab from './PagesTab';
import PostsTab from './PostsTab';
import LoginsTab from './LoginsTab';
import MessagesTab from './MessagesTab';
import Logo from '../Logo';

const TABS = [
  ['dashboard', 'Dashboard'],
  ['users', 'Users'],
  ['pages', 'Pages'],
  ['blog', 'Blog'],
  ['logins', 'Logins'],
  ['questions', 'Questions'],
];

// Admin dashboard shell: renders the tab navigation and the active tab. Each
// tab lives in its own component and loads the data it needs from the API.
export default function AdminPanel({ user, onViewSite, onOpenEditor, onBack, canGoBack }) {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="brand"><Logo />VidioCut Admin</div>
        <nav className="admin-tabs">
          {TABS.map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
          ))}
        </nav>
        <button className="admin-btn mini" onClick={onBack || onViewSite}>{canGoBack ? '← Back' : '← Site'}</button>
        <button className="admin-btn mini" onClick={onOpenEditor}>✏ Editor</button>
      </header>
      <main>
        {tab === 'dashboard' && <DashboardTab user={user} />}
        {tab === 'users' && <UsersTab user={user} />}
        {tab === 'pages' && <PagesTab user={user} />}
        {tab === 'blog' && <PostsTab user={user} />}
        {tab === 'logins' && <LoginsTab user={user} />}
        {tab === 'questions' && <MessagesTab user={user} />}
      </main>
    </div>
  );
}