import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    } else if (fileExtension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Formato de arquivo não suportado'));
    }
  });
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  if (dateStr instanceof Date) return dateStr;
  
  if (typeof dateStr === 'number') {
    const date = new Date((dateStr - 25569) * 86400 * 1000);
    return date;
  }
  
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/
  ];

  for (let format of formats) {
    if (format.test(dateStr)) {
      const parts = dateStr.split(/[-/]/);
      if (dateStr.includes('-') && parts[0].length === 4) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
  }

  return new Date(dateStr);
};

const calculateSazonalidade = (extrato) => {
  const diasSemana = {};
  
  extrato.forEach(row => {
    const date = parseDate(row.data);
    if (date && !isNaN(date)) {
      const dayOfWeek = date.getDay();
      const entradas = parseFloat(row.entradas) || 0;
      
      if (!diasSemana[dayOfWeek]) {
        diasSemana[dayOfWeek] = [];
      }
      diasSemana[dayOfWeek].push(entradas);
    }
  });

  const mediaPorDia = {};
  let somaTotal = 0;
  let countTotal = 0;

  Object.keys(diasSemana).forEach(dia => {
    const valores = diasSemana[dia];
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    mediaPorDia[dia] = media;
    somaTotal += media;
    countTotal++;
  });

  const mediaGeral = somaTotal / countTotal;
  const sazonalidade = {};

  Object.keys(mediaPorDia).forEach(dia => {
    sazonalidade[dia] = mediaPorDia[dia] / mediaGeral;
  });

  return sazonalidade;
};

const projectCashFlow = (extrato, titulosAR, titulosAP, config) => {
  const ultimoSaldo = parseFloat(extrato[extrato.length - 1].saldo_dia) || 0;
  const ultimaData = parseDate(extrato[extrato.length - 1].data);
  
  const mediaEntradas = extrato.slice(-30).reduce((sum, row) => 
    sum + (parseFloat(row.entradas) || 0), 0) / Math.min(30, extrato.length);
  
  const mediaSaidas = extrato.slice(-30).reduce((sum, row) => 
    sum + (parseFloat(row.saidas) || 0), 0) / Math.min(30, extrato.length);

  const sazonalidade = calculateSazonalidade(extrato);
  
  const projecao = [];
  let saldoAtual = ultimoSaldo;

  for (let i = 1; i <= config.horizonDays; i++) {
    const data = new Date(ultimaData);
    data.setDate(data.getDate() + i);
    
    const dayOfWeek = data.getDay();
    const fatorSazon = sazonalidade[dayOfWeek] || 1.0;
    
    let entradasRecorrentes = mediaEntradas * fatorSazon;
    let recebimentosAR = 0;
    let saidasRecorrentes = mediaSaidas;
    let pagamentosAP = 0;

    titulosAR.forEach(titulo => {
      const vencimento = parseDate(titulo.vencimento);
      const valor = parseFloat(titulo.valor) || 0;
      
      if (vencimento && !isNaN(vencimento)) {
        const diffDays = Math.floor((data - vencimento) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          recebimentosAR += valor * config.pctVencimento;
        } else if (diffDays === config.diasTolerancia) {
          recebimentosAR += valor * config.pctAposTolerancia;
        }
      }
    });

    titulosAP.forEach(titulo => {
      const vencimento = parseDate(titulo.vencimento);
      const valor = parseFloat(titulo.valor) || 0;
      
      if (vencimento && !isNaN(vencimento)) {
        const diffDays = Math.floor((data - vencimento) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          pagamentosAP += valor;
        }
      }
    });

    const totalEntradas = entradasRecorrentes + recebimentosAR;
    const totalSaidas = saidasRecorrentes + pagamentosAP;
    const fluxoLiquido = totalEntradas - totalSaidas;
    
    saldoAtual += fluxoLiquido;

    projecao.push({
      data: data.toISOString().split('T')[0],
      dataObj: data,
      entradasRecorrentes,
      recebimentosAR,
      totalEntradas,
      saidasRecorrentes,
      pagamentosAP,
      totalSaidas,
      fluxoLiquido,
      saldoProjetado: saldoAtual,
      alertaBaixo: saldoAtual < config.reservaMinima,
      alertaNegativo: saldoAtual < 0
    });
  }

  return projecao;
};

const calculateStatistics = (projecao, extrato, titulosAR, titulosAP) => {
  const saldoInicial = parseFloat(extrato[extrato.length - 1].saldo_dia) || 0;
  const saldoFinal = projecao[projecao.length - 1].saldoProjetado;
  const saldoMinimo = Math.min(...projecao.map(p => p.saldoProjetado));
  const saldoMaximo = Math.max(...projecao.map(p => p.saldoProjetado));
  
  const totalEntradas = projecao.reduce((sum, p) => sum + p.totalEntradas, 0);
  const totalSaidas = projecao.reduce((sum, p) => sum + p.totalSaidas, 0);
  
  const diasAlertaBaixo = projecao.filter(p => p.alertaBaixo).length;
  const diasAlertaNegativo = projecao.filter(p => p.alertaNegativo).length;

  const totalAR = titulosAR.reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
  const totalAP = titulosAP.reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);

  return {
    saldoInicial,
    saldoFinal,
    variacao: saldoFinal - saldoInicial,
    saldoMinimo,
    saldoMaximo,
    totalEntradas,
    totalSaidas,
    fluxoLiquido: totalEntradas - totalSaidas,
    diasAlertaBaixo,
    diasAlertaNegativo,
    totalAR,
    totalAP,
    mediaEntradasDiaria: totalEntradas / projecao.length,
    mediaSaidasDiaria: totalSaidas / projecao.length
  };
};

const groupByWeek = (projecao) => {
  const weeks = {};
  
  projecao.forEach(dia => {
    const date = new Date(dia.dataObj);
    const weekNum = getWeekNumber(date);
    const year = date.getFullYear();
    const key = `${year}-W${weekNum}`;
    
    if (!weeks[key]) {
      weeks[key] = {
        semana: key,
        entradas: 0,
        saidas: 0,
        fluxoLiquido: 0,
        saldoFinal: 0,
        alertaBaixo: false,
        alertaNegativo: false
      };
    }
    
    weeks[key].entradas += dia.totalEntradas;
    weeks[key].saidas += dia.totalSaidas;
    weeks[key].fluxoLiquido += dia.fluxoLiquido;
    weeks[key].saldoFinal = dia.saldoProjetado;
    weeks[key].alertaBaixo = weeks[key].alertaBaixo || dia.alertaBaixo;
    weeks[key].alertaNegativo = weeks[key].alertaNegativo || dia.alertaNegativo;
  });
  
  return Object.values(weeks);
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

export const processFluxoCaixa = async (files) => {
  try {
    const [extratoData, titulosARData, titulosAPData] = await Promise.all([
      parseFile(files.extrato),
      parseFile(files.titulosAR),
      parseFile(files.titulosAP)
    ]);

    const titulosARAbertos = titulosARData.filter(t => 
      t.status && t.status.toLowerCase() === 'aberto'
    );
    
    const titulosAPAbertos = titulosAPData.filter(t => 
      t.status && t.status.toLowerCase() === 'aberto'
    );

    const config = {
      horizonDays: 60,
      pctVencimento: 0.7,
      pctAposTolerancia: 0.3,
      diasTolerancia: 3,
      reservaMinima: 10000
    };

    const projecao = projectCashFlow(
      extratoData,
      titulosARAbertos,
      titulosAPAbertos,
      config
    );

    const statistics = calculateStatistics(
      projecao,
      extratoData,
      titulosARAbertos,
      titulosAPAbertos
    );

    const resumoSemanal = groupByWeek(projecao);

    return {
      projecao,
      statistics,
      resumoSemanal,
      extrato: extratoData,
      titulosAR: titulosARAbertos,
      titulosAP: titulosAPAbertos,
      config
    };
  } catch (error) {
    throw new Error(`Erro ao processar arquivos: ${error.message}`);
  }
};
