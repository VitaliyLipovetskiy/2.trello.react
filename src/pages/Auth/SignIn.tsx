import React, { JSX, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSigninMutation } from '../../store/auth/authApi';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/auth/authSlice';
import { EyeIcon } from '../../common/components';
import s from './auth.module.scss';

const SignIn = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signin] = useSigninMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const authData = await signin({ email, password }).unwrap();
      dispatch(setCredentials({ token: authData.token, refreshToken: authData.refreshToken }));
      navigate('/');
    } catch {
      setAuthError('Невірний email або пароль');
      setSubmitting(false);
    }
  };

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <h1>Вхід</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            required
            autoFocus
            autoComplete="email"
            onChange={(e): void => setEmail(e.target.value)}
          />
          <label htmlFor="password">Пароль</label>
          <div className={s.input_wrap}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              required
              autoComplete="current-password"
              className={authError ? s.input_error : undefined}
              onChange={(e): void => {
                setPassword(e.target.value);
                if (authError) setAuthError('');
              }}
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
          {authError && <p className={s.error_hint}>{authError}</p>}
          <button type="submit" disabled={submitting || !email || !password}>
            Увійти
          </button>
        </form>
        <div>
          <p>
            Немає акаунту? <Link to="/register">Зареєструватися</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
