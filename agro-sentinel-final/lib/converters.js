// lib/converters.js

export function formatArea(hectares, unit = 'metric') {
  if (unit === 'imperial') {
    const acres = hectares * 2.47105;
    return `${acres.toFixed(2)} ac`;
  }
  return `${hectares.toFixed(2)} Ha`;
}

export function formatTemp(celsius, unit = 'metric') {
  if (unit === 'imperial') {
    const fahrenheit = (celsius * 9/5) + 32;
    return `${fahrenheit.toFixed(1)} °F`;
  }
  return `${celsius.toFixed(1)} °C`;
}