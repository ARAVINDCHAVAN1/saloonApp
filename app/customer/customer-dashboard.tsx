import React, { useState } from "react";
import { View } from "react-native";
import CustomerBottomNav from "./CustomerBottomNav";
import CustomerHeader from "./CustomerHeader";
import SalonList from "./SalonsList"; // ✅ make sure name matches actual file (not "SalonsList")

export default function CustomerDashboard() {
  const [search, setSearch] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CustomerHeader search={search} setSearch={setSearch} />
      <SalonList search={search} />
      <CustomerBottomNav />
    </View>
  );
}
