// Constantes de texto para las vistas de autenticación
export const AUTH_TEXTS = {
  login: {
    title: 'Iniciar Sesión',
    emailLabel: 'Correo Electrónico',
    emailPlaceholder: 'correo@ejemplo.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: '••••••••',
    submitButton: 'Ingresar',
    noAccountText: '¿No tienes una cuenta?',
    registerLink: 'Regístrate aquí',
    loading: 'Iniciando sesión...',
  },
  register: {
    title: 'Crear Cuenta',
    nameLabel: 'Nombre Completo',
    namePlaceholder: 'Juan Pérez',
    emailLabel: 'Correo Electrónico',
    emailPlaceholder: 'correo@ejemplo.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Mínimo 6 caracteres',
    submitButton: 'Registrarse',
    hasAccountText: '¿Ya tienes una cuenta?',
    loginLink: 'Inicia sesión aquí',
    loading: 'Creando cuenta...',
  },
} as const;
