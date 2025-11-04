import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import CustomerBottomNav from "./CustomerBottomNav";
import CustomerHeader from "./CustomerHeader";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");

  // ✅ Inject search prop dynamically into children
  const childrenWithProps = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { search })
      : child
  );

  return (
    <View style={styles.container}>
      <CustomerHeader search={search} setSearch={setSearch} />
      <View style={styles.content}>{childrenWithProps}</View>
      <CustomerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, paddingBottom: 10 },
});
