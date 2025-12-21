// app/shop-owner/LeftMenu.tsx
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/theme";

function LeftMenuComponent({ visible, slide, closeMenu }) {
  const router = useRouter();
  const pathname = usePathname();

  const [shopOpen, setShopOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const goTo = (route) => {
    closeMenu();
    setTimeout(() => {
      router.replace(route);
    }, 80);
  };

  const isActive = (route) => pathname === route;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: visible ? 9999 : -1,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* BACKDROP */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeMenu}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: visible ? "rgba(0,0,0,0.3)" : "transparent",
        }}
      />

      {/* MENU */}
      <Animated.View
        style={{
          width: 270,
          height: "100%",
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingTop: 30,
          position: "absolute",
          left: slide,
          top: 0,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* MAIN MENU */}
          {[
            { label: "Home", route: "/shop-owner/ShopOwnerDashboard" },
            { label: "Staff", route: "/shop-owner/ShopOwnerStaffTabs" },
            { label: "Services", route: "/shop-owner/ShopOwnerServicesTabs" },
            { label: "Slot", route: "/shop-owner/ShopOwnerSlotTabs" },
            { label: "Management", route: "/shop-owner/ShopOwnerGallery" },
            { label: "Leaves", route: "/shop-owner/LeavesApproval" },
         
            { label: "Profile", route: "/shop-owner/ShopOwnerProfile" },
            { label: "Setting", route: "/shop-owner/Shopwonersetting" },
            { label: "Spot Booking", route: "/shop-owner/ShopOwnerSpotBooking" },

            
          ].map((item, idx) => (
            <MenuItem
              key={idx}
              label={item.label}
              route={item.route}
              isActive={isActive}
              goTo={goTo}
              closeMenu={closeMenu}
            />
          ))}


          {/* PAYMENT DROPDOWN */}
          <DropdownItem
            label="Payments"
            open={paymentOpen}
            setOpen={setPaymentOpen}
          />

          {paymentOpen && (
            <View style={{ marginLeft: 20, marginTop: 4 }}>
              <MenuItem
                label="Payment Records"
                route="/shop-owner/ShopOwnerBookings"
                isActive={isActive}
                goTo={goTo}
                closeMenu={closeMenu}
              />
              <MenuItem
                label="Advance Bookings"
                route="/shop-owner/ShopOwnerAdvanceBookings"
                isActive={isActive}
                goTo={goTo}
                closeMenu={closeMenu}
              />
               <MenuItem
                label="Spot Booking"
                route="/shop-owner/ShopOwnerSpotBookingList"
                isActive={isActive}
                goTo={goTo}
                closeMenu={closeMenu}
              />

              
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function MenuItem({ label, route, isActive, goTo, closeMenu }) {
  return (
    <TouchableOpacity
      style={{
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 14,
        backgroundColor: isActive(route) ? "#FFF7C2" : "#fafafa",
      }}
      onPress={() => {
        closeMenu();
        setTimeout(() => goTo(route), 80);
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: isActive(route) ? "800" : "600",
          color: isActive(route) ? colors.primary : "#444",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DropdownItem({ label, open, setOpen }) {
  return (
    <TouchableOpacity
      style={{
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: open ? "#FFF7C2" : "#fafafa",
      }}
      onPress={() => setOpen(!open)}
    >
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}>
        {label} ▾
      </Text>
    </TouchableOpacity>
  );
}

export default React.memo(LeftMenuComponent);
