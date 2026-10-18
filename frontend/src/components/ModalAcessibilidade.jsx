import React, { useState } from 'react';
import TermometroAcessibilidade from './TermometroAcessibilidade';
import api from '../services/api'; // Ajuste conforme a rota da sua instância Axios

export default function ModalAcessibilidade({ isOpen, onClose, textoPadrao = '' }) {
  const [textoMaterial, setTextoMaterial] = useState(textoPadrao);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleAnalisar = async () => {
    if (!textoMaterial || textoMaterial.trim().length < 10) {
      setErro('Informe um texto com pelo menos 10 caracteres para ser analisado.');
      return;
    }

    setLoading(true);
    setErro('');
    try {
      const response = await api.post('/ia/avaliar-acessibilidade', {
        texto_material: textoMaterial
      });
      setResultado(response.data);
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao comunicar com o serviço de IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📊 Termômetro de Acessibilidade (DUA)
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Input de Texto do Material */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Texto do Material Didático ou Atividade:
          </label>
          <textarea
            rows={5}
            value={textoMaterial}
            onChange={(e) => setTextoMaterial(e.target.value)}
            placeholder="Cole o texto do seu plano de aula ou atividade aqui para avaliar a acessibilidade geral..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleAnalisar}
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? 'Analisando com IA...' : 'Analisar Acessibilidade Geral'}
        </button>

        {erro && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
            {erro}
          </div>
        )}

        {/* Exibição do Termômetro */}
        {resultado && <TermometroAcessibilidade avaliacao={resultado} />}
      </div>
    </div>
  );
}