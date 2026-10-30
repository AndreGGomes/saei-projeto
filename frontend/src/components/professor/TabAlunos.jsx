import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { TableShell, THead, TBody, TR, TH, TD } from '../../ui/Table';
import { IconeUsuarios } from '../../ui/icons';

// Tabela das matrículas sob docência do professor, com atalho para os anexos.
export default function TabAlunos({ matriculas, onVerDocumentos }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Alunos e disciplinas vinculadas
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Cada linha é um vínculo entre estudante, disciplina e você como responsável.
        </p>
      </div>

      {matriculas.length === 0 ? (
        <EmptyState
          icone={<IconeUsuarios className="h-6 w-6" />}
          titulo="Nenhum aluno vinculado"
          descricao="A coordenação registra as matrículas; assim que houver vínculo com você, ele aparece aqui."
        />
      ) : (
        <TableShell>
          <THead>
            <tr>
              <TH>Estudante</TH>
              <TH>Matrícula</TH>
              <TH>Disciplina</TH>
              <TH className="text-right">Ações</TH>
            </tr>
          </THead>
          <TBody>
            {matriculas.map((m) => (
              <TR key={m.id}>
                <TD className="font-semibold text-slate-900 dark:text-white">{m.aluno.nome}</TD>
                <TD>
                  <Badge tom="neutro" mono>
                    {m.aluno.matricula}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tom="indigo" mono>
                      {m.disciplina.codigo}
                    </Badge>
                    <span className="text-slate-600 dark:text-slate-300">{m.disciplina.nome}</span>
                  </div>
                </TD>
                <TD className="text-right">
                  <Button variante="secundario" tamanho="sm" onClick={() => onVerDocumentos(m)}>
                    Ver documentos
                  </Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableShell>
      )}
    </div>
  );
}
