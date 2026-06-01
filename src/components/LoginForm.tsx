'use client';

import { loginAction, registerAction } from '@/app/actions';
import { glassStyles } from '@/components/ui/glassStyles';
import { useState } from 'react';

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isLogin
      ? await loginAction(formData)
      : await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <style>{`
        body {
          background: linear-gradient(135deg, #0B0F19 0%, #111827 100%);
        }
      `}</style>

      <div className={`w-full max-w-md space-y-8 ${glassStyles.panel} p-8 sm:p-10`}>
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-white">Ticket</span>
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            {isLogin ? 'Acceso al Sistema' : 'Crear Cuenta'}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre Completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required={!isLogin}
                placeholder="Tu nombre"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@correo.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${glassStyles.botonPrimario}`}
          >
            {loading
              ? isLogin
                ? 'Iniciando sesión...'
                : 'Creando cuenta...'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Crear Cuenta'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#111827] text-slate-400">
              {isLogin ? '¿Sin cuenta?' : '¿Ya tienes cuenta?'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLogin ? 'Registrarse Aquí' : 'Volver al Acceso'}
        </button>
      </div>
    </div>
  );
}
