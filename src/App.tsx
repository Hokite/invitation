import { useMemo, useState } from 'react';
import { invitation } from './config';

const rows = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, null, null, null, null, null],
];

function getDateParts() {
  const [year, month, day] = invitation.eventDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdayKo = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const weekdayEn = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()];
  return { year, month, day, weekdayKo, weekdayEn };
}

function dateLabel() {
  const { year, month, day, weekdayKo } = getDateParts();
  return `${year}년 ${month}월 ${day}일 ${weekdayKo}요일`;
}

function timeLabel() {
  if (!invitation.eventTime) return '시간 추후 안내';
  const [hourString, minute] = invitation.eventTime.split(':');
  const hour = Number(hourString);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  return `${period} ${displayHour}시${minute !== '00' ? ` ${Number(minute)}분` : ''}`;
}

function daysLeft() {
  const { year, month, day } = getDateParts();
  const event = new Date(year, month - 1, day).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.ceil((event - today) / 86400000);
}

export default function App() {
  const [toast, setToast] = useState('');
  const countdown = useMemo(daysLeft, []);
  const label = dateLabel();
  const eventTimeText = timeLabel();
  const { year, month, day, weekdayEn } = getDateParts();
  const query = encodeURIComponent(`${invitation.venue} ${invitation.address}`);

  const yy = String(year).slice(2);
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 2200);
  };

  const copyAddress = async () => {
    const text = `${invitation.address} ${invitation.building} ${invitation.venue}`;
    try {
      await navigator.clipboard.writeText(text);
      notify('행사장 주소를 복사했습니다.');
    } catch {
      window.prompt('주소를 복사해주세요.', text);
    }
  };

  const share = async () => {
    const text = `${invitation.name}님의 환갑연에 초대합니다.\n${label} · ${eventTimeText}\n${invitation.venue}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${invitation.name}님의 빛나는 예순`, text, url: invitation.publicUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${invitation.publicUrl}`);
      notify('초대 문구와 링크를 복사했습니다.');
    } catch {
      window.prompt('아래 내용을 복사해주세요.', `${text}\n${invitation.publicUrl}`);
    }
  };

  const saveDate = () => {
    const startDate = invitation.eventDate.replaceAll('-', '');
    const [hour, minute] = invitation.eventTime ? invitation.eventTime.split(':') : ['', ''];
    const hasTime = Boolean(hour && minute);
    const start = hasTime ? `${startDate}T${hour}${minute}00` : startDate;
    const endHour = hasTime ? String((Number(hour) + 2) % 24).padStart(2, '0') : '';
    const end = hasTime ? `${startDate}T${endHour}${minute}00` : startDate;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      hasTime ? `DTSTART;TZID=Asia/Seoul:${start}` : `DTSTART;VALUE=DATE:${start}`,
      hasTime ? `DTEND;TZID=Asia/Seoul:${end}` : `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${invitation.name}님의 환갑연`,
      `LOCATION:${invitation.venue} ${invitation.address}`,
      `URL:${invitation.publicUrl}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `환갑초대장_${invitation.eventDate}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    notify('날짜와 시간을 저장했습니다.');
  };

  return (
    <div className="site">
      <main className="card">
        <section className="hero-page">
          <div className="hero-date">{yy} | {mm} | {dd}</div>
          <div className="hero-day">{weekdayEn}</div>

          <div className="hero-photo-frame">
            <img
              className="hero-photo"
              src={`${import.meta.env.BASE_URL}images/수채화로 그린 작은 갤러리 풍경.png`}
              alt="환갑 초대장 메인 이미지"
            />
          </div>

          <div className="hero-name-row">
            <strong>아버지의 환갑연에 초대합니다.</strong>
          </div>

          <p className="hero-meta">{label} {eventTimeText}</p>
          <p className="hero-place">{invitation.venue}</p>
        </section>

        <section className="letter section">
          <p className="eyebrow">INVITATION</p>
          <h2>함께해 주신 시간에<br />감사의 마음을 담아</h2>
          <p>늘 한결같은 사랑으로<br />가족의 든든한 버팀목이 되어주신<br />아버지 {invitation.name}님의 환갑을 맞이합니다.</p>
          <p>함께해 주신 소중한 분들을 모시고<br />감사와 축하의 마음을 나누려 합니다.<br />따뜻한 걸음으로 자리를 빛내주세요.</p>
          <p className="signature">{invitation.name}님의 <b>가족 드림</b></p>
        </section>

        <section className="wishes section">
          <p className="eyebrow">HAPPY 60TH BIRTHDAY</p>
          <h2>아버지께 전하는 마음</h2>
          <blockquote>
            <p className="english">{invitation.birthdayMessageEn}</p>
            <div className="divider">✦</div>
            <p>{invitation.birthdayMessageKo}</p>
          </blockquote>
        </section>

        <section className="schedule section">
          <p className="eyebrow">OUR SPECIAL DAY</p>
          <h2>기쁜 날, 함께해요</h2>
          <p className="date">{label}</p>
          <p className="muted">{eventTimeText}</p>

          <div className="calendar">
            <div className="month"><span>2026</span><b>11</b><span>NOVEMBER</span></div>
            <div className="week labels">{['일', '월', '화', '수', '목', '금', '토'].map((x) => <span key={x}>{x}</span>)}</div>
            {rows.map((row, i) => (
              <div className="week" key={i}>
                {row.map((item, j) => <span key={j} className={item === 7 ? 'event-day' : ''}>{item || ''}</span>)}
              </div>
            ))}
            <p className="calendar-note">7일, {invitation.name}님의 환갑연</p>
          </div>

          {countdown > 0 && <p className="countdown">함께할 날까지 <strong>D-{countdown}</strong></p>}
          <button className="outline-button" onClick={saveDate}>날짜 저장 · {eventTimeText}</button>
        </section>

        <section className="location section" id="location">
          <p className="eyebrow">COME CELEBRATE WITH US</p>
          <h2>오시는 길</h2>

          <div className="naver-map-card">
            <a
              className="naver-map-image-link"
              href={`https://map.naver.com/p/search/${query}`}
              target="_blank"
              rel="noreferrer"
              aria-label="네이버지도에서 마키노차야 광교점 열기"
            >
              <img
                className="naver-map-image"
                src="https://simg.pstatic.net/static.map/v2/map/staticmap.bin?caller=smarteditor&h=360&markers=color%3A0x11cc73%7Csize%3Amid%7Cpos%3A127.0577814+37.2870876%7CviewSizeRatio%3A0.7%7Ctype%3Ad&scale=2&w=700"
                alt="마키노차야 광교점 주변 네이버 지도"
                loading="lazy"
              />

              <span className="naver-map-badge">
                마키노차야 광교점
              </span>

              <span className="naver-map-caption">
                지도를 누르면 네이버지도로 이동합니다.
              </span>
            </a>

            <div className="venue">
              <div className="address-row">
                <span>{invitation.address}</span>
                <button type="button" onClick={copyAddress}>
                  복사
                </button>
              </div>
            </div>
          </div>

          <div className="map-buttons">
            <a
              href={`https://map.naver.com/p/search/${query}`}
              target="_blank"
              rel="noreferrer"
            >
              네이버지도 ↗
            </a>

            <a
              href={`https://map.kakao.com/?q=${query}`}
              target="_blank"
              rel="noreferrer"
            >
              카카오맵 ↗
            </a>
          </div>

          <div className="travel">
            <p>
              <b>대중교통</b>
              <br />
              {invitation.transport}
            </p>

            <p>
              <b>주차 안내</b>
              <br />
              {invitation.parking}
            </p>
          </div>
        </section>
      </main>

      <nav className="bottom-bar">
        <a href="#location">오시는 길</a>
        <button onClick={share}>초대장 공유</button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
