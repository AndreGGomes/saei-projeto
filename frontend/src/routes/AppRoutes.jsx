import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import DashboardCoordenador from '../pages/DashboardCoordenador';
import DashboardProfessor from '../pages/DashboardProfessor';
import DashboardAluno from '../pages/DashboardAluno';
import EmptyState from '../ui/EmptyState';
import { classeBotao } from '../ui/buttonStyles';
import { IconeLivro } from '../ui/icons';

function PaginaNaoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <EmptyState
          icone={<IconeLivro className="h-6 w-6" />}
          titulo="Página não encontrada"
          descricao="O endereço acessado não existe ou foi movido."
          acao={
            <Link to="/login" className={classeBotao({ variante: 'primario', tamanho: 'md' })}>
              Voltar ao início
            </Link>
          }
        />
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Painéis dedicados por papel */}
      <Route path="/coordenador/dashboard" element={<DashboardCoordenador />} />
      <Route path="/professor/dashboard" element={<DashboardProfessor />} />
      <Route path="/aluno/dashboard" element={<DashboardAluno />} />

      <Route path="*" element={<PaginaNaoEncontrada />} />
    </Routes>
  );
}
