// app/LeavesApproval.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

type LeaveRequest = {
  id: string;
  barberId: string;
  salonId: string;
  type: "Leave" | "Permission";
  date: string;
  fromTime?: string;
  toTime?: string;
  reason: string;
  status: "Waiting for Approval" | "Approved" | "Rejected";
  rejectReason?: string;
  createdAt?: any;
};

export default function LeavesApproval() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [salonId, setSalonId] = useState<string>("");

  // For rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Load salonId and fetch requests
  useEffect(() => {
    const load = async () => {
      const sId = (await AsyncStorage.getItem("salonId")) || "";
      setSalonId(sId);

      if (sId) {
        const q = query(collection(db, "leaves"), where("salonId", "==", sId));
        const unsub = onSnapshot(q, (snap) => {
          const data = snap.docs.map(
            (docSnap) =>
              ({
                id: docSnap.id,
                ...docSnap.data(),
              } as LeaveRequest)
          );
          setRequests(data);
        });
        return unsub;
      }
    };
    load();
  }, []);

  // Approve action
  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "leaves", id), { status: "Approved" });
  };

  // Reject flow
  const openRejectModal = (id: string) => {
    setSelectedId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("❌ Please enter a reason for rejection");
      return;
    }
    if (selectedId) {
      await updateDoc(doc(db, "leaves", selectedId), {
        status: "Rejected",
        rejectReason: rejectReason,
      });
    }
    setShowRejectModal(false);
    setSelectedId(null);
    setRejectReason("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Heading */}
      <Text
        style={{
          color: colors.primary,
          fontSize: 20,
          fontWeight: "bold",
          margin: 16,
        }}
      >
        Barber Leave Requests
      </Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
            No leave requests yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#111",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: "bold" }}>
              {item.type} - {item.date}
            </Text>

            {item.fromTime && item.toTime && (
              <Text style={{ color: "#ccc" }}>
                ⏰ {item.fromTime} - {item.toTime}
              </Text>
            )}

            <Text style={{ color: "#fff" }}>Reason: {item.reason}</Text>

            {item.rejectReason && (
              <Text style={{ color: "red" }}>
                Rejection Note: {item.rejectReason}
              </Text>
            )}

            <Text
              style={{
                color:
                  item.status === "Approved"
                    ? "lightgreen"
                    : item.status === "Rejected"
                    ? "red"
                    : "orange",
              }}
            >
              Status: {item.status}
            </Text>

            {/* Action Buttons if Waiting */}
            {item.status === "Waiting for Approval" && (
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: "lightgreen",
                    padding: 10,
                    borderRadius: 6,
                    marginRight: 5,
                  }}
                  onPress={() => handleApprove(item.id)}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#000",
                      fontWeight: "bold",
                    }}
                  >
                    Approve
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: "red",
                    padding: 10,
                    borderRadius: 6,
                    marginLeft: 5,
                  }}
                  onPress={() => openRejectModal(item.id)}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Reject Reason Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
              Enter Rejection Reason
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#ccc",
                  padding: 10,
                  borderRadius: 6,
                  marginRight: 10,
                }}
                onPress={() => setShowRejectModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  padding: 10,
                  borderRadius: 6,
                }}
                onPress={handleReject}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
