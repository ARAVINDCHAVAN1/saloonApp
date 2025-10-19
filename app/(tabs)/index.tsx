import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { db } from "../../firebaseConfig";

export default function Page() {
  const [users, setUsers] = useState<any[]>([]);

  // 🔹 Fetch users from Firestore
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setUsers(data);
      console.log("🔥 Users from Firestore:", data);
    } catch (error) {
      console.error("❌ Error fetching Firestore data:", error);
    }
  };

  // 🔹 Run once on component load
  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Function to add a user
  const addUser = async () => {
    try {
      await addDoc(collection(db, "users"), {
        name: "New User",
        role: "customer",
        email: "newuser@example.com",
        phone: "+911234567890"
      });
      console.log("✅ User added successfully!");
      fetchData(); // refresh list after adding
    } catch (error) {
      console.error("❌ Error adding user:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Users from Firebase:</Text>
      {users.length > 0 ? (
        users.map((user) => (
          <Text key={user.id}>
            {user.name} ({user.role})
          </Text>
        ))
      ) : (
        <Text>No users found</Text>
      )}

      {/* 🔹 Add User Button */}
      <View style={{ marginTop: 20 }}>
        <Button title="➕ Add User" onPress={addUser} />
      </View>
    </View>
  );
}
