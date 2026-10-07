import { useState } from 'react';
export default function Confirm({ title, text, onConfirm, onClose }) {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } catch (e) { setErr('Не удалось удалить: ' + e.message); setBusy(false); } };
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">
        <h2>{title}</h2><p className="muted">{text}</p><div className="err">{err}</div>
        <div className="row"><button className="danger" disabled={busy} onClick={go}>Удалить</button><button className="secondary" onClick={onClose}>Отмена</button></div>
      </div>
    </div>
  );
}
