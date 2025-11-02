import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar, BarChart3, Download } from 'lucide-react';
import './Dashboard.css';
import SaldoChart from './charts/SaldoChart';
import FluxoChart from './charts/FluxoChart';
import SemanalChart from './charts/SemanalChart';
import StatCard from './StatCard';
import * as XLSX from 'xlsx';

const Dashboard = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { statistics, projecao, resumoSemanal, extrato, titulosAR, titulosAP } = data;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const projecaoFormatted = projecao.map(p => ({
      'Data': new Date(p.data).toLocaleDateString('pt-BR'),
      'Entradas Recorrentes': p.entradasRecorrentes,
      'Recebimentos AR': p.recebimentosAR,
      'Total Entradas': p.totalEntradas,
      'Saídas Recorrentes': p.saidasRecorrentes,
      'Pagamentos AP': p.pagamentosAP,
      'Total Saídas': p.totalSaidas,
      'Fluxo Líquido': p.fluxoLiquido,
      'Saldo Projetado': p.saldoProjetado,
      'Alerta': p.alertaNegativo ? 'Negativo' : p.alertaBaixo ? 'Baixo' : 'OK'
    }));

    const resumoFormatted = resumoSemanal.map(s => ({
      'Semana': s.semana,
      'Entradas': s.entradas,
      'Saídas': s.saidas,
      'Fluxo Líquido': s.fluxoLiquido,
      'Saldo Final': s.saldoFinal,
      'Status': s.alertaNegativo ? 'Negativo' : s.alertaBaixo ? 'Baixo' : 'OK'
    }));

    const estatisticas = [
      { 'Métrica': 'Saldo Inicial', 'Valor': statistics.saldoInicial },
      { 'Métrica': 'Saldo Final Projetado', 'Valor': statistics.saldoFinal },
      { 'Métrica': 'Variação', 'Valor': statistics.variacao },
      { 'Métrica': 'Saldo Mínimo', 'Valor': statistics.saldoMinimo },
      { 'Métrica': 'Saldo Máximo', 'Valor': statistics.saldoMaximo },
      { 'Métrica': 'Total Entradas', 'Valor': statistics.totalEntradas },
      { 'Métrica': 'Total Saídas', 'Valor': statistics.totalSaidas },
      { 'Métrica': 'Fluxo Líquido', 'Valor': statistics.fluxoLiquido },
      { 'Métrica': 'Dias com Alerta Baixo', 'Valor': statistics.diasAlertaBaixo },
      { 'Métrica': 'Dias com Alerta Negativo', 'Valor': statistics.diasAlertaNegativo },
      { 'Métrica': 'Total AR', 'Valor': statistics.totalAR },
      { 'Métrica': 'Total AP', 'Valor': statistics.totalAP },
      { 'Métrica': 'Média Entradas Diária', 'Valor': statistics.mediaEntradasDiaria },
      { 'Métrica': 'Média Saídas Diária', 'Valor': statistics.mediaSaidasDiaria }
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(estatisticas), 'Estatísticas');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(projecaoFormatted), 'Projeção Diária');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumoFormatted), 'Resumo Semanal');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(titulosAR), 'Títulos AR');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(titulosAP), 'Títulos AP');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(extrato), 'Extrato Histórico');

    const fileName = `analise_fluxo_caixa_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <button onClick={onReset} className="back-button">
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h2>Dashboard de Análise</h2>
        </div>
        <button onClick={handleExportExcel} className="export-button">
          <Download size={20} />
          <span>Exportar Análise Completa</span>
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<DollarSign size={24} />}
          title="Saldo Inicial"
          value={formatCurrency(statistics.saldoInicial)}
          color="#667eea"
        />
        <StatCard
          icon={<DollarSign size={24} />}
          title="Saldo Final Projetado"
          value={formatCurrency(statistics.saldoFinal)}
          color="#764ba2"
        />
        <StatCard
          icon={statistics.variacao >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          title="Variação"
          value={formatCurrency(statistics.variacao)}
          color={statistics.variacao >= 0 ? '#48bb78' : '#f56565'}
          subtitle={statistics.variacao >= 0 ? 'Positivo' : 'Negativo'}
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          title="Saldo Mínimo"
          value={formatCurrency(statistics.saldoMinimo)}
          color={statistics.saldoMinimo < 0 ? '#f56565' : '#ed8936'}
          subtitle={statistics.diasAlertaNegativo > 0 ? `${statistics.diasAlertaNegativo} dias negativos` : 'Sem alertas'}
        />
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          Visão Geral
        </button>
        <button
          className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <Calendar size={18} />
          Projeção Diária
        </button>
        <button
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          <TrendingUp size={18} />
          Resumo Semanal
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="chart-card">
              <h3>Evolução do Saldo Projetado</h3>
              <SaldoChart data={projecao} reservaMinima={data.config.reservaMinima} />
            </div>

            <div className="metrics-row">
              <div className="metric-card">
                <div className="metric-header">
                  <TrendingUp className="metric-icon positive" />
                  <h4>Total de Entradas</h4>
                </div>
                <p className="metric-value">{formatCurrency(statistics.totalEntradas)}</p>
                <p className="metric-subtitle">Média diária: {formatCurrency(statistics.mediaEntradasDiaria)}</p>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <TrendingDown className="metric-icon negative" />
                  <h4>Total de Saídas</h4>
                </div>
                <p className="metric-value">{formatCurrency(statistics.totalSaidas)}</p>
                <p className="metric-subtitle">Média diária: {formatCurrency(statistics.mediaSaidasDiaria)}</p>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <DollarSign className="metric-icon neutral" />
                  <h4>Fluxo Líquido</h4>
                </div>
                <p className={`metric-value ${statistics.fluxoLiquido >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(statistics.fluxoLiquido)}
                </p>
                <p className="metric-subtitle">
                  {statistics.fluxoLiquido >= 0 ? 'Superávit' : 'Déficit'}
                </p>
              </div>
            </div>

            <div className="chart-card">
              <h3>Distribuição de Entradas e Saídas</h3>
              <FluxoChart data={projecao.slice(0, 30)} />
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="daily-content">
            <div className="chart-card">
              <h3>Projeção Diária Detalhada</h3>
              <SaldoChart data={projecao} reservaMinima={data.config.reservaMinima} />
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Entradas</th>
                    <th>Saídas</th>
                    <th>Fluxo Líquido</th>
                    <th>Saldo Projetado</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projecao.slice(0, 30).map((dia, index) => (
                    <tr key={index} className={dia.alertaNegativo ? 'alert-row' : ''}>
                      <td>{new Date(dia.data).toLocaleDateString('pt-BR')}</td>
                      <td className="positive">{formatCurrency(dia.totalEntradas)}</td>
                      <td className="negative">{formatCurrency(dia.totalSaidas)}</td>
                      <td className={dia.fluxoLiquido >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(dia.fluxoLiquido)}
                      </td>
                      <td className={dia.saldoProjetado < 0 ? 'negative' : ''}>
                        {formatCurrency(dia.saldoProjetado)}
                      </td>
                      <td>
                        {dia.alertaNegativo && <span className="badge badge-danger">Negativo</span>}
                        {!dia.alertaNegativo && dia.alertaBaixo && <span className="badge badge-warning">Baixo</span>}
                        {!dia.alertaNegativo && !dia.alertaBaixo && <span className="badge badge-success">OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="weekly-content">
            <div className="chart-card">
              <h3>Resumo Semanal</h3>
              <SemanalChart data={resumoSemanal} />
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th>Entradas</th>
                    <th>Saídas</th>
                    <th>Fluxo Líquido</th>
                    <th>Saldo Final</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoSemanal.map((semana, index) => (
                    <tr key={index}>
                      <td>{semana.semana}</td>
                      <td className="positive">{formatCurrency(semana.entradas)}</td>
                      <td className="negative">{formatCurrency(semana.saidas)}</td>
                      <td className={semana.fluxoLiquido >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(semana.fluxoLiquido)}
                      </td>
                      <td>{formatCurrency(semana.saldoFinal)}</td>
                      <td>
                        {semana.alertaNegativo && <span className="badge badge-danger">Negativo</span>}
                        {!semana.alertaNegativo && semana.alertaBaixo && <span className="badge badge-warning">Baixo</span>}
                        {!semana.alertaNegativo && !semana.alertaBaixo && <span className="badge badge-success">OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
