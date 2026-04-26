import { AuthPage } from "@/components/auth/auth-page";
import { SignIn } from "@/components/auth/sign-in";

export default function SignInPage() {
  return (
    <AuthPage
      author="Ali Hassan"
      quote="Impact Circle has helped me to find the right aid for my community faster than ever before. The transparency is unmatched."
    >
      <SignIn />
    </AuthPage>
  );
}
