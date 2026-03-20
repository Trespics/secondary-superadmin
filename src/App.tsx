import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Overview from './pages/dashboard/Overview';
import SchoolList from './pages/schools/List';
import UserList from './pages/users/List';
import SubjectList from './pages/subjects/List';
import SubjectContent from './pages/subjects/SubjectContent';
import Profile from './pages/dashboard/Profile';
import ContactMessages from './pages/dashboard/ContactMessages';
import LibraryManagement from './pages/library/LibraryManagement';

import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Overview />} />
            <Route path="/schools" element={<SchoolList />} />
            <Route path="/subjects" element={<SubjectList />} />
            <Route path="/subjects/:id" element={<SubjectContent />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/contact-messages" element={<ContactMessages />} />
            <Route path="/library-management" element={<LibraryManagement />} />

            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
}

export default App;
