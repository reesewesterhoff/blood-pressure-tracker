export interface BloodPressureReading {
  _id?: string
  systolic: number
  diastolic: number
  recordedAt?: string | Date
  isHealthy?: boolean
}

export interface BloodPressureStats {
  averageSystolic: number
  averageDiastolic: number
  count: number
  minSystolic: number
  maxSystolic: number
  minDiastolic: number
  maxDiastolic: number
}
