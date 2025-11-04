import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebaseConfig";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

export default function SalonBooking() {
  const { salonId, userId } = useLocalSearchParams();
  const router = useRouter();

  const [barbers, setBarbers] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
            photoUrl:
              d.photoUrl || "https://cdn-icons-png.flaticon.com/512/194/194938.png",
            specialization: d.specialization || "General",
          });
        });
        setBarbers(list);
      } catch (err) {
        console.error("❌ Error loading salon data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSalonData();
  }, [salonId]);

  // ✅ Fetch slots
  const fetchSlots = async (date: Date, barber: any) => {
    try {
      setLoading(true);
      setSlots([]);
      if (!barber) return;

      const formattedDate = date.toDateString();
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
          barberName: d.barberName || barber.name,
          barberId: d.barberId,
        });
      });
      setSlots(list);
    } catch (err) {
      console.error("❌ Fetch slots error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirm booking
  const handleConfirmBooking = async () => {
    try {
      if (!selectedSlot) {
        Alert.alert("Please select a slot first!");
        return;
      }

      const bookingRef = collection(db, "userBookings");
      const paymentAmount = 200;

      await addDoc(bookingRef, {
        userId,
        salonId,
        barberId: selectedSlot.barberId,
        barberName: selectedSlot.barberName,
        slotTime: `${selectedSlot.fromTime} - ${selectedSlot.toTime}`,
        date: selectedDate.toDateString(),
        amount: paymentAmount,
        paymentStatus: "success",
        status: "paid",
        createdAt: serverTimestamp(),
      });

      const slotRef = doc(db, "slots", selectedSlot.id);
      await updateDoc(slotRef, { status: "booked" });

      Alert.alert(
        "✅ Payment Successful",
        `Your booking for ${selectedSlot.fromTime} confirmed!`,
        [
          {
            text: "OK",
            onPress: () => router.push("/customer/booking-history"),
          },
        ]
      );
    } catch (err) {
      console.error("❌ Booking Error:", err);
      Alert.alert("Error", "Failed to confirm booking. Try again.");
    }
  };

  const filteredBarbers = barbers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderSlot = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        backgroundColor:
          selectedSlot?.id === item.id ? colors.primary : "#fff",
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        marginBottom: 12,
        alignItems: "center",
      }}
      onPress={() => setSelectedSlot(item)}
    >
      <Text
        style={{
          color: selectedSlot?.id === item.id ? "#fff" : colors.primary,
          fontWeight: "700",
        }}
      >
        {item.fromTime} - {item.toTime}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: selectedSlot?.id === item.id ? "#fff" : "#666",
        }}
      >
        {item.barberName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 🔹 Header with Search + Cart + Settings */}
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

        {/* Cart & Settings */}
        <TouchableOpacity onPress={() => router.push("/customer/cart")}>
          <Ionicons
            name="cart-outline"
            size={24}
            color="#000"
            style={{ marginLeft: 12 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/customer/settings")}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="#000"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>

      {/* 🔹 Main List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id}
          renderItem={renderSlot}
          ListHeaderComponent={
            <View style={{ padding: 15 }}>
              {/* Date Picker */}
              <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}>
                Select Date
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
                onPress={() => setShowPicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={{ marginLeft: 10, color: "#333" }}>
                  {selectedDate.toDateString()}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  onChange={(e, date) => {
                    setShowPicker(false);
                    if (date) {
                      setSelectedDate(date);
                      if (selectedBarber) fetchSlots(date, selectedBarber);
                    }
                  }}
                />
              )}

              {/* Barbers */}
              <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}
              >
                Select Barber
              </Text>
              <FlatList
                data={filteredBarbers}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      marginRight: 12,
                      borderWidth: selectedBarber?.id === item.id ? 2 : 1,
                      borderColor:
                        selectedBarber?.id === item.id
                          ? colors.primary
                          : "#ccc",
                      borderRadius: 10,
                      padding: 6,
                      width: 100,
                      height: 120,
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      setSelectedBarber(item);
                      setSelectedSlot(null);
                      fetchSlots(selectedDate, item);
                    }}
                  >
                    <Image
                      source={{ uri: item.photoUrl }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        marginBottom: 6,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        textAlign: "center",
                        color:
                          selectedBarber?.id === item.id
                            ? colors.primary
                            : "#333",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginTop: 15,
                  marginBottom: 10,
                }}
              >
                {selectedBarber
                  ? "Available Slots"
                  : "Select a barber to view slots"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            selectedBarber && (
              <Text
                style={{
                  textAlign: "center",
                  color: "#888",
                  marginTop: 10,
                }}
              >
                No slots available for this barber.
              </Text>
            )
          }
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 250 }}
        />
      )}

      {/* ✅ Confirm Button — Fixed Bottom */}
      {/* ✅ Confirm Button — Fixed Bottom */}
{selectedSlot && (
  <View
    style={{
      position: "absolute",
      bottom: 80, // ✅ lifted slightly above bottom nav
      left: 20,
      right: 20,
      backgroundColor: colors.primary,
      borderRadius: 10,
      elevation: 8,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 4,
    }}
  >
    <TouchableOpacity
      style={{
        paddingVertical: 14,
        alignItems: "center",
      }}
      onPress={handleConfirmBooking}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "700",
        }}
      >
        Confirm & Pay ₹200
      </Text>
    </TouchableOpacity>
  </View>
)}


      <CustomerBottomNav />
    </View>
  );
}
