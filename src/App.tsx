import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { ProjectList } from './components/ProjectList';
import { ProjectEditor } from './components/ProjectEditor';

function AppContent() {
  const { user, loading } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (selectedProjectId) {
    return (
      <ProjectEditor
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return <ProjectList onSelectProject={setSelectedProjectId} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
