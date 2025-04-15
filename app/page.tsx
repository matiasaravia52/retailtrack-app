import Button from '@/components/Button';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1>Bienvenido a tu nueva aplicación Next.js</h1>
        <p>Edita <code>app/page.tsx</code> y guarda para recargar.</p>
      </div>
      
      <div className={styles.buttons}>
        <Button>Botón Primario</Button>
        <Button variant="secondary">Botón Secundario</Button>
      </div>
    </main>
  );
}
