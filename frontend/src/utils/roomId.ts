// Generate deterministic room ID from two user IDs
export function generateRoomId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `room_${sorted[0]}_${sorted[1]}`;
}
