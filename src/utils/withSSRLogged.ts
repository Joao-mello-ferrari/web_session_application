import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/Errors/AuthTokenError";

export function withSSRLogged<P>(func: GetServerSideProps<P>){
  return async (context: GetServerSidePropsContext):Promise<GetServerSidePropsResult<P>> =>{
    const cookies = parseCookies(context);
    if(!cookies['nexauth.token']){
      return{
        redirect:{
          destination: '/',
          permanent: false
        }
      }
    }

    try{
      return await func(context);
    }catch(err){
      if(err instanceof AuthTokenError){
        destroyCookie(context, 'nextauth.token');
        destroyCookie(context, 'nextauth.refreshToken');
  
        return{
          redirect:{
            destination:'/',
            permanent: false
          }
        }
      }
    }

  }
}