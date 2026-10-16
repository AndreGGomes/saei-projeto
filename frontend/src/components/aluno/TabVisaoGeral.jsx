// Aba "Visão Geral" do aluno: resumo de matrículas, disciplinas e situação
// das preferências de aprendizagem, com atalho para os documentos de cada matrícula.
export default function TabVisaoGeral({ matriculas, onVerDocumentos }) {
  const disciplinasUnicas = Array.from(new Set(matriculas.map((m) => m.disciplina.codigo)));
  const comPreferencia = matriculas.filter((m) => (m.preferencias_do_aluno || '').trim() !== '');

  const cartoes = [
    {
      rotulo: 'Minhas Matrículas',
      valor: matriculas.length,
      cor: 'text-blue-600 dark:text-blue-400',
      fundo: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      rotulo: 'Disciplinas',
      valor: disciplinasUnicas.length,
      cor: 'text-emerald-600 dark:text-emerald-400',
      fundo: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      rotulo: 'Preferências Definidas',
      valor: `${comPreferencia.length}/${matriculas.length}`,
      cor: 'text-violet-600 dark:text-violet-400',
      fundo: 'bg-violet-50 dark:bg-violet-950/40',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Minha Jornada</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Disciplinas, materiais e adaptações do seu aprendizado
        </p>
      </div>

      {/* Cartões de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cartoes.map((cartao) => (
          <div
            key={cartao.rotulo}
            className={`rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow ${cartao.fundo}`}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{cartao.rotulo}</p>
            <p className={`text-3xl font-extrabold mt-1 ${cartao.cor}`}>{cartao.valor}</p>
          </div>
        ))}
      </div>

      {/* Lista de matrículas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white">Minhas Disciplinas</h3>
          <p className="text-xs text-slate-400">Cada disciplina tem um professor responsável</p>
        </div>

        <ul className="divide-y dark:divide-slate-800">
          {matriculas.map((m) => (
            <li key={m.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">
                  <span className="font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-bold mr-2">
                    {m.disciplina.codigo}
                  </span>
                  {m.disciplina.nome}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Professor(a): {m.professor.nome} · {m.professor.email}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(m.preferencias_do_aluno || '').trim() !== ''
                    ? '✓ Preferências de aprendizagem definidas'
                    : 'Preferências de aprendizagem ainda não definidas'}
                </p>
              </div>
              <button
                onClick={() => onVerDocumentos(m)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
              >
                Ver Documentos
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
