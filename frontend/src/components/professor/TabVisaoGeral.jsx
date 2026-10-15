// Aba "Visão Geral" do painel do professor: cartões de indicadores do docente.
export default function TabVisaoGeral({ matriculas, disciplinasUnicas }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel Geral do Docente</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-blue-500 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Alunos Matriculados</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{matriculas.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-emerald-500 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Disciplinas Ministradas</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{disciplinasUnicas.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border-l-4 border-purple-500 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Acompanhamento Inclusivo</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">Ativo</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-800 space-y-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Educação Inclusiva e Anexos</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Acesse a aba <strong>Documentos & Laudos Inclusivos</strong> para consultar laudos e materiais de cada estudante vinculado às suas turmas.
        </p>
      </div>
    </div>
  );
}
