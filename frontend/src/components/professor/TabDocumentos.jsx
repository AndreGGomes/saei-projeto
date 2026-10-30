import ListaDocumentos from '../ListaDocumentos';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { Card, CardBody, CardHeader } from '../../ui/Card';
import { Field, Input, Select } from '../../ui/Field';
import SeletorArquivo from '../../ui/SeletorArquivo';
import { SkeletonLista } from '../../ui/Spinner';
import { IconeDocumento, IconeUpload } from '../../ui/icons';

// Aba de documentos do professor: escolhe a matrícula, envia material e vê as duas listas.
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
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
              <IconeDocumento className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              {matriculaSelecionada ? (
                <>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {matriculaSelecionada.aluno.nome}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Badge tom="neutro" mono>
                      {matriculaSelecionada.aluno.matricula}
                    </Badge>
                    <Badge tom="indigo" mono>
                      {matriculaSelecionada.disciplina.codigo}
                    </Badge>
                    {matriculaSelecionada.disciplina.nome}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Selecione um aluno para ver e enviar anexos.
                </p>
              )}
            </div>
          </div>

          {matriculas.length > 1 && (
            <Field label="Aluno / matrícula" className="w-full sm:w-72">
              {(props) => (
                <Select
                  {...props}
                  value={matriculaSelecionada ? matriculaSelecionada.id : ''}
                  onChange={(e) => onSelectMatricula(Number(e.target.value))}
                >
                  {matriculas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.aluno.nome} ({m.disciplina.codigo})
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
        </CardBody>
      </Card>

      {matriculaSelecionada && (
        <Card>
          <CardHeader
            titulo="Enviar material ao aluno"
            descricao="Planos de aula adaptados, atividades e orientações."
            icone={<IconeUpload className="h-4 w-4" />}
          />
          <form onSubmit={onSubmitUpload}>
            <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Título do documento" obrigatorio>
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    placeholder="Ex.: Plano adaptado — semana 1"
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
                    <option value="PLANO_DE_AULA">Plano de aula</option>
                    <option value="ATIVIDADE">Atividade</option>
                    <option value="LAUDO_MEDICO">Laudo médico</option>
                    <option value="OUTROS">Outros documentos</option>
                  </Select>
                )}
              </Field>

              <Field label="Arquivo" dica="PDF, imagem ou documento." obrigatorio>
                {(props) => (
                  <SeletorArquivo
                    controleProps={props}
                    id="inputFileProfessor"
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
                {uploading ? 'Enviando...' : 'Anexar documento'}
              </Button>
            </div>
          </form>
        </Card>
      )}

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
            titulo="Enviados pelo aluno"
            legenda="Laudos e entregas"
            vazioTexto="Nenhum anexo enviado pelo aluno."
            documentos={documentosMatricula.enviados_pelo_aluno}
            onDownload={onDownload}
            perfil="PROFESSOR"
          />
          <ListaDocumentos
            cor="emerald"
            titulo="Enviados por você"
            legenda="Planos e materiais"
            vazioTexto="Você ainda não anexou materiais para este aluno."
            documentos={documentosMatricula.enviados_pelo_professor}
            onDownload={onDownload}
            onDelete={onDeletar}
            perfil="PROFESSOR"
          />
        </div>
      )}
    </div>
  );
}
