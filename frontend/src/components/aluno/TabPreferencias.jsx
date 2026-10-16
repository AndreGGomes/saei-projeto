// Aba "Preferências de Aprendizagem" do aluno: um cartão por matrícula com um
// campo de texto livre para registrar como ele aprende melhor e o que precisa
// para participar de forma inclusiva. Salva via PATCH /matriculas/{id}/preferencias.
export default function TabPreferencias({ matriculas, preferencias, onEditar, onSalvar, salvandoId, salvoId }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Minhas Preferências de Aprendizagem
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
          Conte como você aprende melhor e o que precisa para participar das aulas — por exemplo:
          exemplos visuais, mais tempo para leitura, instruções passo a passo, trabalhar em dupla.
          O professor e a coordenação usam isso para adaptar as aulas à sua inclusão.
        </p>
      </div>

      <div className="space-y-4">
        {matriculas.map((m) => {
          const valor = preferencias[m.id] ?? '';
          const valorSalvo = m.preferencias_do_aluno || '';
          const alterado = valor !== valorSalvo;
          const salvando = salvandoId === m.id;
          const salvo = salvoId === m.id && !alterado;

          return (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-100 dark:border-slate-800 p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">
                    <span className="font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-bold mr-2">
                      {m.disciplina.codigo}
                    </span>
                    {m.disciplina.nome}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Professor(a): {m.professor.nome}</p>
                </div>
                {salvo && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ Preferência salva
                  </span>
                )}
              </div>

              <textarea
                value={valor}
                onChange={(e) => onEditar(m.id, e.target.value)}
                rows={4}
                placeholder="Ex: Prefiro instruções visuais, exemplos práticos e um pouco mais de tempo para leitura..."
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 rounded-lg text-sm text-slate-800 dark:text-white resize-y focus:outline-violet-500"
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  {valor.trim() === ''
                    ? 'Sem preferência definida para esta disciplina.'
                    : `${valor.length} caractere(s) — visível para o professor desta disciplina.`}
                </p>
                <button
                  onClick={() => onSalvar(m.id)}
                  disabled={salvando || !alterado}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {salvando ? 'Salvando...' : 'Salvar Preferência'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
