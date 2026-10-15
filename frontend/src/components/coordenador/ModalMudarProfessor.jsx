// Modal de troca do professor responsável por uma matrícula (coordenação).
export default function ModalMudarProfessor({ matricula, professores, novoEmail, setNovoEmail, onSubmit, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Alterar Professor Responsável</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Aluno: <strong>{matricula.aluno.nome}</strong> ({matricula.disciplina.codigo})
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Novo Professor</label>
            <select
              required
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-blue-500"
            >
              <option value="">Selecione</option>
              {professores.map((p, idx) => (
                <option key={idx} value={p.email}>
                  {p.nome} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancelar}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
