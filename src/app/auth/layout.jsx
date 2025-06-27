// app/auth/layout.jsx
export default function AuthLayout({ children }) {
    return (
      <div className="auth-layout">
        {/* Auth-specific layout without navbar */}
        {children}
      </div>
    );
  }