import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth, type User } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { AUTH_TEXTS } from '../constants/auth.js';
import { VALIDATION_TEXTS } from '../constants/validators.js';
import { handleEnterTransition } from '../shared/utils/keyboard.js';

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de errores
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Validamos correo
  const isValidEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

  // Validamos del lado del cliente
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!email.trim()) {
      errors.email = VALIDATION_TEXTS.requiredField;
    } else if (!isValidEmail(email)) {
      errors.email = VALIDATION_TEXTS.invalidEmail;
    }

    if (!password) {
      errors.password = VALIDATION_TEXTS.requiredField;
    } else if (password.length < 6) {
      errors.password = VALIDATION_TEXTS.passwordLength;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/login', { email, password });

      const userResponse = await api.get<User>('/auth/me');
      
      login(userResponse.data);
      navigate('/inmuebles');
    } catch (error: any) {
      // Se captura mensaje de la api
      const mensajeError = error?.response?.data?.message || 'Error al conectar con el servidor';
      setServerError(mensajeError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8 z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">
            {AUTH_TEXTS.login.title}
          </h2>
          <p className="text-slate-400 text-sm">
            {AUTH_TEXTS.login.noAccountText}{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200">
              {AUTH_TEXTS.login.registerLink}
            </Link>
          </p>
        </div>

        {/* Alerta de errores de servidor */}
        {serverError && (
          <div className="mb-6 flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo: Correo Electrónico */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 block">
              {AUTH_TEXTS.login.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => handleEnterTransition(e, 'password-input')}
                placeholder={AUTH_TEXTS.login.emailPlaceholder}
                disabled={isLoading}
                className={`w-full bg-slate-950/60 border ${
                  validationErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                } rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-400 text-xs font-medium flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Campo: Contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 block">
              {AUTH_TEXTS.login.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={AUTH_TEXTS.login.passwordPlaceholder}
                disabled={isLoading}
                className={`w-full bg-slate-950/60 border ${
                  validationErrors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                } rounded-xl pl-12 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-400 text-xs font-medium flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-indigo-600/20 mt-8"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{AUTH_TEXTS.login.loading}</span>
              </div>
            ) : (
              AUTH_TEXTS.login.submitButton
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
