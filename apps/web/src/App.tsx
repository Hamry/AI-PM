import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { TodoList } from './components/TodoList';
import { useGreeting } from './hooks/useGreeting';
import './App.css';

function App() {
  const { user, signOut } = useAuthenticator();
  const { greeting, fetchGreeting } = useGreeting();

  useEffect(() => {
    const email = user?.signInDetails?.loginId;
    const name = email ? email.split('@')[0] : undefined;
    fetchGreeting(name).catch(() => {
      // Lambda may not be deployed yet - ignore errors
    });
  }, [user, fetchGreeting]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        <div className="user-info">
          <span>{user?.signInDetails?.loginId}</span>
          <button onClick={signOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </header>

      {greeting && <div className="greeting-banner">{greeting}</div>}

      <main>
        <TodoList />
      </main>
    </div>
  );
}

export default App;
