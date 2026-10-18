import ListaDocumentos from '../ListaDocumentos';

// Modal de visualização/download/exclusão dos documentos de uma matrícula (coordenação).
export default function ModalDocumentosMatricula({ matricula, documentos, loading, onFechar, onDownload, onDeletar }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Documentos & Laudos da Matrícula
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Estudante:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {matricula.aluno.nome}
              </strong>{' '}
              ({matricula.aluno.matricula}) | Disciplina:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {matricula.disciplina.codigo} — {matricula.disciplina.nome}
              </strong>
            </p>
          </div>
          <button
            onClick={onFechar}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 text-slate-400 animate-pulse">Carregando histórico de anexos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. DOCUMENTOS ENVIADOS PELO ALUNO (Laudos Médicos, Entregas) */}
            <ListaDocumentos
              variante="modal"
              cor="blue"
              titulo="Enviados pelo Aluno"
              legenda="Laudos e Entregas"
              vazioTexto="Nenhum documento anexado pelo aluno."
              documentos={documentos.enviados_pelo_aluno}
              onDownload={onDownload}
              onDelete={onDeletar}
              perfil="COORDENADOR"
            />

            {/* 2. DOCUMENTOS ENVIADOS PELO PROFESSOR (Planos de Aula, Atividades) */}
            <ListaDocumentos
              variante="modal"
              cor="emerald"
              titulo="Enviados pelo Professor"
              legenda="Planos e Materiais"
              vazioTexto="Nenhum documento anexado pelo professor."
              documentos={documentos.enviados_pelo_professor}
              onDownload={onDownload}
              onDelete={onDeletar}
              perfil="COORDENADOR"
            />
          </div>
        )}

        <div className="flex justify-end pt-2 border-t dark:border-slate-800">
          <button
            type="button"
            onClick={onFechar}
            className="px-5 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}
