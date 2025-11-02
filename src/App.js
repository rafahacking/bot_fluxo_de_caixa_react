import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import Login from './components/Login';
import { processFluxoCaixa } from './utils/dataProcessor';
import { useAuth } from './contexts/AuthContext';
import { LogOut } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    setScrolled(false);
  }, [data]);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleFilesUpload = async (files) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processFluxoCaixa(files);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao processar arquivos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="App">
      <header className={`app-header ${data ? 'compact' : ''}`}>
        <div className="header-content">
          <div className="header-logo-title">
            <img src="/logo.png" alt="Logo" className="header-logo" />
            <h1>Projeção de Fluxo de Caixa</h1>
          </div>
          {!data && <p className="header-subtitle">Bot de Cash Flow</p>}
        </div>
        <div className="header-user">
          <span className="user-name">Olá, {user?.name}</span>
          <button onClick={logout} className="logout-button" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="app-main">
        {!data ? (
          <FileUpload 
            onFilesUpload={handleFilesUpload} 
            loading={loading}
            error={error}
          />
        ) : (
          <Dashboard 
            data={data} 
            onReset={handleReset}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
