import ListaDocumentos from '../ListaDocumentos';

// Aba "Documentos & Laudos Inclusivos": seletor de matrícula, upload e listas divididas.
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
            Documentos e Atividades por Matrícula
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie laudos médicos, atividades adaptadas e planos de aula
          </p>
        </div>

        {matriculas.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Matrícula/Aluno:</label>
            <select
              value={matriculaSelecionada ? matriculaSelecionada.id : ''}
              onChange={(e) => onSelectMatricula(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-emerald-500"
            >
              {matriculas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.aluno.nome} ({m.disciplina.codigo})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {matriculaSelecionada && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 flex flex-wrap justify-between items-center text-sm">
          <div>
            <span className="text-emerald-800 dark:text-emerald-300 font-bold">Aluno:</span>{' '}
            <span className="text-slate-800 dark:text-white font-medium">{matriculaSelecionada.aluno.nome}</span>{' '}
            <span className="text-xs text-slate-500 font-mono">({matriculaSelecionada.aluno.matricula})</span>
          </div>
          <div>
            <span className="text-emerald-800 dark:text-emerald-300 font-bold">Disciplina:</span>{' '}
            <span className="text-slate-800 dark:text-white font-medium">
              {matriculaSelecionada.disciplina.codigo} — {matriculaSelecionada.disciplina.nome}
            </span>
          </div>
        </div>
      )}

      {/* Formulário de Upload */}
      {matriculaSelecionada && (
        <form
          onSubmit={onSubmitUpload}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4 border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
            Enviar Novo Documento para o Aluno
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Título do Documento
              </label>
              <input
                type="text"
                placeholder="Ex: Plano Adaptado - Semana 1"
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
                <option value="PLANO_DE_AULA">Plano de Aula Adaptado</option>
                <option value="ATIVIDADE">Atividade Adaptada</option>
                <option value="LAUDO_MEDICO">Laudo Médico</option>
                <option value="OUTROS">Outros Documentos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Arquivo Físico (PDF, Imagem, etc.)
              </label>
              <input
                id="inputFileProfessor"
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
            {uploading ? 'Enviando Arquivo...' : 'Anexar Documento'}
          </button>
        </form>
      )}

      {/* Listas Divididas (Aluno vs Professor) */}
      {loadingDocs ? (
        <p className="text-center py-6 text-slate-400 animate-pulse">Carregando anexos da matrícula...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. DOCUMENTOS ENVIADOS PELO ALUNO */}
          <ListaDocumentos
            variante="painel"
            cor="blue"
            titulo="Enviados pelo Aluno"
            legenda="Laudos e Entregas"
            vazioTexto="Nenhum anexo enviado pelo aluno."
            documentos={documentosMatricula.enviados_pelo_aluno}
            onDownload={onDownload}
          />

          {/* 2. DOCUMENTOS ENVIADOS PELO PROFESSOR */}
          <ListaDocumentos
            variante="painel"
            cor="emerald"
            titulo="Enviados por Você"
            legenda="Planos e Materiais"
            vazioTexto="Você ainda não anexou materiais para este aluno."
            documentos={documentosMatricula.enviados_pelo_professor}
            onDownload={onDownload}
            onDelete={onDeletar}
          />
        </div>
      )}
    </div>
  );
}
