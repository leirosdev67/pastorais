'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './home.module.css';

export default function MobilePastoralHome() {
  const [pastorais, setPastorais] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const chipsRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Fetch pastorais
  useEffect(() => {
    async function fetchPastorais() {
      try {
        const res = await fetch('/api/pastorais');
        if (res.ok) {
          const data = await res.json();
          setPastorais(data || []);
        }
      } catch (err) {
        console.error('Erro ao carregar pastorais:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPastorais();
  }, []);

  // Keyboard navigation (left/right arrows)
  useEffect(() => {
    function handleKeyDown(e) {
      if (pastorais.length === 0) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pastorais.length, currentIndex]);

  // Scroll active chip into view smoothly
  useEffect(() => {
    if (chipsRef.current) {
      const activeEl = chipsRef.current.children[currentIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (pastorais.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % pastorais.length);
  };

  const handlePrev = () => {
    if (pastorais.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + pastorais.length) % pastorais.length);
  };

  // Touch swipe support on hero photo
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndXRef.current = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndXRef.current;
    if (diffX > 50) {
      handleNext();
    } else if (diffX < -50) {
      handlePrev();
    }
  };

  const currentPastoral = pastorais[currentIndex];

  // Helper: WhatsApp URL extractor & formatter
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

  // Helper: Email extractor if contact has email
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
    <div className={styles.viewportWrapper}>
      <div className={styles.mobileContainer}>
        {/* Top App Bar */}
        <header className={styles.topBar}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v20M7 8h10" />
              </svg>
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Paróquia de Candelária</span>
              <span className={styles.brandSubtitle}>Guia das Pastorais</span>
            </div>
          </div>
        </header>

        {/* Pastoral Chips Quick Selector */}
        {pastorais.length > 0 && (
          <nav className={styles.chipsNav} ref={chipsRef} aria-label="Seletor rápido de pastorais">
            {pastorais.map((p, index) => (
              <button
                key={p.id || index}
                onClick={() => setCurrentIndex(index)}
                className={`${styles.chip} ${index === currentIndex ? styles.chipActive : ''}`}
              >
                {p.name}
              </button>
            ))}
          </nav>
        )}

        {/* Loading and Empty states */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Carregando pastorais...</p>
          </div>
        ) : pastorais.length === 0 ? (
          <div className={styles.loadingState}>
            <p>Nenhuma pastoral cadastrada no momento.</p>
          </div>
        ) : (
          /* Main Mobile Presentation */
          <main className={styles.mainView}>
            {/* Upper Section: Responsive Photo on Top */}
            <div
              className={styles.heroPhotoWrapper}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Blurred ambient background to fit any screen size without distortion */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPastoral.image || '/images/default.jpg'}
                alt=""
                aria-hidden="true"
                className={styles.heroPhotoBlur}
              />
              {/* Main crisp image, preserved in its natural aspect ratio */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={currentPastoral.id}
                src={currentPastoral.image || '/images/default.jpg'}
                alt={currentPastoral.name}
                className={styles.heroPhoto}
              />
              <div className={styles.heroOverlayTop} />
              <div className={styles.heroOverlayBottom} />

              {currentPastoral.category && (
                <span className={styles.categoryTag}>{currentPastoral.category}</span>
              )}

              <span className={styles.counterBadge}>
                {currentIndex + 1} de {pastorais.length}
              </span>

              {/* Next / Prev Navigation Buttons */}
              {pastorais.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className={`${styles.heroNavBtn} ${styles.heroPrevBtn}`}
                    aria-label="Pastoral anterior"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className={`${styles.heroNavBtn} ${styles.heroNextBtn}`}
                    aria-label="Próxima pastoral"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Lower Section: Pastoral Information Below Photo */}
            <div className={styles.infoSheet}>
              <div className={styles.dragPill} />

              <div className={styles.pastoralHeader}>
                <h1 className={styles.pastoralTitle}>{currentPastoral.name}</h1>
                {currentPastoral.logo && (
                  <div className={styles.pastoralLogoWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPastoral.logo}
                      alt={`Logo ${currentPastoral.name}`}
                      className={styles.pastoralLogo}
                    />
                  </div>
                )}
              </div>

              {/* Coordinators Badge */}
              {currentPastoral.coordinators && (
                <div className={styles.coordinatorsCard}>
                  <div className={styles.coordIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className={styles.coordContent}>
                    <span className={styles.coordLabel}>Coordenação</span>
                    <span className={styles.coordNames}>{currentPastoral.coordinators}</span>
                  </div>
                </div>
              )}

              {/* Description & Activities */}
              <div className={styles.descSection}>
                <h2 className={styles.sectionTitle}>Sobre e Atividades</h2>
                <p className={styles.descriptionText}>
                  {currentPastoral.description ||
                    'Venha participar e conhecer de perto as atividades e os encontros promovidos por esta pastoral na nossa Paróquia.'}
                </p>
              </div>

              {/* Contact & WhatsApp Button */}
              <div className={styles.contactSection}>
                {whatsappInfo ? (
                  <a
                    href={whatsappInfo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappButton}
                  >
                    <svg
                      className={styles.whatsappIcon}
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <div className={styles.whatsappContent}>
                      <span className={styles.whatsappTitle}>Falar com a Coordenação</span>
                      <span className={styles.whatsappSubtitle}>Toque para abrir no WhatsApp</span>
                    </div>
                  </a>
                ) : (
                  <div className={styles.noPhoneCard}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>Contato disponível na secretaria da Paróquia.</span>
                  </div>
                )}

                {/* Secondary email contact if present */}
                {emailInfo && (
                  <div className={styles.secondaryContact}>
                    Ou envie um e-mail:{' '}
                    <a href={emailInfo.link} className={styles.emailLink}>
                      {emailInfo.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
