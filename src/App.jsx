import { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, set, onValue, push } from "firebase/database";
import "./App.css";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");
  const months = ["Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [payments, setPayments] = useState({});
  const [customValues, setCustomValues] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const [salaoTotal] = useState(1000);
  const [salaoPago, setSalaoPago] = useState(0);
  const [editingSalao, setEditingSalao] = useState(false);
  const [tempSalao, setTempSalao] = useState("");
  const [loading, setLoading] = useState(true);

  // Mural de avisos
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [authorName, setAuthorName] = useState("");

  // Carrega dados do Firebase em tempo real
  useEffect(() => {
    const playersRef = ref(database, 'players');
    const paymentsRef = ref(database, 'payments');
    const customValuesRef = ref(database, 'customValues');
    const salaoPagoRef = ref(database, 'salaoPago');
    const messagesRef = ref(database, 'messages');

    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      setPlayers(data || [
        "Felipe", "Bruce", "Caio", "Biel", "Diego Orelha", "Dodô", 
        "Frango", "Jhonathan", "Jhonny", "Jonas", "Leandro", 
        "Thiago Anão", "Rodrigo", "Thomaz", "Sidney", "Enzzo", "Morais"
      ]);
      setLoading(false);
    });

    onValue(paymentsRef, (snapshot) => {
      setPayments(snapshot.val() || {});
    });

    onValue(customValuesRef, (snapshot) => {
      setCustomValues(snapshot.val() || {});
    });

    onValue(salaoPagoRef, (snapshot) => {
      setSalaoPago(snapshot.val() || 0);
    });

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });
  }, []);

  const togglePayment = (player, month) => {
    const key = `${player}-${month}`;
    
    if (payments[key]) {
      const newPayments = { ...payments };
      delete newPayments[key];
      set(ref(database, 'payments'), newPayments);
      
      const newCustom = { ...customValues };
      delete newCustom[key];
      set(ref(database, 'customValues'), newCustom);
    } else {
      set(ref(database, `payments/${key}`), true);
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
        set(ref(database, `customValues/${editingCell}`), value);
      }
    }
    setEditingCell(null);
    setTempValue("");
  };

  const addPlayer = () => {
    if (!newPlayer.trim()) return;
    const updatedPlayers = [...players, newPlayer];
    set(ref(database, 'players'), updatedPlayers);
    setNewPlayer("");
  };

  const removePlayer = (playerToRemove) => {
    if (!confirm(`Remover ${playerToRemove}?`)) return;
    
    const updatedPlayers = players.filter(p => p !== playerToRemove);
    set(ref(database, 'players'), updatedPlayers);
    
    const newPayments = { ...payments };
    const newCustom = { ...customValues };
    
    months.forEach(month => {
      const key = `${playerToRemove}-${month}`;
      delete newPayments[key];
      delete newCustom[key];
    });
    
    set(ref(database, 'payments'), newPayments);
    set(ref(database, 'customValues'), newCustom);
  };

  const saveSalaoPago = () => {
    const value = parseFloat(tempSalao);
    if (!isNaN(value) && value >= 0) {
      set(ref(database, 'salaoPago'), value);
    }
    setEditingSalao(false);
    setTempSalao("");
  };

  const postMessage = () => {
    if (!newMessage.trim() || !authorName.trim()) {
      alert("Preencha seu nome e a mensagem!");
      return;
    }

    const messagesRef = ref(database, 'messages');
    const newMessageRef = push(messagesRef);
    
    set(newMessageRef, {
      author: authorName.trim(),
      text: newMessage.trim(),
      timestamp: Date.now()
    });

    setNewMessage("");
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} às ${hours}:${minutes}`;
  };

  const totalPaid = Object.keys(payments).reduce((sum, key) => {
    return sum + (customValues[key] || 45);
  }, 0);

  const totalExpected = players.length * 45 * 7;
  const salaoRestante = salaoTotal - salaoPago;

  if (loading) {
    return (
      <div className="app">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h2>⚽ Carregando dados...</h2>
        </div>
      </div>
    );
  }

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
              <h2>📢 Mural de Avisos</h2>
              
              <div className="message-form">
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Seu nome..."
                  className="message-input"
                />
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva um aviso (pagamento, confirmação, etc)..."
                  className="message-textarea"
                  rows="3"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      postMessage();
                    }
                  }}
                />
                <button onClick={postMessage} className="message-btn">
                  📤 Enviar
                </button>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <p className="no-messages">Nenhum aviso ainda</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="message-item">
                      <div className="message-header">
                        <strong>{msg.author}</strong>
                        <span className="message-time">{formatDate(msg.timestamp)}</span>
                      </div>
                      <p className="message-text">{msg.text}</p>
                    </div>
                  ))
                )}
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
