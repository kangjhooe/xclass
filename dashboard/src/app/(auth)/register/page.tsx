import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { FormCard } from "@/components/auth/form-card";
import { RegisterForm } from "@/components/forms/register-form";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Register",
  description: "Create a new account to access the dashboard.",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <FormCard
      title="Create your account"
      description="Join the dashboard experience in a few clicks."
      footer={
        <div className="text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      }
    >
      <RegisterForm />
    </FormCard>
  );
}

