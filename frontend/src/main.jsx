import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ToastProvider from './ui/ToastProvider.jsx'
import './index.css'

// Sem <React.StrictMode>: no dev server (React 18) ele monta → desmonta → remonta os
// componentes e fazia TODA chamada de IA disparar duas requisições por clique (gastando
// cota da Groq à toa). Sem ele, dev e produção se comportam igual: uma requisição.
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastProvider>
      <App />
    </ToastProvider>
  </BrowserRouter>,
)
