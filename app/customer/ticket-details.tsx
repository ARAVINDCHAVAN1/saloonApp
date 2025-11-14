import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function TicketDetails() {
  const params = useLocalSearchParams();
  const booking = JSON.parse(params.booking as string);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎫 Ticket Details</Text>

      <Text style={styles.item}>Salon: {booking.salonName}</Text>
      <Text style={styles.item}>Date: {new Date(booking.date).toDateString()}</Text>
      <Text style={styles.item}>Slot: {booking.slot}</Text>
      <Text style={styles.item}>Amount: ₹{booking.amount}</Text>
      <Text style={styles.item}>Booking ID: {booking.bookingId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  item: {
    fontSize: 17,
    marginBottom: 10,
  },
});
