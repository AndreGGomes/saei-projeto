// Aba "Meus Alunos & Disciplinas": tabela das matrículas sob docência do professor.
export default function TabAlunos({ matriculas, onVerDocumentos }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Alunos e Disciplinas Vinculadas</h2>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="p-4">Estudante</th>
              <th className="p-4">Matrícula</th>
              <th className="p-4">Disciplina</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {matriculas.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-400">
                  Nenhum aluno vinculado às suas disciplinas no momento.
                </td>
              </tr>
            ) : (
              matriculas.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-bold text-slate-800 dark:text-white">{m.aluno.nome}</td>
                  <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{m.aluno.matricula}</td>
                  <td className="p-4">
                    <span className="font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-bold mr-2">
                      {m.disciplina.codigo}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{m.disciplina.nome}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onVerDocumentos(m)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      Ver Laudos e Arquivos
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
