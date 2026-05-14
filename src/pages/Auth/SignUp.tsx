import React, { JSX, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useSignupMutation, useSigninMutation } from '../../store/auth/authApi';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/auth/authSlice';
import { EyeIcon } from '../../common/components';
import 'react-toastify/dist/ReactToastify.css';
import s from './auth.module.scss';

type PasswordStrength = 'weak' | 'medium' | 'strong';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const getPasswordStrength = (pwd: string): { level: PasswordStrength; label: string } => {
  if (!pwd) return { level: 'weak', label: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { level: 'weak', label: 'Слабкий' };
  if (score <= 3) return { level: 'medium', label: 'Середній' };
  return { level: 'strong', label: 'Надійний' };
};

const strengthFillClass: Record<PasswordStrength, string> = {
  weak: s.fill_weak,
  medium: s.fill_medium,
  strong: s.fill_strong,
};

const strengthTextClass: Record<PasswordStrength, string> = {
  weak: s.text_weak,
  medium: s.text_medium,
  strong: s.text_strong,
};

const SignUp = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signup] = useSignupMutation();
  const [signin] = useSigninMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const strength = getPasswordStrength(password);
  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const disabled =
    submitting || !email || !password || !confirm || passwordMismatch || strength.level === 'weak' || emailInvalid;

  useEffect(() => {
    if (email) {
      debounceRef.current = setTimeout(() => {
        setEmailInvalid(!EMAIL_REGEX.test(email));
      }, 500);
    } else {
      setEmailInvalid(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    try {
      await signup({ email, password }).unwrap();
      const authData = await signin({ email, password }).unwrap();
      dispatch(setCredentials({ token: authData.token, refreshToken: authData.refreshToken }));
      navigate('/');
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? 'Помилка реєстрації';
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <h1>Реєстрація</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            required
            autoFocus
            autoComplete="email"
            className={emailInvalid ? s.input_error : ''}
            onChange={(e): void => setEmail(e.target.value)}
          />
          {emailInvalid && <span className={`${s.email_hint} ${s.email_invalid}`}>Невірний формат email</span>}
          <label htmlFor="password">Пароль</label>
          <div className={s.input_wrap}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              required
              autoComplete="new-password"
              onChange={(e): void => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
              className={s.eye}
              onClick={(): void => setShowPassword((v) => !v)}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          {password.length > 0 && (
            <div className={s.strength}>
              <div className={s.strength_bar}>
                <div className={`${s.strength_fill} ${strengthFillClass[strength.level]}`} />
              </div>
              <span className={`${s.strength_label} ${strengthTextClass[strength.level]}`}>{strength.label}</span>
            </div>
          )}
          <label htmlFor="confirm">Підтвердіть пароль</label>
          <div className={s.input_wrap}>
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              required
              autoComplete="new-password"
              className={passwordMismatch ? s.input_error : ''}
              onChange={(e): void => setConfirm(e.target.value)}
            />
            <button
              type="button"
              aria-label={showConfirm ? 'Сховати пароль' : 'Показати пароль'}
              className={s.eye}
              onClick={(): void => setShowConfirm((v) => !v)}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {passwordMismatch && <span className={s.error_hint}>Паролі не збігаються</span>}
          <button type="submit" disabled={disabled}>
            Зареєструватися
          </button>
        </form>
        <p>
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
