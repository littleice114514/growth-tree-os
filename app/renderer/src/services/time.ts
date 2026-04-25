import dayjs from 'dayjs'

export function formatDateTime(value: string) {
  return dayjs(value).format('YYYY/MM/DD HH:mm')
}
