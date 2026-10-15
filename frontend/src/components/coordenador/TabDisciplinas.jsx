// Aba "Disciplinas": cadastro de disciplina + tabela com editar nome / excluir.
export default function TabDisciplinas({
  disciplinas,
  novaDisciplina,
  setNovaDisciplina,
  onAddDisciplina,
  onEditarDisciplina,
  onDeletarDisciplina,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestão de Disciplinas</h2>

      <form onSubmit={onAddDisciplina} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Cadastrar Nova Disciplina</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome da Disciplina (ex: Geografia Adaptada)"
            value={novaDisciplina.nome}
            onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Código Único (ex: GEO-01)"
            value={novaDisciplina.codigo}
            onChange={(e) => setNovaDisciplina({ ...novaDisciplina, codigo: e.target.value })}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
        >
          Salvar Disciplina no Banco
        </button>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Nome da Disciplina</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {disciplinas.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-6 text-center text-slate-400">
                  Nenhuma disciplina cadastrada.
                </td>
              </tr>
            ) : (
              disciplinas.map((disc, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{disc.codigo}</td>
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{disc.nome}</td>
                  <td className="p-4 text-center space-x-3">
                    <button
                      onClick={() => onEditarDisciplina(disc)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold"
                    >
                      Editar Nome
                    </button>
                    <button
                      onClick={() => onDeletarDisciplina(disc.codigo)}
                      className="text-red-500 dark:text-red-400 hover:underline text-xs font-semibold"
                    >
                      Excluir
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
