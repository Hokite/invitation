import { useEffect, useRef, useState } from 'react';

type Props = {
  address: string;
  venue: string;
};

export default function KakaoMap({ address, venue }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing-key' | 'error'>('loading');

  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;

    if (!key) {
      setStatus('missing-key');
      return;
    }

    const renderMap = () => {
      const kakao = (window as any).kakao;
      if (!kakao?.maps || !mapRef.current) {
        setStatus('error');
        return;
      }

      kakao.maps.load(() => {
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result: any[], geocoderStatus: string) => {
          if (geocoderStatus !== kakao.maps.services.Status.OK || !result[0]) {
            setStatus('error');
            return;
          }

          const position = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
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
        });
      });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-map-sdk="true"]');

    if (existing) {
      if ((window as any).kakao?.maps) {
        renderMap();
      } else {
        existing.addEventListener('load', renderMap, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.dataset.kakaoMapSdk = 'true';
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
    script.addEventListener('load', renderMap, { once: true });
    script.addEventListener('error', () => setStatus('error'), { once: true });
    document.head.appendChild(script);
  }, [address, venue]);

  return (
    <div className="kakao-map-card">
      <div ref={mapRef} className="kakao-map" aria-label={`${venue} 위치 지도`} />
      {status !== 'ready' && (
        <div className="kakao-map-state" role="status">
          {status === 'loading' && '지도를 불러오는 중입니다.'}
          {status === 'missing-key' && '지도 API 설정이 필요합니다.'}
          {status === 'error' && '지도를 불러오지 못했습니다.'}
        </div>
      )}
    </div>
  );
}
