'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './touch.module.css';

export default function TouchscreenMode() {
  const [pastorais, setPastorais] = useState([]);
  const [selectedPastoral, setSelectedPastoral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tappedId, setTappedId] = useState(null);

  // Fetch pastorals
  useEffect(() => {
    async function loadPastorais() {
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
    }
    loadPastorais();
  }, []);

  const handleCardTap = (pastoral) => {
    setTappedId(pastoral.id);
    setTimeout(() => {
      setTappedId(null);
      setSelectedPastoral(pastoral);
    }, 150); // Small delay for visual tactile press feedback
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando painel interativo...</p>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Guia das Pastorais</h1>
          <p>Toque em uma pastoral para ver atividades, coordenação e contatos.</p>
        </div>
        <Link href="/" className={styles.backButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </Link>
      </div>

      {/* Interactive Grid */}
      {pastorais.length === 0 ? (
        <div className={styles.loading}>
          <p>Nenhuma pastoral cadastrada.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {pastorais.map((pastoral) => (
            <div
              key={pastoral.id}
              onClick={() => handleCardTap(pastoral)}
              className={`${styles.card} glass ${tappedId === pastoral.id ? styles.cardActive : ''}`}
            >
              <div className={styles.cardImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pastoral.image}
                  alt={pastoral.name}
                  className={styles.cardImage}
                />
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                  <h3>{pastoral.name}</h3>
                  <p>{pastoral.description}</p>
                </div>
                <div className={styles.tapToSee}>
                  <span>Ver informações</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-up detailed Modal */}
      {selectedPastoral && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPastoral(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHero}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPastoral.image}
                alt={selectedPastoral.name}
                className={styles.modalHeroImage}
              />
              <div className={styles.modalHeroOverlay} />
              <button className={styles.closeBtn} onClick={() => setSelectedPastoral(null)} aria-label="Fechar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{selectedPastoral.name}</h2>
              
              <div className={styles.modalDescSection}>
                <h4>Nossas Atividades</h4>
                <p>{selectedPastoral.description}</p>
              </div>

              <div className={styles.modalInfoSection}>
                <h4>Coordenação & Contato</h4>
                <div className={styles.contactGrid}>
                  {selectedPastoral.coordinators && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Coordenadores</span>
                      <span className={styles.contactValue}>{selectedPastoral.coordinators}</span>
                    </div>
                  )}
                  {selectedPastoral.contact && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Como Participar / Contato</span>
                      <span className={styles.contactValue}>{selectedPastoral.contact}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
