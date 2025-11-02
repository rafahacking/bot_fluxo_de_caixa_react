import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ onFilesUpload, loading, error }) => {
  const [files, setFiles] = useState({
    extrato: null,
    titulosAR: null,
    titulosAP: null
  });

  const handleFileChange = (type, file) => {
    setFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!files.extrato || !files.titulosAR || !files.titulosAP) {
      alert('Por favor, envie todos os arquivos necessários');
      return;
    }

    onFilesUpload(files);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(type, file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="file-upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <Upload size={48} className="upload-icon" />
          <h2>Envie seus Arquivos</h2>
          <p>Faça upload dos arquivos CSV ou XLSX para análise</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-group">
            <label className="file-label">
              <FileText size={20} />
              <span>Extrato Histórico</span>
              <span className="file-required">*</span>
            </label>
            <div 
              className="file-drop-zone"
              onDrop={(e) => handleDrop(e, 'extrato')}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => handleFileChange('extrato', e.target.files[0])}
                id="extrato"
              />
              <label htmlFor="extrato" className="drop-label">
                {files.extrato ? (
                  <span className="file-selected">{files.extrato.name}</span>
                ) : (
                  <span>Clique ou arraste o arquivo aqui</span>
                )}
              </label>
            </div>
          </div>

          <div className="file-input-group">
            <label className="file-label">
              <FileText size={20} />
              <span>Títulos a Receber (AR)</span>
              <span className="file-required">*</span>
            </label>
            <div 
              className="file-drop-zone"
              onDrop={(e) => handleDrop(e, 'titulosAR')}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => handleFileChange('titulosAR', e.target.files[0])}
                id="titulosAR"
              />
              <label htmlFor="titulosAR" className="drop-label">
                {files.titulosAR ? (
                  <span className="file-selected">{files.titulosAR.name}</span>
                ) : (
                  <span>Clique ou arraste o arquivo aqui</span>
                )}
              </label>
            </div>
          </div>

          <div className="file-input-group">
            <label className="file-label">
              <FileText size={20} />
              <span>Títulos a Pagar (AP)</span>
              <span className="file-required">*</span>
            </label>
            <div 
              className="file-drop-zone"
              onDrop={(e) => handleDrop(e, 'titulosAP')}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => handleFileChange('titulosAP', e.target.files[0])}
                id="titulosAP"
              />
              <label htmlFor="titulosAP" className="drop-label">
                {files.titulosAP ? (
                  <span className="file-selected">{files.titulosAP.name}</span>
                ) : (
                  <span>Clique ou arraste o arquivo aqui</span>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !files.extrato || !files.titulosAR || !files.titulosAP}
          >
            {loading ? 'Processando...' : 'Analisar Dados'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;
