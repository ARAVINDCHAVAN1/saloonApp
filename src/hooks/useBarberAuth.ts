import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useBarberAuth() {
  const [loading, setLoading] = useState(true);
  const [barberName, setBarberName] = useState<string | null>(null);
  const [salonName, setSalonName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const bname = await AsyncStorage.getItem("barberName");
      const sname = await AsyncStorage.getItem("shopName");
      setBarberName(bname);
      setSalonName(sname);
      setLoading(false);
    };
    load();
  }, []);

  return { loading, barberName, salonName };
}
