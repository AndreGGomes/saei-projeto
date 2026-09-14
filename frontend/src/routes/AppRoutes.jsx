import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import DashboardCoordenador from '../pages/DashboardCoordenador';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redireciona a raiz para /login */}
      <Route path="/" element={<Navigate to="/login" />} />
      
      {/* Rotas principais da Sprint 1 */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/coordenador/dashboard" element={<DashboardCoordenador />} />

      {/* Rota genérica para links inexistentes */}
      <Route path="*" element={<h1 className="p-8 text-2xl font-bold">404 - Página não encontrada</h1>} />
    </Routes>
  );
}