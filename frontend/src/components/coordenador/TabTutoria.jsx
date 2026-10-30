import Avatar from '../../ui/Avatar';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { Card, CardBody, CardHeader } from '../../ui/Card';
import EmptyState from '../../ui/EmptyState';
import { Field, Input } from '../../ui/Field';
import { TableShell, THead, TBody, TR, TH, TD } from '../../ui/Table';
import { IconeTutoria } from '../../ui/icons';

// Tutoria: assumir o acompanhamento de um aluno pela matrícula + lista de tutorados.
export default function TabTutoria({
  tutorados,
  matriculaTutorar,
  setMatriculaTutorar,
  onVincularTutor,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          titulo="Assumir tutoria"
          descricao="Vincule o estudante ao seu acompanhamento pedagógico individual."
          icone={<IconeTutoria className="h-4 w-4" />}
        />
        <form onSubmit={onVincularTutor}>
          <CardBody>
            <Field
              label="Matrícula do estudante"
              dica="A matrícula precisa já existir no sistema."
              className="max-w-md"
              obrigatorio
            >
              {(props) => (
                <Input
                  {...props}
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex.: 20260101"
                  value={matriculaTutorar}
                  onChange={(e) => setMatriculaTutorar(e.target.value)}
                  required
                />
              )}
            </Field>
          </CardBody>
          <div className="flex justify-end border-t border-slate-200/70 px-5 py-3.5 dark:border-slate-800">
            <Button type="submit">Assumir tutoria</Button>
          </div>
        </form>
      </Card>

      {tutorados.length === 0 ? (
        <EmptyState
          icone={<IconeTutoria className="h-6 w-6" />}
          titulo="Nenhum aluno em tutoria"
          descricao="Ao assumir uma tutoria, o estudante aparece aqui com o status de acompanhamento."
        />
      ) : (
        <TableShell>
          <THead>
            <tr>
              <TH>Estudante</TH>
              <TH>Matrícula</TH>
              <TH className="text-right">Acompanhamento</TH>
            </tr>
          </THead>
          <TBody>
            {tutorados.map((aluno, idx) => (
              <TR key={aluno.matricula || idx}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar nome={aluno.nome} tamanho="sm" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {aluno.nome}
                    </span>
                  </div>
                </TD>
                <TD>
                  <Badge tom="neutro" mono>
                    {aluno.matricula}
                  </Badge>
                </TD>
                <TD className="text-right">
                  <Badge tom="esmeralda">Tutoria ativa</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableShell>
      )}
    </div>
  );
}
