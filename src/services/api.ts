import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

let isRefreshing = false;
let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined) {

    let cookies = parseCookies(ctx);

    interface AxiosErrorResponse {
        code?: string;
    }

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    });

    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError<AxiosErrorResponse>) => {
        if (error.response.status === 401) {
            if (error.response.data?.code === 'token.expired') {
                // update token
                cookies = parseCookies(ctx);
                const { 'nextauth.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config;

                if (!isRefreshing) {

                    isRefreshing = true;

                    api.post('/refresh', {
                        refreshToken,
                    }).then(response => {
                        const { token } = response.data;

                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        });
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/',
                        });

                        api.defaults.headers['Authorization'] = `Bearer ${token}`;

                        failedRequestQueue.forEach(request => request.onSucess(token));
                        failedRequestQueue = [];
                    }).catch(error => {
                        failedRequestQueue.forEach(request => request.onFailure(error));
                        failedRequestQueue = [];

                        if (typeof window !== 'undefined') {
                            signOut()
                        };

                    }).finally(() => {
                        isRefreshing = false;
                    });
                };

                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({
                        onSucess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`;
                            resolve(api(originalConfig));
                        },
                        onFailure: (error: AxiosError) => {
                            reject(error);
                        },
                    });
                });

            } else {

                if (typeof window !== 'undefined') {
                    signOut();
                } else {
                    return Promise.reject(new AuthTokenError());
                };
            };
        };
        return Promise.reject(error);
    });

    return api;
}