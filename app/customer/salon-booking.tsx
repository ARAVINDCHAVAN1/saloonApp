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
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

const CATEGORIES = ["Men", "Women", "Spa"];

export default function SalonBooking() {
  const { salonId, userId } = useLocalSearchParams();
  const router = useRouter();

  const [barbers, setBarbers] = useState<any[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [generalSlots, setGeneralSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [amount, setAmount] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ Fetch booking amount
  useEffect(() => {
    const fetchAmount = async () => {
      try {
        if (!salonId) return;
        const q = query(collection(db, "galleries"), where("salonId", "==", salonId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setAmount(docData.slotBookingAmount || 200);
        } else {
          setAmount(200);
        }
      } catch (err) {
        console.error("Error fetching amount:", err);
        setAmount(200);
      }
    };
    fetchAmount();
  }, [salonId]);

  // ✅ Load user info
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("customer");
      if (stored) {
        const user = JSON.parse(stored);
        setEmail(user.email || "");
        setPhone(user.phone || "");
      }
    };
    loadUser();
  }, []);

  // ✅ Load barbers
  useEffect(() => {
    const loadSalonData = async () => {
      try {
        if (!salonId) return;
        const barberSnap = await getDocs(
          query(collection(db, "barbers"), where("salonId", "==", salonId))
        );
        const list: any[] = [];
        barberSnap.forEach((b) => {
          const d = b.data();
          list.push({
            id: b.id,
            name: d.name,
            specialization: d.specialization || "General",
            photoUrl:
              d.photoUrl || "https://cdn-icons-png.flaticon.com/512/194/194938.png",
          });
        });
        setBarbers(list);
        setFilteredBarbers(list);
      } catch (err) {
        console.error("Error loading barbers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSalonData();
  }, [salonId]);

  // ✅ Auto load general slots
  useEffect(() => {
    if (salonId) fetchGeneralSlots(selectedDate);
  }, [salonId]);

  // ✅ Fetch general slots
  const fetchGeneralSlots = async (date: Date) => {
    try {
      setLoading(true);
      const formattedDate = date.toDateString();
      const qSlots = query(
        collection(db, "slots"),
        where("salonId", "==", salonId),
        where("barberId", "==", null),
        where("date", "==", formattedDate),
        where("status", "==", "available")
      );
      const snap = await getDocs(qSlots);
      const list: any[] = [];
      snap.forEach((docu) => {
        const d = docu.data();
        list.push({
          id: docu.id,
          fromTime: d.fromTime,
          toTime: d.toTime,
          barberName: "General",
          barberId: null,
        });
      });
      setGeneralSlots(list);
    } catch (err) {
      console.error("Error fetching general slots:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch slots for specific barber
  const fetchBarberSlots = async (barber: any) => {
    try {
      setLoading(true);
      const formattedDate = selectedDate.toDateString();
      const qSlots = query(
        collection(db, "slots"),
        where("salonId", "==", salonId),
        where("barberId", "==", barber.id),
        where("date", "==", formattedDate),
        where("status", "==", "available")
      );
      const snap = await getDocs(qSlots);
      const list: any[] = [];
      snap.forEach((docu) => {
        const d = docu.data();
        list.push({
          id: docu.id,
          fromTime: d.fromTime,
          toTime: d.toTime,
          barberName: barber.name,
          barberId: barber.id,
        });
      });
      setSlots(list);
    } catch (err) {
      console.error("Error fetching barber slots:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle category change
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedBarber(null);
    setSelectedSlot(null);
    setSlots([]);
    const filtered = barbers.filter(
      (b) => (b.specialization || "").toLowerCase() === cat.toLowerCase()
    );
    setFilteredBarbers(filtered);
  };

  // ✅ Payment & booking save
  const handleConfirmBooking = async () => {
    try {
      if (!selectedSlot) return Alert.alert("Please select a slot!");
      if (!amount) return Alert.alert("Loading amount...");

      const keyId = "rzp_test_xhdzdpk43EbUaC";
      const options = {
        description: "Salon Booking Payment",
        image: "https://your-salon-logo-url.png",
        currency: "INR",
        key: keyId,
        amount: amount * 100,
        name: "FlyZone Salon",
        prefill: { email, contact: phone, name: "FlyZone Customer" },
        theme: { color: "#3399cc" },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          const paymentRef = collection(db, "payments");
          await addDoc(paymentRef, {
            userId: userId || "unknown",
            salonId: salonId || "unknown",
            barberId: selectedSlot.barberId || null,
            slotTime: `${selectedSlot.fromTime} - ${selectedSlot.toTime}`,
            paymentTime: new Date().toISOString(),
            date: selectedDate.toDateString(),
            amount,
            email,
            phone,
            paymentId: data.razorpay_payment_id,
            paymentStatus: "captured",
            status: "paid",
            createdAt: serverTimestamp(),
          });

          const slotRef = doc(db, "slots", selectedSlot.id);
          await updateDoc(slotRef, { status: "booked" });

          Alert.alert("✅ Payment Successful", "Your booking is confirmed!", [
            { text: "OK", onPress: () => router.push("/customer/booking-history") },
          ]);
        })
        .catch(() => Alert.alert("Payment Cancelled", "You cancelled or payment failed."));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  // 🔹 Slot card (compact)
  const renderSlot = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      style={{
        backgroundColor: selectedSlot?.id === item.id ? colors.primary : "#f8f9fa",
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 10,
        padding: 10,
        margin: 6,
        width: "45%",
      }}
      onPress={() => setSelectedSlot(item)}
    >
      <Text
        style={{
          textAlign: "center",
          color: selectedSlot?.id === item.id ? "#fff" : colors.primary,
          fontWeight: "700",
        }}
      >
        {item.fromTime} - {item.toTime}
      </Text>
      <Text
        style={{
          fontSize: 12,
          textAlign: "center",
          color: selectedSlot?.id === item.id ? "#fff" : "#555",
        }}
      >
        {item.barberName}
      </Text>
    </TouchableOpacity>
  );

  // 🔹 Barber card
  const renderBarber = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      style={{
        alignItems: "center",
        marginRight: 12,
        borderWidth: selectedBarber?.id === item.id ? 2 : 1,
        borderColor: selectedBarber?.id === item.id ? colors.primary : "#ccc",
        borderRadius: 10,
        padding: 8,
        width: 100,
        height: 120,
        backgroundColor: "#fff",
      }}
      onPress={() => {
        setSelectedBarber(item);
        setSelectedSlot(null);
        fetchBarberSlots(item);
      }}
    >
      <Image
        source={{ uri: item.photoUrl }}
        style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 6 }}
      />
      <Text
        style={{
          fontSize: 13,
          textAlign: "center",
          color: selectedBarber?.id === item.id ? colors.primary : "#333",
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            flex: 1,
            marginLeft: 15,
            paddingHorizontal: 10,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#000" />
          <TextInput
            placeholder="Search barber..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: "#000", marginLeft: 8 }}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: 15,
            paddingTop: 20,
          }}
        >
          {/* ✅ General Slots */}
          {!selectedBarber && (
            <>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 10 }}>
                General Slots
              </Text>
              {generalSlots.length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                  {generalSlots.map((item) => renderSlot({ item }))}
                </View>
              ) : (
                <Text style={{ textAlign: "center", color: "#777" }}>
                  No general slots available today.
                </Text>
              )}
              <Text
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: 13,
                  marginTop: 10,
                  marginBottom: 15,
                }}
              >
                For other slots, select a category and barber below.
              </Text>
            </>
          )}

          {/* ✅ Categories */}
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 10 }}>
            Select Category
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 15 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategoryChange(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? colors.primary : "#fff",
                  borderColor: colors.primary,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: selectedCategory === cat ? "#fff" : colors.primary,
                    fontWeight: "600",
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ✅ Barber List */}
          {filteredBarbers.length > 0 ? (
            <FlatList
              data={filteredBarbers}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={renderBarber}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={{ textAlign: "center", color: "#777" }}>No barbers in this category.</Text>
          )}

          {/* ✅ Barber Slots */}
          {selectedBarber && slots.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: 20,
                  marginBottom: 10,
                }}
              >
                {selectedBarber.name}'s Slots
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {slots.map((item) => renderSlot({ item }))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Confirm Button */}
      {selectedSlot && amount !== null && (
        <View
          style={{
            position: "absolute",
            bottom: 80,
            left: 20,
            right: 20,
            backgroundColor: colors.primary,
            borderRadius: 10,
            elevation: 8,
          }}
        >
          <TouchableOpacity
            style={{ paddingVertical: 14, alignItems: "center" }}
            onPress={handleConfirmBooking}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Confirm & Pay ₹{amount}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CustomerBottomNav />
    </View>
  );
}
