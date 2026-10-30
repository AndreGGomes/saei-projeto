import Avatar from '../../ui/Avatar';
import EmptyState from '../../ui/EmptyState';
import { TableShell, THead, TBody, TR, TH, TD } from '../../ui/Table';
import { IconeUsuarios } from '../../ui/icons';

// Listagem (somente leitura) do corpo docente registrado.
export default function TabProfessores({ professores }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Corpo docente registrado
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Professores que podem receber matrículas.
        </p>
      </div>

      {professores.length === 0 ? (
        <EmptyState
          icone={<IconeUsuarios className="h-6 w-6" />}
          titulo="Nenhum professor registrado"
          descricao="Contas de professor são criadas na tela de cadastro com o perfil “Professor”."
        />
      ) : (
        <TableShell>
          <THead>
            <tr>
              <TH>Docente</TH>
              <TH>E-mail institucional</TH>
            </tr>
          </THead>
          <TBody>
            {professores.map((prof, idx) => (
              <TR key={prof.email || idx}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar nome={prof.nome} tamanho="sm" />
                    <span className="font-semibold text-slate-900 dark:text-white">{prof.nome}</span>
                  </div>
                </TD>
                <TD className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {prof.email}
                </TD>
              </TR>
            ))}
          </TBody>
        </TableShell>
      )}
    </div>
  );
}
