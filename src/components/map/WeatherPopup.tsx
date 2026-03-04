'use client'

import type { WeatherData } from './layers/weather-layers'

interface WeatherPopupProps {
  data: WeatherData | null
  loading: boolean
}

/** Wind degree → compass direction */
function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export function WeatherPopup({ data, loading }: WeatherPopupProps) {
  if (loading) {
    return (
      <div className="p-1 flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ background: 'var(--wp-control-bg)' }}
        />
        <span className="text-[11px]" style={{ color: 'var(--wp-text-secondary)' }}>
          Loading weather...
        </span>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-1 min-w-[180px]">
      {/* Header: icon + city + description */}
      <div className="flex items-center gap-2 mb-1.5">
        <img
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
          alt={data.description}
          width={36}
          height={36}
          className="-ml-1 -my-1"
        />
        <div>
          <p className="text-[12px] font-semibold leading-tight">{data.cityName}</p>
          <p className="text-[10px] capitalize leading-tight" style={{ color: 'var(--wp-text-secondary)' }}>
            {data.description}
          </p>
        </div>
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-[20px] font-bold leading-none">{data.temp}°</span>
        <span className="text-[10px]" style={{ color: 'var(--wp-text-secondary)' }}>
          Feels {data.feelsLike}°
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <DetailRow label="Humidity" value={`${data.humidity}%`} />
        <DetailRow label="Wind" value={`${data.windSpeed} mph ${windDirection(data.windDeg)}`} />
        <DetailRow label="Clouds" value={`${data.clouds}%`} />
        <DetailRow label="Visibility" value={`${Math.round(data.visibility / 1609)} mi`} />
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-1">
      <span className="text-[10px]" style={{ color: 'var(--wp-text-muted)' }}>
        {label}
      </span>
      <span className="text-[10px] font-medium">{value}</span>
    </div>
  )
}
