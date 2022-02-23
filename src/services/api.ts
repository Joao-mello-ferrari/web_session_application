import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'

import { signOut } from '../contexts/authContext'
import { AuthTokenError } from './Errors/AuthTokenError';

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupAPIClient(context = undefined){
  let cookies = parseCookies(context);

  const api = axios.create({ 
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
   })
  
   api.interceptors.response.use(response => { return response }, 
     (error: AxiosError) =>{
      if(error.response.status === 401){
        if(error.response.data?.code === 'token.expired'){
          cookies = parseCookies(context);
          
          const oldRefreshToken = cookies['nextauth.refreshToken'];
          const originalConfig = error.config;
  
          if(!isRefreshing){
            isRefreshing = true;
            api.post('/me', { refreshToken: oldRefreshToken })
              .then(response=> response.data.json())
              .then(data=>{
                const { token, refreshToken } = data;
                setCookie(context, 'nextauth.token', token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/'
                });
          
                setCookie(context, 'nextauth.refreshToken', refreshToken, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/'
                });
    
                api.defaults.headers['Authorization'] = `Bearer ${token}`
                
                failedRequestsQueue.forEach(request=> request.onSuccess(token))
                failedRequestsQueue = [];
            })
            .catch(err=>{
              failedRequestsQueue.forEach(request=> request.onFailure(err))
              failedRequestsQueue = [];
  
              if(typeof window !== undefined){
                signOut();
              }
            })
            .finally(()=>{
              isRefreshing = false;
            })
          }
        
          return new Promise((resolve, reject)=>{
            failedRequestsQueue.push({
              onSuccess: (token: string) =>{
                originalConfig.headers['Authorization'] = ` Bearer ${token}`
                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) =>{
                reject(err);
              }
            })
          })
        }else{
          if(typeof window !== undefined){ signOut(); }
          else return Promise.reject(new AuthTokenError())
        }
      }
  
      return Promise.reject(error);
   }) 
   
   return api
}

