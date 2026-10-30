import ThemeToggle from '../components/ThemeToggle';
import { IconeBrilhos, IconeQuebraCabeca, IconeTermometro, IconeTutoria } from '../ui/icons';

const DESTAQUES = [
  {
    Icone: IconeTermometro,
    titulo: 'Termômetro DUA',
    texto: 'Nota de acessibilidade do material com critérios do Desenho Universal.',
  },
  {
    Icone: IconeQuebraCabeca,
    titulo: 'Adaptação de materiais',
    texto: 'Guia metodológico inclusivo a partir do plano de aula e do laudo.',
  },
  {
    Icone: IconeTutoria,
    titulo: 'Tutor personalizado',
    texto: 'Explicação passo a passo no ritmo e no formato de cada estudante.',
  },
];

// Moldura das telas públicas: painel de marca à esquerda (desktop) e formulário
// centralizado à direita. No mobile o painel dá lugar a um cabeçalho compacto.
export default function AuthLayout({ children, isDarkMode, setTheme }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Painel de marca */}
      <aside className="relative hidden w-[46%] max-w-2xl flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-black ring-1 ring-white/25 backdrop-blur">
              S
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight">SAEI</p>
              <p className="text-[11px] text-white/70">Sistema de Apoio à Educação Inclusiva</p>
            </div>
          </div>

          <h1 className="mt-14 max-w-md text-3xl font-bold leading-tight tracking-tight">
            Educação inclusiva com apoio de inteligência artificial.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
            Um espaço para coordenar vínculos, acompanhar estudantes e adaptar materiais com base
            nas diretrizes do Desenho Universal para a Aprendizagem.
          </p>
        </div>

        <ul className="relative space-y-3">
          {DESTAQUES.map(({ Icone, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-3 rounded-2xl bg-white/10 p-3.5 ring-1 ring-inset ring-white/15">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">{titulo}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/70">{texto}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="relative flex items-center gap-2 text-[11px] text-white/60">
          <IconeBrilhos className="h-3.5 w-3.5" />
          Recursos de IA generativa com revisão pedagógica humana.
        </p>
      </aside>

      {/* Formulário */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-6 sm:top-6">
          {setTheme && <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} />}
        </div>

        <div className="w-full max-w-md">
          {/* Marca compacta no mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-black text-white shadow-sm">
              S
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">SAEI</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Apoio à Educação Inclusiva
              </p>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
