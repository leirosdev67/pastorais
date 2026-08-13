'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './tv.module.css';

const SLIDE_DURATION = 22000; // 22 seconds per slide

export default function TvMode() {
  const [pastorais, setPastorais] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  // Fetch pastorals list
  useEffect(() => {
    async function loadPastorais() {
      try {
        const res = await fetch('/api/pastorais');
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
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

  // Handle slide transitions and progress bar animation
  useEffect(() => {
    if (pastorais.length === 0 || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const startProgressAnimation = () => {
      startTimeRef.current = performance.now() - pausedTimeRef.current;

      const updateProgress = (time) => {
        const elapsed = time - startTimeRef.current;
        const progress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

        if (progressRef.current) {
          progressRef.current.style.width = `${progress}%`;
        }

        if (elapsed >= SLIDE_DURATION) {
          pausedTimeRef.current = 0;
          setCurrentIndex((prevIndex) => (prevIndex + 1) % pastorais.length);
        } else {
          animationRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animationRef.current = requestAnimationFrame(updateProgress);
    };

    startProgressAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, isPlaying, pastorais.length]);

  const handleNext = () => {
    pausedTimeRef.current = 0;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % pastorais.length);
  };

  const handlePrev = () => {
    pausedTimeRef.current = 0;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + pastorais.length) % pastorais.length);
  };

  const togglePlay = () => {
    if (isPlaying) {
      // Pause: Save elapsed time
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      const elapsed = performance.now() - startTimeRef.current;
      pausedTimeRef.current = elapsed;
      setIsPlaying(false);
    } else {
      // Play: Resume from saved elapsed time
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando pastorais...</p>
      </div>
    );
  }

  if (pastorais.length === 0) {
    return (
      <div className={styles.loading}>
        <p>Nenhuma pastoral cadastrada.</p>
        <Link href="/admin" className={styles.homeButton}>
          Ir para Administração
        </Link>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* Back to Home Menu */}
      <Link href="/" className={styles.homeButton}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Menu Principal
      </Link>

      {/* Slide Content wrapper */}
      <div className={styles.slideWrapper}>
        {pastorais.map((pastoral, idx) => (
          <div
            key={pastoral.id}
            className={`${styles.slide} ${idx === currentIndex ? styles.activeSlide : ''}`}
          >
            {/* Image display */}
            <div className={styles.imageSection}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pastoral.image}
                alt={pastoral.name}
                className={styles.image}
              />
              <div className={styles.imageOverlay} />
            </div>

            {/* Info panel */}
            <div className={styles.contentSection}>
              {pastoral.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pastoral.logo}
                  alt={`Logo de ${pastoral.name}`}
                  className={styles.logo}
                />
              ) : (
                <div className={styles.logoFallback}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 22h20L12 2z" />
                    <path d="M12 9v8M9 12h6" />
                  </svg>
                </div>
              )}
              <h2 className={styles.title}>{pastoral.name}</h2>
              <p className={styles.description}>{pastoral.description}</p>

              <div className={styles.metaGrid}>
                {pastoral.coordinators && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Coordenação</span>
                    <span className={styles.metaValue}>{pastoral.coordinators}</span>
                  </div>
                )}
                {pastoral.contact && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Contato / Informações</span>
                    <span className={styles.metaValue}>{pastoral.contact}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Control Buttons */}
      <div className={styles.controls}>
        <button onClick={handlePrev} className={styles.controlBtn} aria-label="Slide anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button onClick={togglePlay} className={styles.controlBtn} aria-label={isPlaying ? 'Pausar' : 'Iniciar'}>
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="4" x2="18" y2="20" />
              <line x1="6" y1="4" x2="6" y2="20" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <button onClick={handleNext} className={styles.controlBtn} aria-label="Próximo slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <span className={styles.counter}>
          {currentIndex + 1} / {pastorais.length}
        </span>
      </div>

      {/* Progress Bar indicator */}
      <div className={styles.progressBarContainer}>
        <div ref={progressRef} className={styles.progressBar} />
      </div>
    </main>
  );
}
