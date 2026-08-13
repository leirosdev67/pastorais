import Link from 'next/link';
import styles from './home.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Painel de Pastorais</h1>
        <p className={styles.subtitle}>Selecione o modo de exibição ou gerencie os dados</p>
      </div>

      <div className={styles.grid}>
        {/* TV Mode */}
        <Link href="/tv" className={`${styles.card} glass`}>
          <div>
            <div className={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="15" x="2" y="3" rx="2" />
                <path d="M12 18v4" />
                <path d="M8 22h8" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h2>Modo TV / Slides</h2>
              <p>Ideal para televisões e telões. Apresentação contínua e automática dos slides de cada pastoral com transições suaves.</p>
            </div>
          </div>
          <div className={styles.arrow}>
            Iniciar Slideshow
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </Link>

        {/* Touchscreen Mode */}
        <Link href="/touch" className={`${styles.card} glass`}>
          <div>
            <div className={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h2>Modo Totem</h2>
              <p>Otimizado para telas touchscreen. Navegue de forma interativa, selecione pastorais e abra informações detalhadas e contatos.</p>
            </div>
          </div>
          <div className={styles.arrow}>
            Abrir Interativo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </Link>

        {/* Admin Backend Panel */}
        <Link href="/admin" className={`${styles.card} glass`}>
          <div>
            <div className={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h2>Administração</h2>
              <p>Gerencie as informações das pastorais. Cadastre novos slides, edite textos de atividades, atualize contatos e faça upload de fotos.</p>
            </div>
          </div>
          <div className={styles.arrow}>
            Acessar Painel
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </Link>
      </div>
    </main>
  );
}
