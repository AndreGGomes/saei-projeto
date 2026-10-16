import ListaDocumentos from '../ListaDocumentos';

// Aba "Documentos & Atividades" do aluno: seletor de disciplina, envio ao
// professor e as duas listas (enviadas por mim / enviadas pelo professor).
export default function TabDocumentos({
  matriculas,
  matriculaSelecionada,
  onSelectMatricula,
  uploadForm,
  setUploadForm,
  uploading,
  onSubmitUpload,
  loadingDocs,
  documentosMatricula,
  onDownload,
  onDeletar,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Documentos e Atividades
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Envie laudos e atividades ao professor e acompanhe os materiais recebidos
          </p>
        </div>

        {matriculas.length > 1 && (
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Disciplina:</label>
            <select
              value={matriculaSelecionada ? matriculaSelecionada.id : ''}
              onChange={(e) => onSelectMatricula(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-emerald-500"
            >
              {matriculas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.disciplina.codigo} — {m.disciplina.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {matriculaSelecionada && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 flex flex-wrap justify-between items-center text-sm">
          <div>
            <span className="text-emerald-800 dark:text-emerald-300 font-bold">Disciplina:</span>{' '}
            <span className="text-slate-800 dark:text-white font-medium">
              {matriculaSelecionada.disciplina.codigo} — {matriculaSelecionada.disciplina.nome}
            </span>
          </div>
          <div>
            <span className="text-emerald-800 dark:text-emerald-300 font-bold">Professor(a):</span>{' '}
            <span className="text-slate-800 dark:text-white font-medium">
              {matriculaSelecionada.professor.nome}
            </span>
          </div>
        </div>
      )}

      {/* Formulário de Upload para o Professor */}
      {matriculaSelecionada && (
        <form
          onSubmit={onSubmitUpload}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
            Enviar Documento ao Professor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Título do Documento
              </label>
              <input
                type="text"
                placeholder="Ex: Laudo Médico - Atualizado"
                value={uploadForm.titulo}
                onChange={(e) => setUploadForm({ ...uploadForm, titulo: e.target.value })}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tipo de Material
              </label>
              <select
                value={uploadForm.tipo}
                onChange={(e) => setUploadForm({ ...uploadForm, tipo: e.target.value })}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-sm w-full text-slate-800 dark:text-white focus:outline-emerald-500"
              >
                <option value="ATIVIDADE">Atividade Adaptada</option>
                <option value="LAUDO_MEDICO">Laudo Médico</option>
                <option value="PLANO_DE_AULA">Plano de Aula</option>
                <option value="OUTROS">Outros Documentos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Arquivo Físico (PDF, Imagem, etc.)
              </label>
              <input
                id="inputFileAluno"
                type="file"
                onChange={(e) => setUploadForm({ ...uploadForm, arquivo: e.target.files[0] })}
                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg text-xs w-full text-slate-800 dark:text-white file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow disabled:opacity-50"
          >
            {uploading ? 'Enviando Arquivo...' : 'Enviar ao Professor'}
          </button>
        </form>
      )}

      {/* Listas Divididas (Você vs Professor) */}
      {loadingDocs ? (
        <p className="text-center py-6 text-slate-400 animate-pulse">Carregando anexos da disciplina...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. DOCUMENTOS ENVIADOS PELO ALUNO */}
          <ListaDocumentos
            variante="painel"
            cor="blue"
            titulo="Enviados por Você"
            legenda="Laudos e Entregas"
            vazioTexto="Você ainda não enviou documentos para esta disciplina."
            documentos={documentosMatricula.enviados_pelo_aluno}
            onDownload={onDownload}
            onDelete={onDeletar}
          />

          {/* 2. DOCUMENTOS ENVIADOS PELO PROFESSOR */}
          <ListaDocumentos
            variante="painel"
            cor="emerald"
            titulo="Enviados pelo Professor"
            legenda="Planos e Materiais"
            vazioTexto="O professor ainda não anexou materiais para esta disciplina."
            documentos={documentosMatricula.enviados_pelo_professor}
            onDownload={onDownload}
          />
        </div>
      )}
    </div>
  );
}
