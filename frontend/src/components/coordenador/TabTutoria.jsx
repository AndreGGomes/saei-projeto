// Aba "Tutoria Inclusiva": formulário para assumir tutoria + tabela de tutorados.
export default function TabTutoria({ tutorados, matriculaTutorar, setMatriculaTutorar, onVincularTutor }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        Tutoria e Acompanhamento Pedagógico Individual
      </h2>

      <form
        onSubmit={onVincularTutor}
        className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800"
      >
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          Assumir Tutoria de Aluno
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Digite a matrícula do estudante com necessidades educacionais para vinculá-lo ao seu acompanhamento direto.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <input
            type="text"
            placeholder="Matrícula do Estudante (ex: 20260101)"
            value={matriculaTutorar}
            onChange={(e) => setMatriculaTutorar(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm flex-1 text-slate-800 dark:text-white focus:outline-purple-500"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow"
          >
            Assumir Tutoria
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="p-4">Matrícula</th>
              <th className="p-4">Nome do Aluno Tutorado</th>
              <th className="p-4 text-center">Status de Acompanhamento</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {tutorados.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-6 text-center text-slate-400">
                  Você ainda não assumiu a tutoria de nenhum aluno.
                </td>
              </tr>
            ) : (
              tutorados.map((aluno, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                    {aluno.matricula}
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-white">
                    {aluno.nome}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                      Em Tutoria Ativa
                    </span>
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
