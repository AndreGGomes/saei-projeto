import ListaDocumentos from '../ListaDocumentos';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { Card, CardBody, CardHeader } from '../../ui/Card';
import { Field, Input, Select } from '../../ui/Field';
import SeletorArquivo from '../../ui/SeletorArquivo';
import { SkeletonLista } from '../../ui/Spinner';
import { IconeDocumento, IconeUpload, IconeUsuarios } from '../../ui/icons';

// Aba de documentos do aluno: contexto da disciplina, envio ao professor e as duas
// listas (enviados por mim / enviados pelo professor).
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
      {/* Contexto da disciplina selecionada */}
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
              <IconeDocumento className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              {matriculaSelecionada ? (
                <>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <Badge tom="esmeralda" mono>
                      {matriculaSelecionada.disciplina.codigo}
                    </Badge>
                    {matriculaSelecionada.disciplina.nome}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <IconeUsuarios className="h-3.5 w-3.5" />
                    {matriculaSelecionada.professor.nome}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Selecione uma disciplina para ver os anexos.
                </p>
              )}
            </div>
          </div>

          {matriculas.length > 1 && (
            <Field label="Disciplina" className="w-full sm:w-64">
              {(props) => (
                <Select
                  {...props}
                  value={matriculaSelecionada ? matriculaSelecionada.id : ''}
                  onChange={(e) => onSelectMatricula(Number(e.target.value))}
                >
                  {matriculas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.disciplina.codigo} — {m.disciplina.nome}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
        </CardBody>
      </Card>

      {/* Envio ao professor */}
      {matriculaSelecionada && (
        <Card>
          <CardHeader
            titulo="Enviar documento ao professor"
            descricao="Laudos, atividades concluídas ou qualquer material que o docente precise ver."
            icone={<IconeUpload className="h-4 w-4" />}
          />
          <form onSubmit={onSubmitUpload}>
            <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Título do documento" obrigatorio>
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    placeholder="Ex.: Laudo médico atualizado"
                    value={uploadForm.titulo}
                    onChange={(e) => setUploadForm({ ...uploadForm, titulo: e.target.value })}
                    required
                  />
                )}
              </Field>

              <Field label="Tipo de material">
                {(props) => (
                  <Select
                    {...props}
                    value={uploadForm.tipo}
                    onChange={(e) => setUploadForm({ ...uploadForm, tipo: e.target.value })}
                  >
                    <option value="ATIVIDADE">Atividade</option>
                    <option value="LAUDO_MEDICO">Laudo médico</option>
                    <option value="PLANO_DE_AULA">Plano de aula</option>
                    <option value="OUTROS">Outros documentos</option>
                  </Select>
                )}
              </Field>

              <Field label="Arquivo" dica="PDF, imagem ou documento." obrigatorio>
                {(props) => (
                  <SeletorArquivo
                    controleProps={props}
                    id="inputFileAluno"
                    arquivo={uploadForm.arquivo}
                    onChange={(arquivo) => setUploadForm({ ...uploadForm, arquivo })}
                    required
                  />
                )}
              </Field>
            </CardBody>
            <div className="flex justify-end border-t border-slate-200/70 px-5 py-3.5 dark:border-slate-800">
              <Button
                type="submit"
                variante="sucesso"
                carregando={uploading}
                iconeEsquerda={<IconeUpload className="h-4 w-4" />}
              >
                {uploading ? 'Enviando...' : 'Enviar ao professor'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Listas */}
      {loadingDocs ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardBody>
              <SkeletonLista linhas={2} />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <SkeletonLista linhas={2} />
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <ListaDocumentos
            cor="blue"
            titulo="Enviados por você"
            legenda="Laudos e entregas"
            vazioTexto="Você ainda não enviou documentos para esta disciplina."
            documentos={documentosMatricula.enviados_pelo_aluno}
            onDownload={onDownload}
            onDelete={onDeletar}
          />
          <ListaDocumentos
            cor="emerald"
            titulo="Enviados pelo professor"
            legenda="Planos e materiais"
            vazioTexto="O professor ainda não anexou materiais para esta disciplina."
            documentos={documentosMatricula.enviados_pelo_professor}
            onDownload={onDownload}
          />
        </div>
      )}
    </div>
  );
}
