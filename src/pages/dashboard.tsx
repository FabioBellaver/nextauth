import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from '../services/apiClient'
import { withSSRAuth } from "../utils/withSSRAuth";

import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {

    const { user, signOut } = useContext(AuthContext);

    useEffect(() => {
        api.get('/me')
            .then(response => 
                console.log(response))
            .catch(error => {
                console.log(error);
            });
    }, []);

    return (
        <>
        <div className={styles.container}>
            <h1>Dashboard: {user?.email}</h1>
            <button className={styles.button} onClick={signOut}>Sign Out</button>
            <Can permissions={['metrics.list']}>
                <div className={styles.ex}>Exemple</div>
            </Can>
        </div>
        </>
    );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');
    console.log(response.data);

    return {
        props: {},
    };
});