import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<P>(func: GetServerSideProps<P>){
  return async (context: GetServerSidePropsContext):Promise<GetServerSidePropsResult<P>> =>{
    const cookies = parseCookies(context);
    if(cookies['nexauth.token']){
      return{
        redirect:{
          destination: '/dashboard',
          permanent: false
        }
      }
    }

    return await func(context);

  }
}