import { useEffect, useRef, useState } from 'react';

type Props = {
  venue: string;
};

const VENUE_LAT = 37.2870876;
const VENUE_LNG = 127.0577814;

export default function KakaoMap({ venue }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing-key' | 'sdk-error'>('loading');

  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;

    if (!key) {
      setStatus('missing-key');
      return;
    }

    const renderMap = () => {
      const kakao = (window as any).kakao;

      if (!kakao?.maps || !mapRef.current) {
        setStatus('sdk-error');
        return;
      }

      kakao.maps.load(() => {
        try {
          if (!mapRef.current) return;

          const position = new kakao.maps.LatLng(VENUE_LAT, VENUE_LNG);
          const map = new kakao.maps.Map(mapRef.current, {
            center: position,
            level: 4,
          });

          map.setDraggable(false);
          map.setZoomable(false);

          new kakao.maps.Marker({
            map,
            position,
          });

          const overlayContent = document.createElement('div');
          overlayContent.className = 'kakao-map-label';
          overlayContent.textContent = venue;

          new kakao.maps.CustomOverlay({
            map,
            position,
            content: overlayContent,
            yAnchor: 2.55,
          });

          setStatus('ready');
        } catch {
          setStatus('sdk-error');
        }
      });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-map-sdk="true"]');

    if (existing) {
      if ((window as any).kakao?.maps) {
        renderMap();
      } else {
        existing.addEventListener('load', renderMap, { once: true });
        existing.addEventListener('error', () => setStatus('sdk-error'), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.dataset.kakaoMapSdk = 'true';
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;
    script.addEventListener('load', renderMap, { once: true });
    script.addEventListener('error', () => setStatus('sdk-error'), { once: true });
    document.head.appendChild(script);
  }, [venue]);

  return (
    <div className="kakao-map-card">
      <div ref={mapRef} className="kakao-map" aria-label={`${venue} 위치 지도`} />
      {status !== 'ready' && (
        <div className="kakao-map-state" role="status">
          {status === 'loading' && '지도를 불러오는 중입니다.'}
          {status === 'missing-key' && '지도 API 키 설정이 필요합니다.'}
          {status === 'sdk-error' && '카카오 지도 설정을 확인해주세요.'}
        </div>
      )}
    </div>
  );
}
