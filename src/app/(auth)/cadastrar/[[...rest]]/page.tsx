import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Criar conta" };

export default function PaginaDeCadastro() {
  return <SignUp signInUrl="/entrar" fallbackRedirectUrl="/dashboard" />;
}
