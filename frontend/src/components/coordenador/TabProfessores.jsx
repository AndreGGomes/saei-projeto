// Aba "Professores": listagem somente-leitura do corpo docente registrado.
export default function TabProfessores({ professores }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Corpo Docente Registrado</h2>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="p-4">Nome do Docente</th>
              <th className="p-4">E-mail Institucional</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {professores.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-6 text-center text-slate-400">
                  Nenhum professor registrado.
                </td>
              </tr>
            ) : (
              professores.map((prof, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-bold text-slate-800 dark:text-white">{prof.nome}</td>
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{prof.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
