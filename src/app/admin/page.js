'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminPanel() {
  const [pastorais, setPastorais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields state
  const [currentId, setCurrentId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [description, setDescription] = useState('');
  const [coordinators, setCoordinators] = useState('');
  const [contact, setContact] = useState('');
  
  // File upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('/images/default.png');
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [existingLogoUrl, setExistingLogoUrl] = useState('');

  // Fetch pastorals list
  const loadPastorais = async () => {
    try {
      const res = await fetch('/api/pastorais');
      if (res.ok) {
        const data = await res.json();
        setPastorais(data);
      }
    } catch (err) {
      console.error('Error fetching pastorals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPastorais();
  }, []);

  const openCreateForm = () => {
    setCurrentId('');
    setName('');
    setCategory('Geral');
    setDescription('');
    setCoordinators('');
    setContact('');
    setImageFile(null);
    setImagePreview('/images/default.png');
    setExistingImageUrl('');
    setLogoFile(null);
    setLogoPreview('');
    setExistingLogoUrl('');
    setFormOpen(true);
  };

  const openEditForm = (pastoral) => {
    setCurrentId(pastoral.id);
    setName(pastoral.name);
    setCategory(pastoral.category || 'Geral');
    setDescription(pastoral.description || '');
    setCoordinators(pastoral.coordinators || '');
    setContact(pastoral.contact || '');
    setImageFile(null);
    setImagePreview(pastoral.image || '/images/default.png');
    setExistingImageUrl(pastoral.image || '');
    setLogoFile(null);
    setLogoPreview(pastoral.logo || '');
    setExistingLogoUrl(pastoral.logo || '');
    setFormOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create local URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      // Create local URL for preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Deseja realmente excluir a pastoral "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pastorais?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Pastoral excluída com sucesso!');
        loadPastorais();
      } else {
        const data = await res.json();
        alert('Erro ao excluir: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao excluir.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('O nome da pastoral é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (currentId) formData.append('id', currentId);
      formData.append('name', name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('coordinators', coordinators);
      formData.append('contact', contact);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (existingImageUrl) {
        formData.append('image', existingImageUrl);
      }

      if (logoFile) {
        formData.append('logo', logoFile);
      } else if (existingLogoUrl) {
        formData.append('logo', existingLogoUrl);
      }

      const res = await fetch('/api/pastorais', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(currentId ? 'Pastoral atualizada com sucesso!' : 'Pastoral cadastrada com sucesso!');
        setFormOpen(false);
        loadPastorais();
      } else {
        const data = await res.json();
        alert('Erro ao salvar: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando administração...</p>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Painel de Controle</h1>
          <p>Cadastre e gerencie os slides das pastorais da paróquia.</p>
        </div>
        <div className={styles.headerButtons}>
          <Link href="/" className={styles.btn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar ao Menu
          </Link>
          <button onClick={openCreateForm} className={`${styles.btn} ${styles.btnPrimary}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Pastoral
          </button>
        </div>
      </div>

      {/* Database pastorals table */}
      <div className={`${styles.tableCard} glass`}>
        <div className={styles.tableHeader}>
          <h2>Lista de Pastorais ({pastorais.length})</h2>
        </div>
        
        {pastorais.length === 0 ? (
          <div className={styles.form} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma pastoral cadastrada. Clique em &quot;Nova Pastoral&quot; para começar.
          </div>
        ) : (
          <div className={styles.list}>
            {pastorais.map((pastoral) => (
              <div key={pastoral.id} className={styles.listItem}>
                <div className={styles.pastoralInfo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pastoral.image}
                    alt={pastoral.name}
                    className={styles.thumbnail}
                  />
                  <div className={styles.details}>
                    <div className={styles.name}>{pastoral.name}</div>
                    <div className={styles.meta}>
                      {pastoral.coordinators && (
                        <span>Coord: {pastoral.coordinators}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button onClick={() => openEditForm(pastoral)} className={styles.btn}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(pastoral.id, pastoral.name)} className={`${styles.btn} ${styles.btnDanger}`}>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {formOpen && (
        <div className={styles.modalOverlay} onClick={() => !saving && setFormOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h3>{currentId ? 'Editar Pastoral' : 'Cadastrar Nova Pastoral'}</h3>
              <button className={styles.closeBtn} onClick={() => !saving && setFormOpen(false)} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.form}>
                
                {/* Image upload area with preview */}
                <div className={styles.formGroup}>
                  <label>Imagem de Capa (Resolução sugerida: 16:9)</label>
                  <div className={styles.imageUploadArea}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.previewThumb}
                    />
                    <div className={styles.uploadTrigger}>
                      <input
                        type="file"
                        id="imageInput"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                        disabled={saving}
                      />
                      <label htmlFor="imageInput" className={styles.fileLabel}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        Selecionar Imagem
                      </label>
                      <span className={styles.uploadHelp}>Formatos aceitos: JPG, PNG, WEBP.</span>
                    </div>
                  </div>
                </div>

                {/* Logo upload area with preview */}
                <div className={styles.formGroup}>
                  <label>Logomarca / Ícone da Pastoral (Quadrado ou transparente)</label>
                  <div className={styles.imageUploadArea}>
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className={styles.previewThumb}
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <div className={styles.previewThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Sem Logo
                      </div>
                    )}
                    <div className={styles.uploadTrigger}>
                      <input
                        type="file"
                        id="logoInput"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className={styles.fileInput}
                        disabled={saving}
                      />
                      <label htmlFor="logoInput" className={styles.fileLabel}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        Selecionar Logo
                      </label>
                      <span className={styles.uploadHelp}>Formatos aceitos: JPG, PNG, WEBP.</span>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="nameInput">Nome da Pastoral</label>
                  <input
                    type="text"
                    id="nameInput"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Pastoral da Criança"
                    className={styles.input}
                    required
                    disabled={saving}
                  />
                </div>


                {/* Description / Activities */}
                <div className={styles.formGroup}>
                  <label htmlFor="descTextarea">Descrição / Atividades</label>
                  <textarea
                    id="descTextarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva as atividades, objetivos e horários dos encontros desta pastoral..."
                    className={styles.textarea}
                    disabled={saving}
                  />
                </div>

                {/* Coordinators */}
                <div className={styles.formGroup}>
                  <label htmlFor="coordsInput">Coordenadores</label>
                  <input
                    type="text"
                    id="coordsInput"
                    value={coordinators}
                    onChange={(e) => setCoordinators(e.target.value)}
                    placeholder="Ex: João e Maria"
                    className={styles.input}
                    disabled={saving}
                  />
                </div>

                {/* Contact */}
                <div className={styles.formGroup}>
                  <label htmlFor="contactInput">Informações de Contato / Inscrições</label>
                  <input
                    type="text"
                    id="contactInput"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Ex: (11) 98765-4321 / pastoral@email.com"
                    className={styles.input}
                    disabled={saving}
                  />
                </div>

              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className={styles.btn}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </main>
  );
}
