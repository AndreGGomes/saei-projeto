// Aba "Visão Geral" do painel da coordenação: cartões de indicadores gerais.
export default function TabVisaoGeral({ tutorados, disciplinas, professores, matriculas }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel Geral de Indicadores</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-purple-500 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Meus Alunos Tutorados</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{tutorados.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-blue-500 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Disciplinas Cadastradas</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{disciplinas.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-indigo-500 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Professores Registrados</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{professores.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-green-500 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Matrículas Ativas</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{matriculas.length}</p>
        </div>
      </div>
    </div>
  );
}
