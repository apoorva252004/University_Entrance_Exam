import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignupForm from "@/components/auth/SignupForm";
import Link from "next/link";

export default async function SignupPage() {
  // Check if user is already authenticated
  const session = await auth();
  
  if (session?.user) {
    // User is already logged in, redirect to home
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Register for RV University Entrance Examinations
        </p>
      </div>

      <SignupForm />

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
