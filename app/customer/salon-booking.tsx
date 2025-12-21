// app/customer/SalonBooking.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

const RAZORPAY_KEY = "rzp_live_Rl65VFlmszaAzA";

// ---------------- FIXED ADVANCE SLOTS ----------------
const fixedAdvanceSlots = [
  { id: 1, label: "11:00 AM - 11:45 AM", from: "11:00 AM", to: "11:45 AM" },
  { id: 2, label: "03:00 PM - 03:45 PM", from: "03:00 PM", to: "03:45 PM" },
  { id: 3, label: "05:00 PM - 05:45 PM", from: "05:00 PM", to: "05:45 PM" },
];

// ---------------- TYPES ----------------
type Barber = { id: string; name: string; specialization?: string; photoUrl?: string };
type SlotItem = {
  id: string;
  fromTime: string;
  toTime: string;
  barberId?: string | null;
  barberName: string;
  date: string;
};

const isFutureSlot = (slotDateString: string, fromTime: string) => {
  const now = new Date();
  const slotDate = new Date(slotDateString);
  if (slotDate < new Date(now.toDateString())) return false;

  const parseAMPM = (timeString: string) => {
    try {
      const cleaned = timeString.replace(/\./g, "").replace(/\s+/g, " ").trim();
      const parts = cleaned.split(" ");
      if (parts.length !== 2) return null;
      const [time, modifier] = parts;
      const [hStr, mStr] = time.split(":");
      let hours = Number(hStr);
      const minutes = Number(mStr);
      if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
      return { hours, minutes };
    } catch {
      return null;
    }
  };

  if (slotDate.toDateString() === now.toDateString()) {
    const parsed = parseAMPM(fromTime);
    if (!parsed) return false;
    const slotTime = new Date();
    slotTime.setHours(parsed.hours, parsed.minutes, 0, 0);
    if (slotTime <= now) return false;
  }
  return true;
};


const timeToMinutes = (time: string) => {
  const cleaned = time.replace(/\./g, "").replace(/\s+/g, " ").trim();
  const [t, modifier] = cleaned.split(" ");
  let [hours, minutes] = t.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};


export default function SalonBooking() {
  const { salonId, userId } = useLocalSearchParams();
  const router = useRouter();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  const [generalSlots, setGeneralSlots] = useState<SlotItem[]>([]);
  const [barberSlots, setBarberSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState("");

  const [amount, setAmount] = useState<number | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [advanceModalVisible, setAdvanceModalVisible] = useState(false);
  const [advanceLoading, setAdvanceLoading] = useState(false);

  const [selectedAdvanceSlot, setSelectedAdvanceSlot] = useState<any>(null);

  // ---------------- LOAD PRICES ----------------
  useEffect(() => {
    (async () => {
      if (!salonId) return;
      try {
        const q = query(collection(db, "galleries"), where("salonId", "==", salonId));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const data: any = snap.docs[0].data();
          setAmount(data.slotBookingAmount || 200);
          setAdvanceAmount(data.advanceBookingAmount || data.slotBookingAmount || 200);
        } else {
          setAmount(200);
          setAdvanceAmount(200);
        }
      } catch {
        setAmount(200);
        setAdvanceAmount(200);
      }
    })();
  }, [salonId]);

  // ---------------- LOAD CUSTOMER ----------------
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("customer");
      if (stored) {
        const c = JSON.parse(stored);
        setEmail(c.email || "");
        setPhone(c.phone || "");
      }
    })();
  }, []);

  // ---------------- LOAD BARBERS ----------------
  useEffect(() => {
    const loadBarbers = async () => {
      if (!salonId) return;
      const snap = await getDocs(query(collection(db, "barbers"), where("salonId", "==", salonId)));
      setBarbers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    };
    loadBarbers();
  }, [salonId]);

  // ---------------- LOAD SERVICES ----------------
  useEffect(() => {
    const loadServices = async () => {
      if (!salonId) return;

      const q = query(collection(db, "services"), where("salonId", "==", salonId));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setServices(list);
    };

    loadServices();
  }, [salonId]);

  // ---------------- LOAD GENERAL SLOTS ----------------
  useEffect(() => {
    const loadGeneral = async () => {
      if (!salonId) return;
      setLoading(true);

      const f = selectedDate.toDateString();
      const snap = await getDocs(
        query(
          collection(db, "slots"),
          where("salonId", "==", salonId),
          where("barberId", "==", null),
          where("date", "==", f),
          where("status", "==", "available")
        )
      );

      const items = snap.docs
        .map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            fromTime: data.fromTime,
            toTime: data.toTime,
            barberId: null,
            barberName: "General",
            date: data.date,
          };
        })
        .filter((s) => isFutureSlot(s.date, s.fromTime));

      setGeneralSlots(items);
      setLoading(false);
    };

    loadGeneral();
  }, [salonId, selectedDate]);

  // ---------------- LOAD BARBER SLOTS ----------------
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedBarber || !salonId) {
        setBarberSlots([]);
        return;
      }

      setLoading(true);

      const f = selectedDate.toDateString();
      const snap = await getDocs(
        query(
          collection(db, "slots"),
          where("salonId", "==", salonId),
          where("barberId", "==", selectedBarber.id),
          where("date", "==", f),
          where("status", "==", "available")
        )
      );

      const items = snap.docs
        .map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            fromTime: data.fromTime,
            toTime: data.toTime,
            barberId: selectedBarber.id,
            barberName: selectedBarber.name,
            date: data.date,
          };
        })
        .filter((s) => isFutureSlot(s.date, s.fromTime));

      setBarberSlots(items);
      setLoading(false);
    };

    loadSlots();
  }, [selectedBarber, salonId, selectedDate]);

const visibleSlots = useMemo(() => {
  return [...barberSlots, ...generalSlots].sort(
    (a, b) => timeToMinutes(a.fromTime) - timeToMinutes(b.fromTime)
  );
}, [barberSlots, generalSlots]);

  // ---------------- NORMAL BOOKING ----------------
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return Alert.alert("Please select a slot");
    if (!amount) return Alert.alert("Amount missing");

    const options = {
      description: "Salon Booking Payment",
      currency: "INR",
      key: RAZORPAY_KEY,
      amount: amount * 100,
      name: "Salon Booking",
      prefill: { email, contact: phone, name: "Customer" },
      theme: { color: colors.primary },
    };

    RazorpayCheckout.open(options)
      .then(async (data: any) => {
        await addDoc(collection(db, "payments"), {
          userId,
          salonId,
          barberId: selectedSlot.barberId || null,
          slotId: selectedSlot.id,
          slotTime: `${selectedSlot.fromTime} - ${selectedSlot.toTime}`,
          date: selectedSlot.date,
          amount,
          paymentId: data.razorpay_payment_id,
          status: "paid",
          paymentStatus: "captured",
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "slots", selectedSlot.id), { status: "booked" });

        Alert.alert("Success", "Booking confirmed!", [
          { text: "OK", onPress: () => router.push("/customer/booking-history") },
        ]);
      })
      .catch(() => Alert.alert("Payment cancelled"));
  };

  // ---------------- ADVANCE BOOKING ----------------
  const handleAdvanceSubmit = async () => {
    if (!selectedAdvanceSlot)
      return Alert.alert("Select a slot");

    if (!selectedService)
      return Alert.alert("Select a service");

    if (!advanceAmount)
      return Alert.alert("Advance amount missing");

    setAdvanceLoading(true);

    const advData: any = {
      userId,
      salonId,
      barberId: selectedBarber ? selectedBarber.id : null,
      barberName: selectedBarber ? selectedBarber.name : "General",
      date: new Date().toDateString(),
      fromTime: selectedAdvanceSlot.from,
      toTime: selectedAdvanceSlot.to,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      amount: advanceAmount,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    const options = {
      description: "Advance Booking",
      currency: "INR",
      key: RAZORPAY_KEY,
      amount: advanceAmount * 100,
      name: "Advance Booking",
      prefill: { email, contact: phone, name: "Customer" },
      theme: { color: colors.primary },
    };

    RazorpayCheckout.open(options)
      .then(async (data: any) => {
        advData.paymentId = data.razorpay_payment_id;
        advData.paymentStatus = "captured";

        await addDoc(collection(db, "advanceBookings"), advData);
        await addDoc(collection(db, "payments"), {
          userId,
          salonId,
          barberId: advData.barberId,
          date: advData.date,
          slotTime: `${advData.fromTime} - ${advData.toTime}`,
          amount: advanceAmount,
          paymentId: data.razorpay_payment_id,
          status: "advance",
          paymentStatus: "captured",
          createdAt: serverTimestamp(),
        });

        Alert.alert("Success", "Advance booking completed!");
        setAdvanceModalVisible(false);
      })
      .catch(async () => {
        await addDoc(collection(db, "advanceBookings"), advData);
        Alert.alert("Saved", "Advance booking saved without payment.");
        setAdvanceModalVisible(false);
      })
      .finally(() => setAdvanceLoading(false));
  };

  // ---------------- RETURN UI ----------------
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingTop: 45,
          paddingBottom: 12,
          paddingHorizontal: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            marginLeft: 12,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 10,
            paddingHorizontal: 10,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#000" />
          <TextInput
            placeholder="Search barber..."
            placeholderTextColor="#666"
            style={{ flex: 1, marginLeft: 8 }}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>Barbers</Text>

          {/* Barber List */}
          <FlatList
            data={barbers.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))}
            horizontal
            keyExtractor={(b) => b.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedBarber(item);
                  setSelectedSlot(null);
                }}
                style={{
                  width: 98,
                  height: 120,
                  marginRight: 12,
                  borderWidth: selectedBarber?.id === item.id ? 2 : 1,
                  borderColor: selectedBarber?.id === item.id ? colors.primary : "#ddd",
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{
                    uri: item.photoUrl || "https://cdn-icons-png.flaticon.com/512/194/194938.png",
                  }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                />
                <Text
                  style={{
                    marginTop: 5,
                    fontWeight: "700",
                    color: selectedBarber?.id === item.id ? colors.primary : "#333",
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Slot List */}
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 20 }}>
            {selectedBarber ? `${selectedBarber.name}'s Slots` : "Available Slots"}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
            {visibleSlots.length > 0 ? (
              visibleSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                 onPress={() => {
  // If same slot tapped again → unselect
  if (selectedSlot?.id === slot.id) {
    setSelectedSlot(null);
  } else {
    // Otherwise select new slot
    setSelectedSlot(slot);
  }
}}
                  style={{
                    width: "48%",
                    padding: 12,
                    marginBottom: 12,
                    marginRight: "2%",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selectedSlot?.id === slot.id ? colors.primary : "#ccc",
                    backgroundColor: selectedSlot?.id === slot.id ? colors.primary : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color: selectedSlot?.id === slot.id ? "#fff" : colors.primary,
                    }}
                  >
                    {slot.fromTime} - {slot.toTime}
                  </Text>
                  <Text
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: selectedSlot?.id === slot.id ? "#fff" : "#666",
                    }}
                  >
                    {slot.barberName}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ marginTop: 20, color: "#777" }}>No slots available</Text>
            )}

            
          </View>


{/* CONFIRM & PAY — BELOW ALL SLOTS */}
{selectedSlot && (
  <View style={{ marginTop: 20 }}>
    <Text
      style={{
        textAlign: "center",
        marginBottom: 6,
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
      }}
    >
      This payment is only for slot booking, not for service charges.
    </Text>

    <TouchableOpacity
      onPress={handleConfirmBooking}
      style={{
        backgroundColor: colors.primary,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "700" }}>
        Confirm & Pay ₹{amount}
      </Text>
    </TouchableOpacity>
  </View>
)}

       {/* ADVANCE BOOKING SECTION */}
<View style={{ marginTop: 30 }}>
  <View
    style={{
      height: 1,
      backgroundColor: "#ddd",
      marginBottom: 16,
    }}
  />

  <Text
    style={{
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 6,
    }}
  >
    Didn’t find a suitable slot?
  </Text>

  <Text
    style={{
      fontSize: 13,
      color: "#666",
      marginBottom: 12,
      lineHeight: 18,
    }}
  >
    You can request an advance booking for a preferred time and service.
  </Text>

  <TouchableOpacity
    onPress={() => setAdvanceModalVisible(true)}
    style={{
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: "#fff",
    }}
  >
    <Text style={{ fontWeight: "700", color: colors.primary }}>
      Request Advance Booking (₹{advanceAmount})
    </Text>
  </TouchableOpacity>
</View>

        </ScrollView>
      )}

     

      <CustomerBottomNav />

      {/* ADVANCE BOOKING MODAL */}
      <Modal visible={advanceModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" }}>
          <View style={{ backgroundColor: "#fff", margin: 20, padding: 20, borderRadius: 10 }}>
            
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Advance Booking</Text>

            {/* FIXED SLOTS */}
            <Text style={{ marginTop: 15, fontWeight: "700" }}>Select Slot</Text>
            {fixedAdvanceSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                onPress={() => setSelectedAdvanceSlot(slot)}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: selectedAdvanceSlot?.id === slot.id ? colors.primary : "#ccc",
                  borderRadius: 8,
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    color: selectedAdvanceSlot?.id === slot.id ? colors.primary : "#000",
                    fontWeight: "600",
                  }}
                >
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* SERVICES */}
            <Text style={{ marginTop: 20, fontWeight: "700" }}>Select Service</Text>

            {services.length === 0 ? (
              <Text style={{ marginTop: 10, color: "red" }}>No services found</Text>
            ) : (
              services.map((srv) => (
                <TouchableOpacity
                  key={srv.id}
                  onPress={() => setSelectedService(srv)}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: selectedService?.id === srv.id ? colors.primary : "#ccc",
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{srv.name}</Text>
                  <Text>Price: ₹{srv.price}</Text>
                </TouchableOpacity>
              ))
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              onPress={handleAdvanceSubmit}
              style={{
                marginTop: 20,
                backgroundColor: colors.primary,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                {advanceLoading ? "Processing…" : `Pay & Request ₹${advanceAmount}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAdvanceModalVisible(false);
                setSelectedService(null);
                setSelectedAdvanceSlot(null);
              }}
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: "#444",
                padding: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}
