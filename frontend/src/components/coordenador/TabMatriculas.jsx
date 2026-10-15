// Aba "Matrículas & Documentos": cadastro de matrícula + tabela de vínculos com ações.
export default function TabMatriculas({
  matriculas,
  professores,
  disciplinas,
  novaMatricula,
  setNovaMatricula,
  onAddMatricula,
  onVerDocumentos,
  onMudarProfessor,
  onDeletarMatricula,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Matrículas e Vínculos Escolares</h2>

      <form onSubmit={onAddMatricula} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nova Matrícula</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Matrícula do Aluno</label>
            <input
              type="text"
              placeholder="Ex: 20260101"
              value={novaMatricula.aluno_matricula}
              onChange={(e) => setNovaMatricula({ ...novaMatricula, aluno_matricula: e.target.value })}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Professor Responsável</label>
            <select
              value={novaMatricula.professor_email}
              onChange={(e) => setNovaMatricula({ ...novaMatricula, professor_email: e.target.value })}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
              required
            >
              <option value="">Selecione o professor</option>
              {professores.map((p, idx) => (
                <option key={idx} value={p.email}>
                  {p.nome} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Disciplina</label>
            <select
              value={novaMatricula.disciplina_codigo}
              onChange={(e) => setNovaMatricula({ ...novaMatricula, disciplina_codigo: e.target.value })}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
              required
            >
              <option value="">Selecione a disciplina</option>
              {disciplinas.map((d, idx) => (
                <option key={idx} value={d.codigo}>
                  {d.codigo} — {d.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-600 dark:bg-green-500 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
        >
          Efetivar Matrícula no Banco
        </button>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="p-4">Aluno</th>
              <th className="p-4">Disciplina</th>
              <th className="p-4">Professor Responsável</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {matriculas.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-400">
                  Nenhuma matrícula registrada.
                </td>
              </tr>
            ) : (
              matriculas.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 dark:text-white">{m.aluno.nome}</p>
                    <p className="text-xs text-slate-400 font-mono">Matrícula: {m.aluno.matricula}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-bold mr-2">
                      {m.disciplina.codigo}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{m.disciplina.nome}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800 dark:text-white">{m.professor.nome}</p>
                    <p className="text-xs text-slate-400">{m.professor.email}</p>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    {/* BOTÃO PARA VISUALIZAR DOCUMENTOS / LAUDOS */}
                    <button
                      onClick={() => onVerDocumentos(m)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm inline-flex items-center gap-1"
                      title="Ver laudos, atividades e planos de aula desta matrícula"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span>Anexos</span>
                    </button>

                    <button
                      onClick={() => onMudarProfessor(m)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold"
                    >
                      Mudar Professor
                    </button>
                    <button
                      onClick={() => onDeletarMatricula(m.id)}
                      className="text-red-500 dark:text-red-400 hover:underline text-xs font-semibold"
                    >
                      Cancelar
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
