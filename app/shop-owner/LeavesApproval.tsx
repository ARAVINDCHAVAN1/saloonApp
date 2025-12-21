// app/LeavesApproval.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  getDoc,
} from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from "react-native";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";

// Header / Footer / Left menu
import ShopOwnerHeader from "./ShopOwnerHeader";
import ShopOwnerBottomNav from "./ShopOwnerBottomNav";
import LeftMenu from "./LeftMenu";

// TYPES
type LeaveRequest = {
  id: string;
  barberId: string;
  salonId: string;
  type: string;
  date: string;
  fromTime?: string;
  toTime?: string;
  reason: string;
  status: string;
  rejectReason?: string;
};

type LeaveWithBarber = LeaveRequest & {
  barberName?: string;
};

export default function LeavesApproval() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [history, setHistory] = useState<LeaveWithBarber[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [salonId, setSalonId] = useState<string>("");

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // LEFT MENU
  const [menuVisible, setMenuVisible] = useState(false);
  const slide = useRef(new Animated.Value(-270)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const closeMenu = () => {
    Animated.timing(slide, { toValue: -270, duration: 200, useNativeDriver: false }).start(() =>
      setMenuVisible(false)
    );
  };

  // HISTORY PANEL
  const historySlide = useRef(new Animated.Value(400)).current;

  const openHistory = () => {
    setShowHistory(true);
    Animated.timing(historySlide, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    loadHistory();
  };

  const closeHistory = () => {
    Animated.timing(historySlide, { toValue: 400, duration: 250, useNativeDriver: false }).start(() =>
      setShowHistory(false)
    );
  };

  // -------------------------------------------
  // ✅ LOAD LEAVES IN REALTIME
  // -------------------------------------------
  useEffect(() => {
    const load = async () => {
      // ⭐ FIX: use "shopId" not "salonId"
      const sId = (await AsyncStorage.getItem("shopId")) || "";
      console.log("Loaded SalonId:", sId);

      setSalonId(sId);

      if (sId) {
        const q = query(collection(db, "leaves"), where("salonId", "==", sId));

        const unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LeaveRequest[];

          console.log("Fetched Leaves:", list.length);
          setRequests(list);
        });

        return unsub;
      }
    };
    load();
  }, []);

  // -------------------------------------------
  // ⭐ LOAD HISTORY (APPROVED / REJECTED)
  // -------------------------------------------
  const loadHistory = async () => {
    let arr: LeaveWithBarber[] = [];

    for (const r of requests) {
      if (r.status === "Approved" || r.status === "Rejected") {
        const barberRef = doc(db, "barbers", r.barberId);
        const barberSnap = await getDoc(barberRef);

        arr.push({
          ...r,
          barberName: barberSnap.exists() ? barberSnap.data().name : "Unknown Barber",
        });
      }
    }
    setHistory(arr);
  };

  // -------------------------------------------
  // ACTIONS: APPROVE / REJECT
  // -------------------------------------------
  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "leaves", id), { status: "Approved" });
  };

  const openReject = (id: string) => {
    setSelectedId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert("Enter rejection reason");

    await updateDoc(doc(db, "leaves", selectedId!), {
      status: "Rejected",
      rejectReason,
    });

    setShowRejectModal(false);
  };

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ShopOwnerHeader openMenu={openMenu} title="Leaves Approval" />

      {/* ⭐ LEAVE HISTORY BUTTON */}
      <TouchableOpacity
        onPress={openHistory}
        style={{
          alignSelf: "flex-end",
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          marginRight: 16,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "#000", fontWeight: "bold" }}>Leave History →</Text>
      </TouchableOpacity>

      {/* ⭐ MAIN LIST */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 130 }}
        ListEmptyComponent={
          <Text style={{ color: "gray", textAlign: "center" }}>No leave requests yet.</Text>
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
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "bold" }}>
              {item.type} • {item.date}
            </Text>

            {item.fromTime && (
              <Text style={{ color: "#ccc" }}>Time: {item.fromTime} → {item.toTime}</Text>
            )}

            <Text style={{ color: "white" }}>Reason: {item.reason}</Text>

            <Text
              style={{
                marginTop: 5,
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

            {/* ACTION BUTTONS */}
            {item.status === "Waiting for Approval" && (
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => handleApprove(item.id)}
                  style={{
                    flex: 1,
                    backgroundColor: "lightgreen",
                    padding: 10,
                    borderRadius: 6,
                    marginRight: 5,
                  }}
                >
                  <Text style={{ textAlign: "center", fontWeight: "bold" }}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openReject(item.id)}
                  style={{
                    flex: 1,
                    backgroundColor: "red",
                    padding: 10,
                    borderRadius: 6,
                    marginLeft: 5,
                  }}
                >
                  <Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* ⭐ REJECT MODAL */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View style={{ width: "80%", backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Enter Rejection Reason</Text>

            <TextInput
              placeholder="Reason..."
              value={rejectReason}
              onChangeText={setRejectReason}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                marginTop: 10,
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => setShowRejectModal(false)}
                style={{ marginRight: 10 }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReject}
                style={{ backgroundColor: "red", padding: 10, borderRadius: 8 }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ⭐ RIGHT-SLIDE HISTORY PANEL */}
      {showHistory && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "85%",
            backgroundColor: "#111",
            paddingTop: 60,
            paddingHorizontal: 16,
            transform: [{ translateX: historySlide }],
            zIndex: 100,
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "bold" }}>
            Leave History
          </Text>

          <ScrollView style={{ marginTop: 20 }}>
            {history.map((h) => (
              <View
                key={h.id}
                style={{
                  backgroundColor: "#222",
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                  {h.barberName}
                </Text>

                <Text style={{ color: "white" }}>
                  {h.type} • {h.date}
                </Text>

                {h.fromTime && (
                  <Text style={{ color: "#ccc" }}>
                    Time: {h.fromTime} → {h.toTime}
                  </Text>
                )}

                <Text style={{ color: "#ddd" }}>Reason: {h.reason}</Text>

                {h.rejectReason && <Text style={{ color: "red" }}>Rejected: {h.rejectReason}</Text>}

                <Text
                  style={{
                    marginTop: 6,
                    color:
                      h.status === "Approved"
                        ? "lightgreen"
                        : h.status === "Rejected"
                        ? "red"
                        : "orange",
                  }}
                >
                  Status: {h.status}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={closeHistory}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 8,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ShopOwnerBottomNav />
      <LeftMenu visible={menuVisible} slide={slide} closeMenu={closeMenu} />
    </View>
  );
}
