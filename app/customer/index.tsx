import React, { useState } from "react";
import { View } from "react-native";
import CustomerBottomNav from "./CustomerBottomNav";
import SalonList from "./SalonsList";

export default function CustomerDashboard() {
  const [search, setSearch] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
   
      <View style={{ flex: 1 }}>
        <SalonList search={search} />
      </View>

    
      <CustomerBottomNav />
    </View>
  );
}
