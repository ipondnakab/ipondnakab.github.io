import { db } from "@/shared/lib/firebase";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";

export interface RoomParticipant {
  id: string;
  name: string;
  seenAt: number;
}
const ACTIVE_MS = 45000;
export const connectRoomPresence = (
  code: string,
  onParticipants: (participants: RoomParticipant[]) => void,
  onError: (error: Error) => void,
) => {
  const id = crypto.randomUUID();
  const participants = collection(db, "badmintonScoreRooms", code, "participants");
  const self = doc(participants, id);
  let disposed = false;
  let last: RoomParticipant[] = [];
  const emit = () => onParticipants(last.filter((p) => Date.now() - p.seenAt < ACTIVE_MS));
  const announce = () => {
    if (disposed) return;
    void setDoc(self, { name: "Guest-" + id.slice(0, 4), seenAt: Date.now() })
      .catch(onError);
  };
  const stop = onSnapshot(participants, (snapshot) => {
    last = snapshot.docs.map((item) => ({
      id: item.id,
      name: String(item.data().name || "Guest").slice(0, 32),
      seenAt: Number(item.data().seenAt || 0),
    }));
    emit();
  }, onError);
  announce();
  const heartbeat = setInterval(announce, 15000);
  const sweep = setInterval(emit, 5000);
  return { id, disconnect: () => {
    disposed = true;
    clearInterval(heartbeat);
    clearInterval(sweep);
    stop();
    void deleteDoc(self).catch(() => {});
  } };
};
