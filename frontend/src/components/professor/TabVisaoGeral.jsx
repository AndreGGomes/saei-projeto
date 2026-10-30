import { Card, CardBody, CardHeader } from '../../ui/Card';
import StatCard from '../../ui/StatCard';
import { IconeDocumento, IconeLivro, IconeUsuarios } from '../../ui/icons';

// Visão geral do docente: indicadores e um atalho explicando onde ficam os anexos.
export default function TabVisaoGeral({ matriculas, disciplinasUnicas }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          rotulo="Alunos matriculados"
          valor={matriculas.length}
          detalhe="Vínculos sob sua docência"
          tom="ceu"
          icone={<IconeUsuarios className="h-5 w-5" />}
        />
        <StatCard
          rotulo="Disciplinas ministradas"
          valor={disciplinasUnicas.length}
          detalhe="Códigos distintos"
          tom="esmeralda"
          icone={<IconeLivro className="h-5 w-5" />}
        />
        <StatCard
          rotulo="Acompanhamento inclusivo"
          valor="Ativo"
          detalhe="Recursos de IA e diretrizes DUA disponíveis"
          tom="violeta"
          icone={<IconeDocumento className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader
          titulo="Como usar este painel"
          descricao="Tudo parte do material anexado a cada matrícula."
        />
        <CardBody>
          <ol className="grid grid-cols-1 gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
            <li className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                1. Abra os documentos
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Em <strong>Alunos e disciplinas</strong>, clique em “Ver documentos” para ver laudos e
                entregas do estudante.
              </p>
            </li>
            <li className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                2. Use as ações de IA
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                No menu <strong>IA</strong> de cada arquivo: resumo, adaptação de material e Termômetro
                DUA.
              </p>
            </li>
            <li className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                3. Envie materiais
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Em <strong>Documentos</strong>, anexe planos e atividades adaptadas para o aluno.
              </p>
            </li>
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
