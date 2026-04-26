import { AuthPage } from "@/components/auth/auth-page";
import { SignUp } from "@/components/auth/sign-up";

export default function SignUpPage() {
  return (
    <AuthPage
      author="Sarah Jenkins"
      quote="The onboarding process for our NGO was incredibly intuitive. It's the most professional platform for community coordination I've used."
    >
      <SignUp />
    </AuthPage>
  );
}
