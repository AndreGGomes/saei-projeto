import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import DashboardCoordenador from '../pages/DashboardCoordenador';
import DashboardProfessor from '../pages/DashboardProfessor';
import DashboardAluno from '../pages/DashboardAluno';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      {/* Painéis dedicados */}
      <Route path="/coordenador/dashboard" element={<DashboardCoordenador />} />
      <Route path="/professor/dashboard" element={<DashboardProfessor />} />
      <Route path="/aluno/dashboard" element={<DashboardAluno />} />

      <Route path="*" element={<h1 className="p-8 text-2xl font-bold">404 - Página não encontrada</h1>} />
    </Routes>
  );
}