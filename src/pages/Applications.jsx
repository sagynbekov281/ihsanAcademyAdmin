import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import Confirm from '../components/Confirm';

const STATUS = { pending: 'ожидает', approved: 'одобрена', rejected: 'отклонена' };
const waLink = (phone, text) => 'https://wa.me/' + String(phone).replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
const snap = (l) => JSON.stringify(l.map((a) => [a._id, a.status, a.createdAt]));

export default function Applications() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('Загрузка...');
  const [del, setDel] = useState(null);
  const [myWa, setMyWa] = useState(localStorage.getItem('my_wa') || '');
  const [openWa, setOpenWa] = useState(localStorage.getItem('open_wa') !== 'false');
  const last = useRef('');

  const load = async (quiet) => {
    try {
      const r = await api('/api/applications'); const l = r.applications || [];
      if (!quiet || snap(l) !== last.current) { setList(l); last.current = snap(l); }
      setMsg('');
    } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { load(); const t = setInterval(() => load(true), 3000); return () => clearInterval(t); }, []);

  const approve = async (a) => {
    const win = openWa ? window.open('', '_blank') : null;
    try {
      const r = await api(`/api/applications/${a._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) });
      if (win) win.location.href = waLink(a.phone, `Здравствуйте, ${a.name}! Ваша заявка на курс «${a.course}» в IhsanAcademy одобрена. Мы свяжемся с вами, чтобы обсудить детали и начало занятий.`);
      if (r.sms?.attempted) alert(r.sms.ok ? 'SMS клиенту отправлена.' : 'SMS НЕ отправилась:\n' + r.sms.error);
      load();
    } catch (e) { win?.close(); alert(e.message); }
  };
  const reject = async (a) => { try { await api(`/api/applications/${a._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }); load(); } catch (e) { alert(e.message); } };
  const toClient = (a) => window.open(waLink(a.phone, a.language === 'ky'
    ? `Саламатсызбы, ${a.name}! Бул IhsanAcademy академиясы. Сиз «${a.course}» курсуна катталуу үчүн өтүнмө калтырдыңыз. Сиз менен качан сүйлөшсөк ыңгайлуу?`
    : `Здравствуйте, ${a.name}! Это IhsanAcademy. Вы оставили заявку на курс «${a.course}». Когда вам удобно поговорить?`), '_blank');
  const toMe = (a) => {
    if (!myWa.trim()) return alert('Впишите свой номер WhatsApp в поле сверху');
    window.open(waLink(myWa, `Заявка IhsanAcademy\nИмя: ${a.name}\nТелефон: +${a.phone}\nКурс: ${a.course}` + (a.message ? `\nСообщение: ${a.message}` : '')), '_blank');
  };
  const doDelete = async () => { await api('/api/applications/' + del._id, { method: 'DELETE' }); setList((l) => l.filter((x) => x._id !== del._id)); setDel(null); };

  return (
    <>
      <div className="bar">
        <input placeholder="Ваш WhatsApp: 996XXXXXXXXX" value={myWa}
          onChange={(e) => { setMyWa(e.target.value); localStorage.setItem('my_wa', e.target.value.trim()); }} />
        <label className="chk"><input type="checkbox" checked={openWa}
          onChange={(e) => { setOpenWa(e.target.checked); localStorage.setItem('open_wa', String(e.target.checked)); }} /> При «Одобрить» открывать WhatsApp клиента</label>
      </div>
      {msg && <p className="muted">{msg}</p>}
      {!msg && !list.length && <div className="empty">Заявок пока нет</div>}
      {list.length > 0 && (
        <div className="table-wrap"><table>
          <thead><tr>{['Имя','Телефон','Курс','Статус','Дата',''].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{list.map((a) => (
            <tr key={a._id}>
              <td data-label="Имя">{a.name}</td><td data-label="Телефон">+{a.phone}</td><td data-label="Курс">{a.course}</td>
              <td data-label="Статус"><span className={'badge ' + a.status}>{STATUS[a.status] || a.status}</span></td>
              <td data-label="Дата">{new Date(a.createdAt).toLocaleString('ru-RU')}</td>
              <td className="actions">
                {a.status === 'pending' && <><button onClick={() => approve(a)}>Одобрить</button><button className="secondary" onClick={() => reject(a)}>Отклонить</button></>}
                <button className="wa" onClick={() => toClient(a)}>WhatsApp клиента</button>
                <button className="secondary" onClick={() => toMe(a)}>Отправить себе</button>
                <button className="danger" onClick={() => setDel(a)}>Удалить</button>
              </td>
            </tr>))}</tbody>
        </table></div>
      )}
      {del && <Confirm title="Удалить заявку?" text={`Запись «${del.name}» будет удалена без возможности восстановления.`} onConfirm={doDelete} onClose={() => setDel(null)} />}
    </>
  );
}
