import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { FormCard } from "@/components/auth/form-card";
import { LoginForm } from "@/components/forms/login-form";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Login",
  description: "Sign in to access your dashboard.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const googleEnabled =
    process.env.AUTH_GOOGLE === "true" &&
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <FormCard
      title="Welcome back"
      description="Sign in with your credentials to continue."
      footer={
        <div className="text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register
          </Link>
        </div>
      }
    >
      <LoginForm />
      {googleEnabled ? <GoogleSignInButton /> : null}
    </FormCard>
  );
}

