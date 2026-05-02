import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-4 pt-16 pb-24 sm:px-6 sm:pt-20 sm:pb-32">
      <div className="mx-auto flex max-w-6xl justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
