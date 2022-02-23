import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import Router from 'next/router'

import { api } from '../services/apiClient';

interface User{
  email: string;
  permissions: string[];
  roles: string[];
}

interface SignInCredentials{
  email: string;
  password: string;
}

interface AuthContextData{
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user:User;
}

interface AuthProviderProviderProps{
  children: ReactNode;
}

const authContext = createContext({} as AuthContextData);

export const signOut = () =>{
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  Router.push('/');
}

export const AuthProvider = ({ children }: AuthProviderProviderProps) =>{
  const [user,setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(()=>{
    const cookies = parseCookies();
    const token = cookies['nextauth.token'];

    if(token){
      api.get('/me')
        .then(response=>response.data.json())
        .then(data=>{
          const { email, permissions, roles } = data;
          setUser({ email, permissions, roles });
        })
        .catch(()=>{
          signOut();
        })
    }
  },[])
  
  const signIn = async(credentials: SignInCredentials) =>{
    try{
      const response = await api.post('/sessions', credentials);
      const { token, refreshToken, permissions, roles } = response.data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      setUser({
        email: credentials.email,
        permissions,
        roles
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard');
    }catch(err){
      alert(String(err))
    }
  }


  return(
    <authContext.Provider value={{ signIn, isAuthenticated, user }}>
      { children }
    </authContext.Provider>
  )
}

export const useAuth = () =>{
  return useContext(authContext);
}