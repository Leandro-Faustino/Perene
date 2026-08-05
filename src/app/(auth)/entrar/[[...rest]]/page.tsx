import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Entrar" };

export default function PaginaDeEntrada() {
  return <SignIn signUpUrl="/cadastrar" fallbackRedirectUrl="/dashboard" />;
}
