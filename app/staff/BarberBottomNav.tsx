import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function BarberBottomNav() {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
       
        borderTopWidth: 1,
        backgroundColor: "#fff",
        borderColor: "#ddd",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
      }}
    >
      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="home-outline" size={26} color="#777" />
        <Text style={{ fontSize: 12 }}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => navigation.navigate("My Slots")}
      >
        <Ionicons name="time-outline" size={26} color="#777" />
        <Text style={{ fontSize: 12 }}>Slots</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => navigation.navigate("Appointments")}
      >
        <Ionicons name="calendar-outline" size={26} color="#777" />
        <Text style={{ fontSize: 12 }}>Appointments</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ width: 80, alignItems: "center" }}
        onPress={() => navigation.navigate("Profile")}
      >
        <Ionicons name="person-outline" size={26} color="#777" />
        <Text style={{ fontSize: 12 }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
