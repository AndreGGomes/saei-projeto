import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { Card, CardBody, CardHeader } from '../../ui/Card';
import EmptyState from '../../ui/EmptyState';
import { Field, Input } from '../../ui/Field';
import { TableShell, THead, TBody, TR, TH, TD } from '../../ui/Table';
import { IconeLivro, IconeMais } from '../../ui/icons';

// Cadastro de disciplinas + tabela com renomear/excluir.
export default function TabDisciplinas({
  disciplinas,
  novaDisciplina,
  setNovaDisciplina,
  onAddDisciplina,
  onEditarDisciplina,
  onDeletarDisciplina,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          titulo="Nova disciplina"
          descricao="O código é único e aparece em todas as matrículas."
          icone={<IconeMais className="h-4 w-4" />}
        />
        <form onSubmit={onAddDisciplina}>
          <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome da disciplina" obrigatorio>
              {(props) => (
                <Input
                  {...props}
                  type="text"
                  placeholder="Ex.: Geografia adaptada"
                  value={novaDisciplina.nome}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                  required
                />
              )}
            </Field>

            <Field label="Código único" dica="Ex.: GEO-01 (será salvo em maiúsculas)." obrigatorio>
              {(props) => (
                <Input
                  {...props}
                  type="text"
                  placeholder="GEO-01"
                  value={novaDisciplina.codigo}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, codigo: e.target.value })}
                  className={`${props.className} font-mono uppercase`}
                  required
                />
              )}
            </Field>
          </CardBody>
          <div className="flex justify-end border-t border-slate-200/70 px-5 py-3.5 dark:border-slate-800">
            <Button type="submit" iconeEsquerda={<IconeMais className="h-4 w-4" />}>
              Salvar disciplina
            </Button>
          </div>
        </form>
      </Card>

      {disciplinas.length === 0 ? (
        <EmptyState
          icone={<IconeLivro className="h-6 w-6" />}
          titulo="Nenhuma disciplina cadastrada"
          descricao="Comece cadastrando a primeira disciplina para poder criar matrículas."
        />
      ) : (
        <TableShell>
          <THead>
            <tr>
              <TH>Código</TH>
              <TH>Nome da disciplina</TH>
              <TH className="text-right">Ações</TH>
            </tr>
          </THead>
          <TBody>
            {disciplinas.map((disc) => (
              <TR key={disc.codigo}>
                <TD>
                  <Badge tom="indigo" mono>
                    {disc.codigo}
                  </Badge>
                </TD>
                <TD className="font-medium text-slate-800 dark:text-slate-100">{disc.nome}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variante="fantasma"
                      tamanho="sm"
                      onClick={() => onEditarDisciplina(disc)}
                    >
                      Renomear
                    </Button>
                    <Button
                      variante="fantasma"
                      tamanho="sm"
                      onClick={() => onDeletarDisciplina(disc.codigo)}
                      className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      Excluir
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
