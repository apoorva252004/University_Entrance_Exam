import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';

export default async function ChangePasswordPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    redirect('/login');
  }

  // Redirect to dashboard if password change not required
  if (!session.user.isFirstLogin) {
    const role = session.user.role.toLowerCase();
    redirect(`/${role}/dashboard`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            For security, please change your temporary password
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-lg">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
