import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Start your PCOS management journey today
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
