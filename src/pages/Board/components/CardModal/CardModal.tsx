import s from './card-modal.module.scss';

export const CardModal = () => {
  return (
    <div className={s.modals_wrapper}>
      <div className={s.modal}>
        <button className={s.btn__close}>
          <span></span>
          <span></span>
        </button>
        <div className={s.modal_content}></div>
      </div>
    </div>
  );
};
