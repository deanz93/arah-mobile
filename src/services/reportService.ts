import firestore from '@react-native-firebase/firestore'
import type { Report, ReportType, Coordinates, BoundingBox } from '@/types'
import { REPORT_TTL_HOURS } from '@/constants'

function toReport(id: string, data: FirebaseFirestore.DocumentData): Report {
  return {
    id,
    type: data.type as ReportType,
    coordinates: { latitude: data.lat as number, longitude: data.lng as number },
    upvotes: data.upvotes as number,
    downvotes: data.downvotes as number,
    createdAt: (data.created_at as FirebaseFirestore.Timestamp).toDate(),
    expiresAt: (data.expires_at as FirebaseFirestore.Timestamp).toDate(),
  }
}

export function subscribeToReports(
  bbox: BoundingBox,
  onUpdate: (reports: Report[]) => void,
): () => void {
  return firestore()
    .collection('reports')
    .where('active', '==', true)
    .where('lat', '>=', bbox.sw.latitude)
    .where('lat', '<=', bbox.ne.latitude)
    .onSnapshot((snapshot) => {
      const reports = snapshot.docs
        .filter((doc) => {
          const lng = doc.data().lng as number
          return lng >= bbox.sw.longitude && lng <= bbox.ne.longitude
        })
        .map((doc) => toReport(doc.id, doc.data()))
      onUpdate(reports)
    })
}

export async function submitReport(
  type: ReportType,
  coordinates: Coordinates,
  userHash: string,
): Promise<string> {
  const ttlHours = REPORT_TTL_HOURS[type] ?? 2
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000)

  const ref = await firestore().collection('reports').add({
    type,
    lat: coordinates.latitude,
    lng: coordinates.longitude,
    user_hash: userHash,
    upvotes: 0,
    downvotes: 0,
    active: true,
    created_at: firestore.Timestamp.fromDate(now),
    expires_at: firestore.Timestamp.fromDate(expiresAt),
  })

  return ref.id
}

export async function voteReport(id: string, vote: 'up' | 'down'): Promise<void> {
  const field = vote === 'up' ? 'upvotes' : 'downvotes'
  await firestore()
    .collection('reports')
    .doc(id)
    .update({ [field]: firestore.FieldValue.increment(1) })
}
