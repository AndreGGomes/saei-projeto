import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { Card, CardBody, CardHeader } from '../../ui/Card';
import EmptyState from '../../ui/EmptyState';
import { Field, Input, Select } from '../../ui/Field';
import { TableShell, THead, TBody, TR, TH, TD } from '../../ui/Table';
import { IconeDocumento, IconeMais } from '../../ui/icons';

// Cadastro de matrícula + tabela de vínculos com atalho para anexos.
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
      <Card>
        <CardHeader
          titulo="Nova matrícula"
          descricao="Vincula um aluno já cadastrado a um professor e uma disciplina."
          icone={<IconeMais className="h-4 w-4" />}
        />
        <form onSubmit={onAddMatricula}>
          <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Matrícula do aluno" obrigatorio>
              {(props) => (
                <Input
                  {...props}
                  type="text"
                  placeholder="Ex.: 20260101"
                  value={novaMatricula.aluno_matricula}
                  onChange={(e) =>
                    setNovaMatricula({ ...novaMatricula, aluno_matricula: e.target.value })
                  }
                  required
                />
              )}
            </Field>

            <Field label="Professor responsável" obrigatorio>
              {(props) => (
                <Select
                  {...props}
                  value={novaMatricula.professor_email}
                  onChange={(e) =>
                    setNovaMatricula({ ...novaMatricula, professor_email: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione o professor</option>
                  {professores.map((p, idx) => (
                    <option key={idx} value={p.email}>
                      {p.nome} ({p.email})
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Disciplina" obrigatorio>
              {(props) => (
                <Select
                  {...props}
                  value={novaMatricula.disciplina_codigo}
                  onChange={(e) =>
                    setNovaMatricula({ ...novaMatricula, disciplina_codigo: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione a disciplina</option>
                  {disciplinas.map((d, idx) => (
                    <option key={idx} value={d.codigo}>
                      {d.codigo} — {d.nome}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </CardBody>
          <div className="flex justify-end border-t border-slate-200/70 px-5 py-3.5 dark:border-slate-800">
            <Button type="submit" iconeEsquerda={<IconeMais className="h-4 w-4" />}>
              Efetivar matrícula
            </Button>
          </div>
        </form>
      </Card>

      {matriculas.length === 0 ? (
        <EmptyState
          icone={<IconeDocumento className="h-6 w-6" />}
          titulo="Nenhuma matrícula registrada"
          descricao="Depois de criar disciplinas e cadastrar professores, registre o primeiro vínculo."
        />
      ) : (
        <TableShell>
          <THead>
            <tr>
              <TH>Aluno</TH>
              <TH>Disciplina</TH>
              <TH>Professor responsável</TH>
              <TH className="text-right">Ações</TH>
            </tr>
          </THead>
          <TBody>
            {matriculas.map((m) => (
              <TR key={m.id}>
                <TD>
                  <p className="font-semibold text-slate-900 dark:text-white">{m.aluno.nome}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">{m.aluno.matricula}</p>
                </TD>
                <TD>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tom="indigo" mono>
                      {m.disciplina.codigo}
                    </Badge>
                    <span className="text-slate-600 dark:text-slate-300">{m.disciplina.nome}</span>
                  </div>
                </TD>
                <TD>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{m.professor.nome}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{m.professor.email}</p>
                </TD>
                <TD>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <Button
                      variante="secundario"
                      tamanho="sm"
                      onClick={() => onVerDocumentos(m)}
                      iconeEsquerda={<IconeDocumento className="h-3.5 w-3.5" />}
                    >
                      Anexos
                    </Button>
                    <Button variante="fantasma" tamanho="sm" onClick={() => onMudarProfessor(m)}>
                      Trocar professor
                    </Button>
                    <Button
                      variante="fantasma"
                      tamanho="sm"
                      onClick={() => onDeletarMatricula(m.id)}
                      className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      Cancelar
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableShell>
      )}
    </div>
  );
}
