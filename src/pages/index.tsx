import { FormEvent, useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { withSSRGuest } from '../utils/withSSRGuest';

import styles from '../styles/Home.module.css';

export default function Home() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {

    event.preventDefault();

    const data = {
      email,
      password,
    };

    await signIn(data);

  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={event =>
            setEmail(event.target.value)}
          className={styles.input}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={event =>
            setPassword(event.target.value)}
          className={styles.input}
          placeholder="Password"
        />
        <button
          type="submit"
          className={styles.button}
        >
          Sign In
        </button>
      </form>
    </div>
  )
}

export const getServerSideProps = withSSRGuest(async (ctx) => {

  return {
    props: {},
  };

});
