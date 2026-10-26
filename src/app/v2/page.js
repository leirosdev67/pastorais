'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import styles from './v2.module.css';

export default function PastoralV2Page() {
  const [pastorais, setPastorais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPastoralId, setSelectedPastoralId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const cardRefs = useRef({});

  // Fetch pastorais from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/pastorais');
        if (res.ok) {
          const data = await res.json();
          setPastorais(data || []);
        }
      } catch (err) {
        console.error('Erro ao carregar pastorais na V2:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle URL query param sync for seamless back button support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const initialId = params.get('pastoral') || params.get('id');
    if (initialId) {
      setSelectedPastoralId(initialId);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const pastoralId = currentParams.get('pastoral') || currentParams.get('id');
      setSelectedPastoralId(pastoralId || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard navigation: Escape to go back to mosaic, Left/Right for prev/next
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPastoralId) return;

      if (e.key === 'Escape') {
        handleBackToMosaic();
      } else if (e.key === 'ArrowLeft') {
        handleNavigateAdjacent(-1);
      } else if (e.key === 'ArrowRight') {
        handleNavigateAdjacent(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPastoralId, pastorais]);

  // Open pastoral details
  const handleSelectPastoral = (id) => {
    setSelectedPastoralId(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('pastoral', id);
      window.history.pushState({ pastoralId: id }, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // BOTÃO DE VOLTAR: Return to mosaic view
  const handleBackToMosaic = () => {
    const lastId = selectedPastoralId;
    setSelectedPastoralId(null);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('pastoral');
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));

      // Restore scroll to the pastoral card previously clicked
      setTimeout(() => {
        if (lastId && cardRefs.current[lastId]) {
          cardRefs.current[lastId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  // Navigate adjacent pastorals while staying in detail view
  const handleNavigateAdjacent = (direction) => {
    if (!selectedPastoralId || pastorais.length <= 1) return;
    const currentIndex = pastorais.findIndex((p) => String(p.id) === String(selectedPastoralId));
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = pastorais.length - 1;
    if (nextIndex >= pastorais.length) nextIndex = 0;

    const nextPastoral = pastorais[nextIndex];
    if (nextPastoral) {
      handleSelectPastoral(nextPastoral.id);
    }
  };

  // Categories extraction and counters
  const categoriesList = useMemo(() => {
    const map = { Todas: pastorais.length };
    pastorais.forEach((p) => {
      const cat = p.category?.trim() || 'Geral';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [pastorais]);

  // Filtered pastorals for the mosaic
  const filteredPastorais = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return pastorais.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todas' ||
        (p.category?.trim() || 'Geral').toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;
      if (!q) return true;

      const nameMatch = p.name?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const coordMatch = p.coordinators?.toLowerCase().includes(q);
      const catMatch = p.category?.toLowerCase().includes(q);

      return nameMatch || descMatch || coordMatch || catMatch;
    });
  }, [pastorais, searchQuery, selectedCategory]);

  // Currently selected pastoral object
  const currentPastoral = useMemo(() => {
    if (!selectedPastoralId) return null;
    return pastorais.find((p) => String(p.id) === String(selectedPastoralId)) || null;
  }, [pastorais, selectedPastoralId]);

  const currentIndex = useMemo(() => {
    if (!selectedPastoralId) return -1;
    return pastorais.findIndex((p) => String(p.id) === String(selectedPastoralId));
  }, [pastorais, selectedPastoralId]);

  // Helper: WhatsApp details
  const getWhatsAppDetails = (contactStr) => {
    if (!contactStr) return null;
    const digits = contactStr.replace(/\D/g, '');
    if (digits.length < 10) return null;

    let phone = digits;
    if (phone.length === 10 || phone.length === 11) {
      phone = '55' + phone;
    }

    const prefillText = 'Oi, vi que é o contato da coordenação da pastoral de Candelária. Gostaria de informações.';
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(prefillText)}`;

    const localDigits = phone.startsWith('55') ? phone.slice(2) : phone;
    let formatted = phone;
    if (localDigits.length === 11) {
      formatted = `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
    } else if (localDigits.length === 10) {
      formatted = `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
    }

    return { phone, formatted, link };
  };

  // Helper: Email details
  const getEmailDetails = (contactStr) => {
    if (!contactStr) return null;
    const emailMatch = contactStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      return {
        email: emailMatch[0],
        link: `mailto:${emailMatch[0]}?subject=${encodeURIComponent(
          `Informações - ${currentPastoral?.name || 'Pastoral'} - Paróquia de Candelária`
        )}`,
      };
    }
    return null;
  };

  const whatsappInfo = currentPastoral ? getWhatsAppDetails(currentPastoral.contact) : null;
  const emailInfo = currentPastoral ? getEmailDetails(currentPastoral.contact) : null;

  return (
    <div className={styles.pageShell}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* Persistent Brand Header */}
        <header className={styles.topBar}>
          <div
            className={styles.brand}
            onClick={selectedPastoralId ? handleBackToMosaic : undefined}
            role="button"
            tabIndex={0}
            aria-label="Ir para o início do Mosaico"
          >
            <div className={styles.brandIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M12 2v20M7 8h10" />
              </svg>
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Paróquia de Candelária</span>
              <span className={styles.brandSubtitle}>
                Guia das Pastorais <span className={styles.versionBadge}>V2 Mosaico</span>
              </span>
            </div>
          </div>

          <div className={styles.topActions}>
            <Link href="/v1" className={styles.v1SwitchLink} title="Acessar versão anterior em carrossel">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="m9 8 6 4-6 4Z" />
              </svg>
              <span>Ver V1 (Carrossel)</span>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Carregando pastorais...</p>
          </div>
        ) : selectedPastoralId && currentPastoral ? (
          /* ================================================================
             DETAIL VIEW: VISUALIZAR INFORMAÇÕES DA PASTORAL + BOTÃO DE VOLTAR
             ================================================================ */
          <section className={styles.detailViewContainer} aria-label="Detalhes da pastoral">
            {/* Top Navigation Bar with the Back Button */}
            <div className={styles.detailNavBar}>
              <button
                onClick={handleBackToMosaic}
                className={styles.backButton}
                aria-label="Voltar para o mosaico de pastorais"
                id="btn-voltar-mosaico"
              >
                <svg
                  className={styles.backIcon}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Voltar ao Mosaico</span>
              </button>

              {/* Prev / Next Fast Navigator */}
              {pastorais.length > 1 && (
                <div className={styles.detailPager}>
                  <button
                    onClick={() => handleNavigateAdjacent(-1)}
                    className={styles.pagerBtn}
                    aria-label="Pastoral anterior"
                    title="Pastoral anterior (Seta esquerda)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span className={styles.pagerCounter}>
                    {currentIndex + 1} / {pastorais.length}
                  </span>
                  <button
                    onClick={() => handleNavigateAdjacent(1)}
                    className={styles.pagerBtn}
                    aria-label="Próxima pastoral"
                    title="Próxima pastoral (Seta direita)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Main Detail Presentation Card */}
            <article className={styles.detailCard}>
              {/* Responsive Hero Photo with ambient blurred background */}
              <div className={styles.detailHeroPhotoWrapper}>
                {currentPastoral.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPastoral.image}
                      alt=""
                      aria-hidden="true"
                      className={styles.detailHeroBlur}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPastoral.image}
                      alt={currentPastoral.name}
                      className={styles.detailHeroImg}
                    />
                  </>
                ) : (
                  <div className={styles.detailHeroFallback}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2v20M7 8h10" />
                    </svg>
                    <span>Foto em breve</span>
                  </div>
                )}

                <div className={styles.detailHeroOverlayTop} />
                <div className={styles.detailHeroOverlayBottom} />

                {currentPastoral.category && (
                  <span className={styles.detailCategoryTag}>{currentPastoral.category}</span>
                )}
              </div>

              {/* Information Content Body */}
              <div className={styles.detailInfoBody}>
                <div className={styles.detailHeaderRow}>
                  <h1 className={styles.detailTitle}>{currentPastoral.name}</h1>

                  {currentPastoral.logo && (
                    <div className={styles.detailLogoWrapper} title={`Logo ${currentPastoral.name}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentPastoral.logo}
                        alt={`Logo ${currentPastoral.name}`}
                        className={styles.detailLogoImg}
                      />
                    </div>
                  )}
                </div>

                {/* Coordinators Badge */}
                {currentPastoral.coordinators && (
                  <div className={styles.coordinatorsCard}>
                    <div className={styles.coordIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className={styles.coordContent}>
                      <span className={styles.coordLabel}>Coordenação Responsável</span>
                      <span className={styles.coordNames}>{currentPastoral.coordinators}</span>
                    </div>
                  </div>
                )}

                {/* About and Activities */}
                <div className={styles.descBlock}>
                  <h2 className={styles.blockTitle}>Sobre a Pastoral e Atividades</h2>
                  <p className={styles.descriptionParagraph}>
                    {currentPastoral.description ||
                      'Esta pastoral atua no acolhimento, evangelização e serviço comunitário na Paróquia Nossa Senhora da Candelária. Venha conhecer e participar dos nossos encontros!'}
                  </p>
                </div>

                {/* Direct Action Contact */}
                <div className={styles.contactBlock}>
                  {whatsappInfo ? (
                    <a
                      href={whatsappInfo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappButton}
                    >
                      <svg className={styles.whatsappIcon} width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      <div className={styles.whatsappContent}>
                        <span className={styles.whatsappTitle}>Falar com a Coordenação</span>
                        <span className={styles.whatsappSubtitle}>Toque para abrir conversa no WhatsApp</span>
                      </div>
                    </a>
                  ) : (
                    <div className={styles.noPhoneNotice}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>Informações de contato disponíveis na secretaria da Paróquia.</span>
                    </div>
                  )}

                  {emailInfo && (
                    <div className={styles.emailContactNotice}>
                      Ou envie um e-mail:{' '}
                      <a href={emailInfo.link} className={styles.emailLink}>
                        {emailInfo.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </article>

            {/* Bottom Secondary Back Action */}
            <div className={styles.bottomBackRow}>
              <button onClick={handleBackToMosaic} className={styles.bottomBackBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Voltar ao Mosaico de Pastorais</span>
              </button>
            </div>
          </section>
        ) : (
          /* ================================================================
             MOSAIC VIEW: GRID DE PASTORAIS COM BUSCA E FILTROS
             ================================================================ */
          <main className={styles.mosaicHeader}>
            <div className={styles.mosaicIntro}>
              <h1 className={styles.mosaicMainTitle}>Mosaico das Pastorais</h1>
              <p className={styles.mosaicSubtitle}>
                Selecione uma pastoral abaixo para visualizar todas as informações, atividades e contatos da coordenação.
              </p>
            </div>

            {/* Search and Category Filters */}
            <section className={styles.toolbar} aria-label="Ferramentas de busca e filtro">
              <div className={styles.searchBox}>
                <svg
                  className={styles.searchIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar pastoral por nome ou tema..."
                  className={styles.searchInput}
                  aria-label="Buscar pastoral"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={styles.clearSearchBtn}
                    aria-label="Limpar busca"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dynamic Category Chips */}
              {categoriesList.length > 1 && (
                <nav className={styles.categoryNav} aria-label="Filtrar por categoria">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`${styles.catChip} ${selectedCategory === cat.name ? styles.catChipActive : ''}`}
                    >
                      <span>{cat.name}</span>
                      <span className={styles.catCount}>{cat.count}</span>
                    </button>
                  ))}
                </nav>
              )}
            </section>

            {/* Meta bar */}
            <div className={styles.resultsMeta}>
              <span>
                Mostrando <strong>{filteredPastorais.length}</strong> de {pastorais.length} pastorais
              </span>
              {selectedCategory !== 'Todas' && (
                <button
                  onClick={() => setSelectedCategory('Todas')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                  }}
                >
                  Limpar filtro ({selectedCategory})
                </button>
              )}
            </div>

            {/* The Mosaic Cards Grid */}
            <section className={styles.mosaicGrid} aria-label="Mosaico de pastorais">
              {filteredPastorais.length === 0 ? (
                <div className={styles.emptyGridState}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className={styles.emptyStateTitle}>Nenhuma pastoral encontrada</p>
                  <p className={styles.emptyStateText}>
                    Não encontramos nenhuma pastoral com os critérios &ldquo;{searchQuery}&rdquo;. Tente buscar por outro termo.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Todas');
                    }}
                    className={styles.emptyResetBtn}
                  >
                    Restaurar todas as pastorais
                  </button>
                </div>
              ) : (
                filteredPastorais.map((p) => {
                  const hasPhone = p.contact && p.contact.replace(/\D/g, '').length >= 10;
                  return (
                    <button
                      key={p.id}
                      ref={(el) => {
                        cardRefs.current[p.id] = el;
                      }}
                      onClick={() => handleSelectPastoral(p.id)}
                      className={styles.pastoralCard}
                      aria-label={`Ver detalhes da ${p.name}`}
                    >
                      {/* Card Cover with Image & Emblem */}
                      <div className={styles.cardCoverWrapper}>
                        {p.image ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image}
                              alt=""
                              aria-hidden="true"
                              className={styles.cardCoverBlur}
                            />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image}
                              alt={p.name}
                              className={styles.cardCoverImg}
                            />
                          </>
                        ) : (
                          <div className={styles.cardCoverFallback}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M12 2v20M7 8h10" />
                            </svg>
                          </div>
                        )}

                        {/* Category Badge */}
                        {p.category && (
                          <span className={styles.cardCategoryBadge}>{p.category}</span>
                        )}

                        {/* Logo Emblem badge if present */}
                        {p.logo && (
                          <div className={styles.cardLogoEmblem} title={`Logo ${p.name}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.logo} alt="" className={styles.cardLogoImg} />
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className={styles.cardContent}>
                        <h2 className={styles.cardTitle}>{p.name}</h2>

                        {p.coordinators && (
                          <div className={styles.cardCoord}>
                            <svg
                              className={styles.cardCoordIcon}
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            <span className={styles.cardCoordText}>{p.coordinators}</span>
                          </div>
                        )}

                        <p className={styles.cardSnippet}>
                          {p.description || 'Toque para conferir mais informações e atividades desta pastoral.'}
                        </p>

                        <div className={styles.cardFooter}>
                          <span className={styles.cardActionPrompt}>
                            Ver informações
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </span>

                          {hasPhone && (
                            <span className={styles.cardWhatsAppIndicator} title="Contato direto via WhatsApp disponível">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  );
}
