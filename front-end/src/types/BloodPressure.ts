export interface BloodPressureReading {
  _id?: string
  systolic: number
  diastolic: number
  recordedAt?: string | Date
  isHealthy?: boolean
}
