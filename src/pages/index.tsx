import { FormEvent, useState } from "react"
import { useAuth } from "../contexts/authContext";
import { withSSRGuest } from "../utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useAuth();

  const handleLogin = async(e: FormEvent) =>{
    e.preventDefault();

    const data = { email, password }
    await signIn(data);
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email}  onChange={e => setEmail(e.target.value) } />
      <input type="password" value={password}  onChange={e => setPassword(e.target.value) } />
      <button type="submit">Entrar</button>
    </form>
  )
}

const getServerSideProps = withSSRGuest(async(context) =>{
  return{
    props:{}
  }
})
