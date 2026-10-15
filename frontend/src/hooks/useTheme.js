import { useState, useEffect } from 'react';

// Responsabilidade única: carregar, aplicar e persistir o tema (dark/light) do usuário.
// Antes este bloco estava copiado em Login, Cadastro e nos dois dashboards.
export default function useTheme() {
  // O estado nasce já lendo a preferência salva (evita um render extra e setState dentro do efeito)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Sincroniza a classe global do documento com o estado do tema
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Alterna entre Claro e Escuro, aplicando a classe global e persistindo a escolha
  const setTheme = (dark) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDarkMode, setTheme };
}
