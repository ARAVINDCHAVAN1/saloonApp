import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../firebaseConfig";
import { colors } from "../styles/theme";

export default function ShopOwnerBookings() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadSalonAndBookings = async () => {
      try {
        const sid = await AsyncStorage.getItem("shopId");
        if (!sid) return;
        setSalonId(sid);

        // 🔹 Fetch all barbers
        const barberSnap = await getDocs(
          query(collection(db, "barbers"), where("salonId", "==", sid))
        );
        const barberList = barberSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBarbers(barberList);

        // 🔹 Fetch bookings
        const bookingSnap = await getDocs(
          query(collection(db, "userBookings"), where("salonId", "==", sid))
        );
        const bookingList = bookingSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingList);
        setFilteredBookings(bookingList);
      } catch (err) {
        console.error("❌ Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSalonAndBookings();
  }, []);

  // 🔹 Apply Filters
  const applyFilters = (barberId: string, date?: Date | null) => {
    let filtered = bookings;

    if (barberId !== "all") {
      filtered = filtered.filter((b) => b.barberId === barberId);
    }

    if (date) {
      const selectedDateString = date.toDateString();
      filtered = filtered.filter((b) => b.date === selectedDateString);
    }

    setFilteredBookings(filtered);
  };

  const handleBarberChange = (barberId: string) => {
    setSelectedBarber(barberId);
    applyFilters(barberId, selectedDate);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      applyFilters(selectedBarber, date);
    }
  };

  const renderBooking = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 1.2 }]} numberOfLines={1}>
        {item.barberName || "—"}
      </Text>
      <Text style={[styles.cell, { flex: 1.4 }]} numberOfLines={1}>
        {item.slotTime}
      </Text>
      <Text style={[styles.cell, { flex: 1.3 }]} numberOfLines={1}>
        {item.date}
      </Text>
      <Text style={[styles.cell, { flex: 1.5 }]} numberOfLines={1}>
        {item.userEmail || "—"}
      </Text>
      <Text style={[styles.cell, { flex: 1.2 }]} numberOfLines={1}>
        {item.userPhone || "—"}
      </Text>
      <Text
        style={[
          styles.cell,
          {
            flex: 1,
            textTransform: "capitalize",
            fontWeight: "600",
            color:
              item.status === "paid"
                ? "green"
                : item.status === "pending"
                ? "orange"
                : "#000",
          },
        ]}
        numberOfLines={1}
      >
        {item.status}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          {/* 🔹 Filter Row */}
          <View style={styles.filterContainer}>
            {/* 🔹 Barber Dropdown */}
            <View style={styles.filterBox}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={selectedBarber}
                  style={styles.picker}
                  onValueChange={(value) => handleBarberChange(value)}
                >
                  <Picker.Item label="All Barbers" value="all" />
                  {barbers.map((b) => (
                    <Picker.Item key={b.id} label={b.name} value={b.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* 🔹 Date Picker */}
            <TouchableOpacity
              style={styles.filterBox}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dateText}>
                {selectedDate ? selectedDate.toDateString() : "Select Date"}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              onChange={handleDateChange}
            />
          )}

          {/* 🔹 Table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 700 }}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>
                  Barber
                </Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.4 }]}>
                  Slot Time
                </Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.3 }]}>
                  Date
                </Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>
                  User Email
                </Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>
                  Phone
                </Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                  Status
                </Text>
              </View>

              {filteredBookings.length === 0 ? (
                <Text style={styles.noDataText}>No bookings found.</Text>
              ) : (
                <FlatList
                  data={filteredBookings}
                  renderItem={renderBooking}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 30 }}
                />
              )}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },

  filterBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    height: 44, // ✅ Same height for both
    flex: 0.48,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  pickerBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    borderWidth: 0,
    height: 47,
    paddingLeft: 5,
  },

  picker: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    height: 47,
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  dateText: {
    color: "#333",
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  headerRow: {
    backgroundColor: colors.primary,
  },
  cell: {
    fontSize: 13,
    color: "#333",
  },
  headerCell: {
    fontWeight: "700",
    color: "#000",
  },
  noDataText: {
    textAlign: "center",
    color: "#777",
    marginTop: 25,
    fontSize: 15,
  },
});
