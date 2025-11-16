import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../styles/theme";
import AddStaff from "./ShopOwnerAddBarber";
import BarberList from "./StaffList";

const TABS = ["Add Staff", "Barber List"];

export default function ShopOwnerStaffTabs() {
  const [activeTab, setActiveTab] = useState("Add Staff");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Custom Tab Buttons */}
      <View style={{ flexDirection: "row", margin: 12 }}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                marginHorizontal: 4,
                alignItems: "center",
                backgroundColor: active ? colors.primary : colors.cardBg,
              }}
            >
              <Text
                style={{
                  color: active ? colors.background : colors.textLight,
                  fontWeight: "600",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "Add Staff" ? <AddStaff /> : <BarberList />}
      </View>
    </View>
  );
}
