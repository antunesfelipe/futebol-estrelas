import { useState } from "react";
import "./App.css";

export default function App() {
  const [players, setPlayers] = useState([
    "Felipe", "Bruce", "Caio", "Biel", "Diego Orelha", "Dodô", 
    "Frango", "Jhonathan", "Jhonny", "Jonas", "Leandro", 
    "Thiago Anão", "Rodrigo", "Thomaz", "Sidney", "Enzzo", "Morais"
  ]);

  const [newPlayer, setNewPlayer] = useState("");
  const months = ["Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [payments, setPayments] = useState({});
  const [customValues, setCustomValues] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState("");

  // Controle do salão
  const [salaoTotal] = useState(1000);
  const [salaoPago, setSalaoPago] = useState(0);
  const [editingSalao, setEditingSalao] = useState(false);
  const [tempSalao, setTempSalao] = useState("");

  const togglePayment = (player, month) => {
    const key = `${player}-${month}`;
    
    if (payments[key]) {
      // Se já está pago, despaga
      const newPayments = { ...payments };
      delete newPayments[key];
      setPayments(newPayments);
      
      const newCustom = { ...customValues };
      delete newCustom[key];
      setCustomValues(newCustom);
    } else {
      // Se não está pago, marca como pago com valor padrão
      setPayments({ ...payments, [key]: true });
    }
  };

  const startEditCell = (player, month) => {
    const key = `${player}-${month}`;
    if (payments[key]) {
      setEditingCell(key);
      setTempValue(customValues[key] || "45");
    }
  };

  const saveCustomValue = () => {
    if (editingCell && tempValue) {
      const value = parseFloat(tempValue);
      if (!isNaN(value) && value > 0) {
        setCustomValues({ ...customValues, [editingCell]: value });
      }
    }
    setEditingCell(null);
    setTempValue("");
  };

  const addPlayer = () => {
    if (!newPlayer.trim()) return;
    setPlayers([...players, newPlayer]);
    setNewPlayer("");
  };

  const removePlayer = (playerToRemove) => {
    if (!confirm(`Remover ${playerToRemove}?`)) return;
    
    setPlayers(players.filter(p => p !== playerToRemove));
    
    // Remove os pagamentos desse jogador, mas NÃO remove do total arrecadado
    const newPayments = { ...payments };
    const newCustom = { ...customValues };
    
    months.forEach(month => {
      const key = `${playerToRemove}-${month}`;
      delete newPayments[key];
      delete newCustom[key];
    });
    
    setPayments(newPayments);
    setCustomValues(newCustom);
  };

  const saveSalaoPago = () => {
    const value = parseFloat(tempSalao);
    if (!isNaN(value) && value >= 0) {
      setSalaoPago(value);
    }
    setEditingSalao(false);
    setTempSalao("");
  };

  // Calcula o total arrecadado considerando valores customizados
  const totalPaid = Object.keys(payments).reduce((sum, key) => {
    return sum + (customValues[key] || 45);
  }, 0);

  const totalExpected = players.length * 45 * 7;
  const salaoRestante = salaoTotal - salaoPago;

  return (
    <div className="app">
      <div className="container">
        
        <header className="header">
          <h1>⚽ Futebol das Estrelas 2026</h1>
          <p>Confraternização oficial • 06/12/2026</p>
          
          <div className="stats">
            <div className="stat-card">
              <span className="label">Participantes</span>
              <span className="value">{players.length}</span>
            </div>
            <div className="stat-card">
              <span className="label">Mensalidade</span>
              <span className="value">R$45</span>
            </div>
            <div className="stat-card">
              <span className="label">Arrecadado</span>
              <span className="value">R${totalPaid.toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="label">Meta Total</span>
              <span className="value">R${totalExpected}</span>
            </div>
          </div>
        </header>

        <div className="main-grid">
          
          <div className="table-section">
            <h2>💰 Controle Financeiro</h2>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    {months.map(m => <th key={m}>{m}</th>)}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player}>
                      <td className="player-name">{player}</td>
                      {months.map(month => {
                        const key = `${player}-${month}`;
                        const isPaid = payments[key];
                        const customValue = customValues[key];
                        
                        return (
                          <td key={month}>
                            {editingCell === key ? (
                              <input
                                type="number"
                                className="value-input"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={saveCustomValue}
                                onKeyPress={(e) => e.key === 'Enter' && saveCustomValue()}
                                autoFocus
                              />
                            ) : (
                              <div className="cell-content">
                                <button
                                  className={`check-btn ${isPaid ? 'paid' : ''}`}
                                  onClick={() => togglePayment(player, month)}
                                  title={isPaid && customValue ? `R$${customValue}` : ''}
                                />
                                {isPaid && customValue && customValue !== 45 && (
                                  <span className="custom-value">R${customValue}</span>
                                )}
                                {isPaid && (
                                  <button
                                    className="edit-value-btn"
                                    onClick={() => startEditCell(player, month)}
                                    title="Editar valor"
                                  >
                                    ✏️
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td>
                        <button 
                          className="remove-btn"
                          onClick={() => removePlayer(player)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sidebar">
            
            <div className="card">
              <h2>🏟️ Salão</h2>
              
              <div className="info-item">
                <span>Valor Total</span>
                <strong>R$ {salaoTotal.toFixed(2)}</strong>
              </div>

              <div className="info-item">
                <span>Já Pago</span>
                {editingSalao ? (
                  <input
                    type="number"
                    className="salao-input"
                    value={tempSalao}
                    onChange={(e) => setTempSalao(e.target.value)}
                    onBlur={saveSalaoPago}
                    onKeyPress={(e) => e.key === 'Enter' && saveSalaoPago()}
                    autoFocus
                    placeholder="0.00"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>R$ {salaoPago.toFixed(2)}</strong>
                    <button
                      className="edit-salao-btn"
                      onClick={() => {
                        setEditingSalao(true);
                        setTempSalao(salaoPago.toString());
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>

              <div className="info-item restante">
                <span>Falta Pagar</span>
                <strong className={salaoRestante > 0 ? 'negative' : 'positive'}>
                  R$ {salaoRestante.toFixed(2)}
                </strong>
              </div>

              <div className="info-item">
                <p className="highlight">Sinal: R$500 até 15/05</p>
              </div>
            </div>

            <div className="card">
              <h2>➕ Adicionar Participante</h2>
              <div className="input-group">
                <input
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  placeholder="Nome..."
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                />
                <button onClick={addPlayer}>+</button>
              </div>
            </div>

            <div className="card">
              <h2>🍖 Estrutura</h2>
              <div className="structure-grid">
                {["🍺 Chopp", "🎵 Som", "🍖 Churrasco", "🧒 Picolé", 
                  "🏆 Futebol", "☕ Resenha", "🥤 Bebidas", "🎁 Canecas"]
                  .map(item => <div key={item} className="structure-item">{item}</div>)}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
