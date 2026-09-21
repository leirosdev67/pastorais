'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './painel.module.css';

const ADMIN_PASSWORD = 'pnsc2026';

export default function ProtectedAdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [pastorais, setPastorais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [currentId, setCurrentId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [description, setDescription] = useState('');
  const [coordinators, setCoordinators] = useState('');
  const [contact, setContact] = useState('');

  // Files & Previews
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('/images/default.png');
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [existingLogoUrl, setExistingLogoUrl] = useState('');

  // Check existing session
  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem('pnsc_admin_auth');
      if (storedAuth === ADMIN_PASSWORD) {
        setAuthenticated(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthChecking(false);
    }
  }, []);

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
    if (authenticated) {
      loadPastorais();
    }
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem('pnsc_admin_auth', ADMIN_PASSWORD);
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta. Acesso restrito à coordenação.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pnsc_admin_auth');
    setAuthenticated(false);
    setInputPassword('');
    setLoginError('');
  };

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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleDelete = async (id, pastoralName) => {
    if (!confirm(`Deseja realmente excluir a pastoral "${pastoralName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pastorais?id=${id}`, {
        method: 'DELETE',
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
        body: formData,
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

  // Initial loading while checking session
  if (authChecking) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Password Login Screen
  if (!authenticated) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className={styles.loginTitle}>Acesso Administrativo</h1>
          <p className={styles.loginSubtitle}>
            Paróquia Nossa Senhora da Candelária.<br />
            Informe a senha de gestão para continuar.
          </p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="Digite a senha"
                className={styles.passwordInput}
                autoFocus
                required
              />
              <button
                type="button"
                className={styles.togglePassBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {loginError && (
              <div className={styles.errorBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className={styles.loginSubmitBtn}>
              Entrar no Painel
            </button>
          </form>

          <Link href="/" className={styles.backHomeLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  // Loading pastorals after authentication
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Carregando administração...</p>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Gestão das Pastorais</h1>
          <p>Cadastre, edite informações e gerencie fotos e contatos.</p>
        </div>
        <div className={styles.headerButtons}>
          <Link href="/" className={styles.btn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Ver Site
          </Link>
          <button onClick={openCreateForm} className={`${styles.btn} ${styles.btnPrimary}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Pastoral
          </button>
          <button onClick={handleLogout} className={`${styles.btn} ${styles.btnDanger}`} title="Encerrar sessão">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </div>

      {/* Database pastorals table */}
      <div className={`${styles.tableCard} glass`}>
        <div className={styles.tableHeader}>
          <h2>Lista de Pastorais Cadastradas ({pastorais.length})</h2>
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
                    src={pastoral.image || '/images/default.png'}
                    alt={pastoral.name}
                    className={styles.thumbnail}
                  />
                  <div className={styles.details}>
                    <div className={styles.name}>{pastoral.name}</div>
                    <div className={styles.meta}>
                      {pastoral.category && (
                        <span className={styles.categoryTag}>{pastoral.category}</span>
                      )}
                      {pastoral.coordinators && <span>Coord: {pastoral.coordinators}</span>}
                      {pastoral.contact && <span>Contato: {pastoral.contact}</span>}
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button onClick={() => openEditForm(pastoral)} className={styles.btn}>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pastoral.id, pastoral.name)}
                    className={`${styles.btn} ${styles.btnDanger}`}
                  >
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
              <button
                className={styles.closeBtn}
                onClick={() => !saving && setFormOpen(false)}
                aria-label="Fechar"
              >
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
                  <label>Imagem de Capa (Foto superior exibida no celular)</label>
                  <div className={styles.imageUploadArea}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className={styles.previewThumb} />
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
                  <label>Logomarca / Ícone (Opcional)</label>
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
                      <div
                        className={styles.previewThumb}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                        }}
                      >
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

                {/* Category */}
                <div className={styles.formGroup}>
                  <label htmlFor="categoryInput">Categoria / Segmento</label>
                  <input
                    type="text"
                    id="categoryInput"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Social, Jovem, Litúrgica, Familiar..."
                    className={styles.input}
                    disabled={saving}
                  />
                </div>

                {/* Description / Activities */}
                <div className={styles.formGroup}>
                  <label htmlFor="descTextarea">Descrição e Atividades</label>
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

                {/* Contact / WhatsApp */}
                <div className={styles.formGroup}>
                  <label htmlFor="contactInput">Telefone de Contato / WhatsApp</label>
                  <input
                    type="text"
                    id="contactInput"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Ex: (84) 99609-8049"
                    className={styles.input}
                    disabled={saving}
                  />
                  <span className={styles.uploadHelp}>
                    Este telefone gerará o botão automático do WhatsApp com a mensagem pré-definida.
                  </span>
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
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Pastoral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
