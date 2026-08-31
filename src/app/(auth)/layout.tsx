// Pass-through. Each auth route sets its own metadata in a nested layout:
// /register is indexable, /login and /callback are not.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
