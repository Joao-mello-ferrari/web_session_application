import { GetServerSideProps } from "next";
import { useAuth } from "../contexts/authContext";
import { setupAPIClient } from "../services/api";
import { withSSRLogged } from "../utils/withSSRLogged";

export default function Dashboard(){
  const { user } = useAuth();

  return(
    <h1>Email: {user?.email}</h1>
  )
}

export const getServerSideProps = withSSRLogged(async(context)=>{
  const serverSideApi = setupAPIClient(context);

  const response = await serverSideApi.get('/me');
  
  return{
    props:{
      user: response?.data?.user
    }
  }
})