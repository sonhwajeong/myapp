'use client'

import { useEffect, useState, useRef } from 'react'
import { getCurrentAccessToken } from '../../utils/auth'
import { Header } from '../../components/Header'

declare global {
  interface Window {
    kakao: any
  }
}

interface Store {
  id: number
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  openTime: string
  closeTime: string
  description?: string
}

export default function StoresPage() {
  const [token, setToken] = useState<string>('')
  const [isAppContext, setIsAppContext] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [nearbyStores, setNearbyStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const mapContainer = useRef<HTMLDivElement>(null)

  // 샘플 매장 데이터 (실제 서비스에서는 API로 받아올 데이터)
  const sampleStores: Store[] = [
    {
      id: 1,
      name: 'MyApp 강남점',
      address: '서울특별시 강남구 테헤란로 152',
      phone: '02-1234-5678',
      latitude: 37.5012767,
      longitude: 127.0396597,
      openTime: '09:00',
      closeTime: '22:00',
      description: '강남역 근처 대형 매장'
    },
    {
      id: 2,
      name: 'MyApp 홍대점',
      address: '서울특별시 마포구 양화로 160',
      phone: '02-2345-6789',
      latitude: 37.5563558,
      longitude: 126.9229878,
      openTime: '10:00',
      closeTime: '23:00',
      description: '홍대입구역 도보 5분'
    },
    {
      id: 3,
      name: 'MyApp 잠실점',
      address: '서울특별시 송파구 올림픽로 300',
      phone: '02-3456-7890',
      latitude: 37.5130625,
      longitude: 127.1025896,
      openTime: '09:30',
      closeTime: '22:30',
      description: '롯데월드타워 근처'
    }
  ]

  useEffect(() => {
    // 쿠키와 WebView 컨텍스트 확인
    if (typeof window !== 'undefined') {
      const hasReactNativeWebView = !!(window as any).ReactNativeWebView
      const hasGetAppToken = !!(window as any).getAppToken

      setIsAppContext(hasReactNativeWebView || hasGetAppToken)

      // 쿠키에서 토큰 가져오기
      const cookieToken = getCurrentAccessToken()
      if (cookieToken) {
        setToken(cookieToken)
      } else if ((window as any).getAppToken) {
        // WebView 환경에서 토큰이 없으면 앱에서 가져오기 시도
        const loadToken = async () => {
          try {
            const appToken = await (window as any).getAppToken()
            if (appToken) {
              setToken(appToken)
            }
          } catch (error) {
            console.error('Failed to get token from app:', error)
          }
        }
        loadToken()
      }

      console.log('🗺️ Stores page loaded:', {
        isWebView: hasReactNativeWebView,
        hasCookieToken: !!cookieToken,
        hasAppTokenFunction: hasGetAppToken
      })

      // 현재 호스트 확인 후 적절한 지도 로딩 방식 선택
      const currentHost = window.location.hostname
      const currentOrigin = window.location.origin
      console.log('현재 호스트:', currentHost)
      console.log('현재 오리진:', currentOrigin)
      console.log('WebView 환경:', hasReactNativeWebView || hasGetAppToken)

      // WebView 환경이거나 localhost/127.0.0.1/내부 IP에서는 카카오 지도 로드 시도
      if (hasReactNativeWebView || hasGetAppToken ||
          currentHost === 'localhost' ||
          currentHost === '127.0.0.1' ||
          currentHost.startsWith('192.168.') ||
          currentHost.startsWith('10.') ||
          currentHost.startsWith('172.')) {

        console.log('🗺️ 카카오 지도 로드 시도 (WebView 또는 로컬 환경)');
        loadKakaoMapScript()
      } else {
        // 기타 환경에서는 대체 지도 방식 사용
        console.log('🔄 대체 지도 방식 사용');
        loadAlternativeMap()
      }
    }
  }, [])

  const loadKakaoMapScript = () => {
    console.log('카카오 지도 스크립트 로드 시작')

    // 이미 카카오 지도가 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log('카카오 지도 이미 로드됨')
      initializeKakaoMap()
      return
    }

    // 기존 스크립트 제거
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    // JavaScript 키 사용 및 autoload=false 설정
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=0b4d7ca853d21021a6fee701aab68d7a&autoload=false`

    script.onload = () => {
      console.log('카카오 지도 스크립트 로드 완료')
      // autoload=false이므로 수동으로 load 호출
      window.kakao.maps.load(() => {
        console.log('카카오 지도 SDK 초기화 완료')
        initializeKakaoMap()
      })
    }

    script.onerror = (error) => {
      console.error('카카오 지도 스크립트 로드 실패:', error)
      console.log('📋 WebView 환경 문제 해결 체크리스트:')
      console.log('1. API 키가 올바른지 확인: 0b4d7ca853d21021a6fee701aab68d7a')
      console.log('2. 카카오 개발자 콘솔에서 웹 플랫폼 등록 확인')
      console.log('3. 사이트 도메인에 다음 도메인들이 등록되었는지 확인:')
      console.log('   - http://localhost:3000')
      console.log('   - http://127.0.0.1:3000')
      console.log(`   - ${window.location.origin} (현재 접근 도메인)`)
      console.log('4. JavaScript 키 활성화 상태 확인')
      console.log('5. 카카오맵 API 서비스 활성화 확인')
      console.log('6. WebView 환경에서의 CORS 설정 확인')

      // WebView 환경이면 대체 지도로 전환
      if ((window as any).ReactNativeWebView || (window as any).getAppToken) {
        console.log('🔄 WebView 환경에서 지도 로드 실패 - 대체 지도로 전환')
        loadAlternativeMap()
        return
      }

      setMapError('지도를 로드할 수 없습니다. 개발자 도구 콘솔을 확인해주세요.')
      setMapLoading(false)
    }

    document.head.appendChild(script)
  }

  const loadAlternativeMap = () => {
    console.log('대체 지도 방식으로 초기화 (내부 IP 환경)')
    setMapLoading(false)
    setNearbyStores(sampleStores)

    // 현재 위치만 가져오기 (거리 계산용)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCurrentLocation({ lat, lng })
          console.log('현재 위치 확인:', lat, lng)
        },
        (error) => {
          console.error('현재 위치를 가져올 수 없습니다:', error)
        }
      )
    }
  }

  const initializeKakaoMap = () => {
    console.log('카카오 지도 초기화 시작')

    if (!mapContainer.current) {
      console.error('지도 컨테이너를 찾을 수 없습니다')
      setMapError('지도 컨테이너 오류')
      setMapLoading(false)
      return
    }

    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오 지도 객체가 없습니다')
      setMapError('카카오 지도 라이브러리 로드 실패')
      setMapLoading(false)
      return
    }

    try {
      // 지도 옵션 설정
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
        level: 8 // 지도 확대 레벨
      }

      // 지도 생성
      const kakaoMap = new window.kakao.maps.Map(mapContainer.current, mapOption)
      setMap(kakaoMap)
      console.log('카카오 지도 생성 완료')

      // 지도 크기 재조정 (컨테이너 크기에 맞게)
      setTimeout(() => {
        kakaoMap.relayout()
        console.log('지도 크기 재조정 완료')
      }, 100)

      // 현재 위치 가져오기
      getCurrentPosition(kakaoMap)

      // 매장 마커 표시
      displayStores(kakaoMap, sampleStores)
      setNearbyStores(sampleStores)
      setMapLoading(false)

    } catch (error) {
      console.error('지도 초기화 오류:', error)
      setMapError(`지도 초기화 실패: ${error.message}`)
      setMapLoading(false)
    }
  }

  const getCurrentPosition = (kakaoMap: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const locPosition = new window.kakao.maps.LatLng(lat, lng)

          setCurrentLocation({ lat, lng })

          // 현재 위치 마커 표시
          const marker = new window.kakao.maps.Marker({
            position: locPosition
          })
          marker.setMap(kakaoMap)

          // 현재 위치로 지도 중심 이동
          kakaoMap.setCenter(locPosition)
          kakaoMap.setLevel(6)

          // 현재 위치 정보창
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: '<div style="padding:10px;font-size:12px;text-align:center;">현재 위치</div>'
          })
          infoWindow.open(kakaoMap, marker)
        },
        (error) => {
          console.error('현재 위치를 가져올 수 없습니다:', error)
        }
      )
    }
  }

  const displayStores = (kakaoMap: any, stores: Store[]) => {
    stores.forEach(store => {
      const markerPosition = new window.kakao.maps.LatLng(store.latitude, store.longitude)

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        title: store.name
      })
      marker.setMap(kakaoMap)

      // 매장 정보창
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px;min-width:200px;font-size:12px;">
            <div style="font-weight:bold;margin-bottom:5px;">${store.name}</div>
            <div style="margin-bottom:3px;">${store.address}</div>
            <div style="margin-bottom:3px;">📞 ${store.phone}</div>
            <div style="color:#666;">🕐 ${store.openTime} - ${store.closeTime}</div>
            <button onclick="selectStore(${store.id})" style="margin-top:8px;padding:5px 10px;background:#007bff;color:white;border:none;border-radius:3px;cursor:pointer;font-size:11px;">
              매장 선택
            </button>
          </div>
        `
      })

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(kakaoMap, marker)
      })
    })
  }

  // 전역 함수로 매장 선택 처리
  useEffect(() => {
    (window as any).selectStore = (storeId: number) => {
      const store = sampleStores.find(s => s.id === storeId)
      if (store) {
        setSelectedStore(store)
      }
    }

    return () => {
      delete (window as any).selectStore
    }
  }, [])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getStoresWithDistance = () => {
    if (!currentLocation) return nearbyStores

    return nearbyStores
      .map(store => ({
        ...store,
        distance: calculateDistance(
          currentLocation.lat, currentLocation.lng,
          store.latitude, store.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
  }

  const formatDistance = (distance: number) => {
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  return (
    <div style={styles.container}>
      <Header showBackButton={true} backUrl="/home" />

      <div style={styles.content}>
        <div style={styles.mapSection}>
          {mapLoading && (
            <div style={styles.mapPlaceholder}>
              <div style={styles.loadingText}>지도를 불러오는 중...</div>
            </div>
          )}
          {mapError && (
            <div style={styles.mapPlaceholder}>
              <div style={styles.errorText}>{mapError}</div>
              <button
                onClick={() => {
                  setMapError(null)
                  setMapLoading(true)
                  loadKakaoMapScript()
                }}
                style={styles.retryButton}
              >
                다시 시도
              </button>
            </div>
          )}
          {/* 실제 카카오 지도 (localhost에서만) */}
          <div
            ref={mapContainer}
            style={{
              ...styles.map,
              display: mapLoading || mapError || !map ? 'none' : 'block'
            }}
          ></div>

          {/* 대체 지도 화면 (내부 IP 환경) */}
          {!mapLoading && !mapError && !map && (
            <div style={styles.alternativeMap}>
              <div style={styles.mapInfo}>
                <h3 style={styles.mapTitle}>🗺️ 매장 위치 안내</h3>
                <p style={styles.mapDescription}>
                  개발 환경에서는 지도를 직접 표시할 수 없습니다.<br />
                  아래 매장 목록에서 매장을 선택하면 카카오맵으로 연결됩니다.
                </p>
                <div style={styles.mapButtons}>
                  {currentLocation && (
                    <button
                      onClick={() => {
                        const url = `https://map.kakao.com/link/search/MyApp 매장`
                        if (typeof window !== 'undefined') {
                          if ((window as any).ReactNativeWebView) {
                            window.location.href = url
                          } else {
                            window.open(url, '_blank')
                          }
                        }
                      }}
                      style={styles.mapButton}
                    >
                      🔍 근처 매장 찾기
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const url = `https://map.kakao.com/link/search/서울 매장`
                      if (typeof window !== 'undefined') {
                        if ((window as any).ReactNativeWebView) {
                          window.location.href = url
                        } else {
                          window.open(url, '_blank')
                        }
                      }
                    }}
                    style={styles.mapButton}
                  >
                    🗺️ 카카오맵으로 보기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.storeList}>
          <h3 style={styles.listTitle}>
            {currentLocation ? '가까운 매장' : '매장 목록'}
          </h3>

          {getStoresWithDistance().map((store) => (
            <div
              key={store.id}
              style={{
                ...styles.storeCard,
                ...(selectedStore?.id === store.id ? styles.selectedStore : {})
              }}
              onClick={() => {
                setSelectedStore(store)
                if (map && window.kakao && window.kakao.maps) {
                  const position = new window.kakao.maps.LatLng(store.latitude, store.longitude)
                  map.setCenter(position)
                  map.setLevel(4)
                  console.log(`지도 중심을 ${store.name}으로 이동`)
                }
              }}
            >
              <div style={styles.storeHeader}>
                <h4 style={styles.storeName}>{store.name}</h4>
                {'distance' in store && (
                  <span style={styles.distance}>{formatDistance(store.distance)}</span>
                )}
              </div>
              <p style={styles.storeAddress}>{store.address}</p>
              <div style={styles.storeInfo}>
                <span style={styles.phone}>📞 {store.phone}</span>
                <span style={styles.hours}>🕐 {store.openTime} - {store.closeTime}</span>
              </div>
              {store.description && (
                <p style={styles.description}>{store.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedStore && (
        <div style={styles.selectedStoreInfo}>
          <div style={styles.selectedStoreContent}>
            <h4 style={styles.selectedStoreName}>선택된 매장: {selectedStore.name}</h4>
            <div style={styles.actionButtons}>
              <button
                style={styles.callButton}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `tel:${selectedStore.phone}`
                  }
                }}
              >
                전화걸기
              </button>
              <button
                style={styles.directionsButton}
                onClick={() => {
                  const query = encodeURIComponent(`${selectedStore.name} ${selectedStore.address}`)
                  const url = `https://map.kakao.com/link/search/${query}`
                  window.open(url, '_blank')
                }}
              >
                길찾기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  mapSection: {
    flex: 2,
    minHeight: '50vh',
    height: '50vh',
    position: 'relative' as const,
  },
  map: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
  },
  storeList: {
    flex: 1,
    minHeight: '200px',
    maxHeight: '40vh',
    overflowY: 'auto' as const,
    backgroundColor: 'white',
    borderTop: '1px solid #ddd',
    padding: '15px',
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
    margin: '0 0 15px 0',
  },
  storeCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'white',
  },
  selectedStore: {
    borderColor: '#007bff',
    backgroundColor: '#f0f7ff',
  },
  storeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  storeName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
  },
  distance: {
    fontSize: '12px',
    color: '#007bff',
    fontWeight: 'bold',
    backgroundColor: '#e7f3ff',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  storeAddress: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 8px 0',
  },
  storeInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '13px',
    color: '#555',
  },
  phone: {
    color: '#28a745',
  },
  hours: {
    color: '#666',
  },
  description: {
    fontSize: '12px',
    color: '#888',
    margin: '8px 0 0 0',
    fontStyle: 'italic',
  },
  selectedStoreInfo: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px',
    borderTop: '1px solid #0056b3',
  },
  selectedStoreContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStoreName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  callButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  directionsButton: {
    backgroundColor: 'white',
    color: '#007bff',
    border: '1px solid white',
    padding: '8px 15px',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
  },
  loadingText: {
    fontSize: '16px',
    color: '#666',
  },
  errorText: {
    fontSize: '16px',
    color: '#dc3545',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  mapInfo: {
    textAlign: 'center' as const,
    padding: '20px',
  },
  mapTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#333',
  },
  mapDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
  },
  mapButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  mapButton: {
    padding: '10px 20px',
    backgroundColor: '#FEE500',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  alternativeMap: {
    width: '100%',
    height: '100%',
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    border: '2px dashed #007bff',
    borderRadius: '8px',
  },
}