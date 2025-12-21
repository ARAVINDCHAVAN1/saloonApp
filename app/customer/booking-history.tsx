import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { db } from "../../src/firebase/firebaseConfig";
import { colors } from "../../styles/theme";
import CustomerBottomNav from "./CustomerBottomNav";

/* ✅ SAFE DATETIME PARSER */
const parseAdvanceDateTime = (dateStr: string, timeStr: string) => {
  try {
    timeStr = timeStr.replace(/(AM|PM)$/i, " $1");

    const months:any = {
      Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
      Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11
    };

    const dateParts = dateStr.trim().split(" ");
    const day = parseInt(dateParts[2]);
    const year = parseInt(dateParts[3]);
    const month = months[dateParts[1]];

    let [time, ampm] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes);
  } catch {
    return null;
  }
};

/* ✅ EXPIRY CHECK */
const isExpired = (date: string, toTime: string) => {
  const end = parseAdvanceDateTime(date, toTime);
  if (!end) return true;
  return new Date() > end;
};

export default function BookingHistory() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [advanceList, setAdvanceList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [showFilter, setShowFilter] = useState(false);

  const filterOptions = ["Today","Upcoming","Advance","This Month","Last 3 Months","Last 6 Months"];

  const [ticketVisible, setTicketVisible] = useState(false);
  const [ticket, setTicket] = useState<any>(null);

  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [hasApprovedAdvance, setHasApprovedAdvance] = useState(false);
  const [showAdvanceAsMain, setShowAdvanceAsMain] = useState(false);

  /* ✅ GET SALON NAME */
  const getSalonName = async (salonId?: string) => {
    if (!salonId) return "Salon";
    const snap = await getDoc(doc(db, "salons", salonId));
    return snap.exists() ? snap.data().shopName || "Salon" : "Salon";
  };

  /* ✅ LOAD ADVANCE BOOKINGS */
  useEffect(() => {
    const loadAdvance = async () => {
      const stored = await AsyncStorage.getItem("customer");
      if (!stored) return;

      const { id, uid } = JSON.parse(stored);
      const userId = id || uid;

      const snap = await getDocs(
        query(collection(db, "advanceBookings"), where("userId","==", userId))
      );

      let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // attach salon names
      list = await Promise.all(
        list.map(async (item:any) => ({
          ...item,
          salonName: await getSalonName(item.salonId)
        }))
      );

      // red dot
      const pending = list.some(a =>
        a.status === "approved" &&
        !isExpired(a.date, a.toTime) &&
        a.paymentStatus !== "paid" &&
        a.paymentStatus !== "captured"
      );

      setAdvanceList(list);
      setHasApprovedAdvance(pending);
    };

    loadAdvance();
  }, []);

  /* ✅ LOAD PAYMENT HISTORY */
  useEffect(() => {
    const loadHistory = async () => {
      const stored = await AsyncStorage.getItem("customer");
      if (!stored) return;

      const { id, uid } = JSON.parse(stored);
      const userId = id || uid;

      const snap = await getDocs(
        query(collection(db, "payments"),
          where("userId","==",userId),
          where("status","==","paid"))
      );

      const list: any[] = [];

      for (const d of snap.docs) {
        const data = d.data();
        const salonName = await getSalonName(data.salonId);
        list.push({ id: d.id, ...data, salonName });
      }

      setBookings(list);
      applyFilter("Today", list);
      setLoading(false);
    };

    loadHistory();
  }, []);

  /* ✅ FILTER */
  const applyFilter = (type: string, list = bookings) => {
    setSelectedFilter(type);
    setShowFilter(false);

    if (type === "Advance") {
      setShowAdvanceAsMain(true);

      const mapped = advanceList.map(a => {
        const expired = isExpired(a.date, a.toTime);
        return {
          id: a.id,
          salonName: a.salonName || "Salon",
          barberName: a.barberName || "General",
          date: a.date,
          slotTime: `${a.fromTime} - ${a.toTime}`,
          amount: a.amount,
          expired,
          paymentStatus: expired ? "expired" : a.paymentStatus,
          raw: a
        };
      });

      setFiltered(mapped);
      return;
    }

    setShowAdvanceAsMain(false);

    const now = new Date();
    let result = [...list];

    if (type === "Today") {
      result = list.filter(b => new Date(b.date).toDateString() === now.toDateString());
    } else if (type === "Upcoming") {
      result = list.filter(b => new Date(b.date) > now);
    } else if (type === "This Month") {
      result = list.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (type === "Last 3 Months") {
      const dt = new Date();
      dt.setMonth(now.getMonth() - 3);
      result = list.filter(b => new Date(b.date) >= dt);
    } else if (type === "Last 6 Months") {
      const dt = new Date();
      dt.setMonth(now.getMonth() - 6);
      result = list.filter(b => new Date(b.date) >= dt);
    }

    setFiltered(result);
  };

  /* ✅ OPEN TICKET */
  const openTicket = (item:any) => {

    if (showAdvanceAsMain) {
      if (item.expired) return;

      // allow paid or approved
      if (
        item.raw.status !== "approved" &&
        item.paymentStatus !== "paid" &&
        item.paymentStatus !== "captured"
      ) return;

      const adv = item.raw;

      setTicket({
        salonName: adv.salonName || "Salon",
        barberName: adv.barberName || "General",
        date: adv.date,
        slotTime: `${adv.fromTime} - ${adv.toTime}`,
        amount: adv.amount,
        paymentStatus: adv.paymentStatus
      });

    } else {
      setTicket(item);
    }

    setTicketVisible(true);
  };

  /* ✅ CARD RENDER */
  const renderBooking = ({ item }: any) => {
    const showTicket =
      item.paymentStatus === "paid" ||
      item.paymentStatus === "captured" ||
      (showAdvanceAsMain && item.raw?.status === "approved" && !item.expired);

    return (
      <View style={{ backgroundColor:"#fff", padding:15, borderRadius:12, marginBottom:12 }}>
        <View style={{flexDirection:"row", justifyContent:"space-between"}}>
          <View>
            <Text style={{fontSize:18,fontWeight:"700"}}>{item.salonName}</Text>
            <Text>{item.barberName}</Text>
          </View>

          {showTicket && (
            <TouchableOpacity onPress={() => openTicket(item)}>
              <Ionicons name="ticket-outline" size={24} color={colors.primary} />
              <Text style={{fontSize:10}}>Ticket</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text>{item.date}</Text>
        <Text>{item.slotTime}</Text>

        {item.paymentStatus === "expired" && (
          <Text style={{color:"red",fontWeight:"800"}}>Expired</Text>
        )}

        {(item.paymentStatus === "paid" || item.paymentStatus === "captured") && (
          <Text>₹{item.amount} Paid</Text>
        )}

        {!item.expired &&
         item.raw?.status === "approved" &&
         item.paymentStatus !== "paid" &&
         item.paymentStatus !== "captured" && (
          <TouchableOpacity
            style={{ backgroundColor:colors.primary,padding:8,borderRadius:6,marginTop:6 }}
            onPress={() => router.push({ pathname:"/customer/AdvancePaymentScreen", params:{id:item.id} })}
          >
            <Text>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{flex:1, backgroundColor:"#fafafa"}}>

      {/* HEADER */}
      <View style={{
        backgroundColor:colors.primary,
        paddingTop:45,paddingBottom:12,paddingHorizontal:15,
        flexDirection:"row",justifyContent:"space-between",alignItems:"center"
      }}>
        <View style={{flexDirection:"row",alignItems:"center"}}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24}/>
          </TouchableOpacity>
          <Text style={{fontSize:18,fontWeight:"800", marginLeft:15}}>My Bookings</Text>
        </View>

        <TouchableOpacity onPress={() => setShowAdvancePopup(true)}>
          <View>
            <Ionicons name="notifications-outline" size={26} />
            {hasApprovedAdvance &&
              <View style={{width:10,height:10,backgroundColor:"red",
                borderRadius:5,position:"absolute",right:-2,top:-2}}/>
            }
          </View>
        </TouchableOpacity>
      </View>

      {/* FILTER */}
      <View style={{ backgroundColor:"#fff", padding:12 }}>
        <TouchableOpacity
          onPress={() => setShowFilter(!showFilter)}
          style={{borderWidth:1,borderColor:colors.primary,borderRadius:10,
            padding:12,flexDirection:"row",justifyContent:"space-between"}}
        >
          <Text style={{color:colors.primary,fontWeight:"700"}}>{selectedFilter}</Text>
          <Ionicons name={showFilter?"chevron-up":"chevron-down"} size={20} color={colors.primary}/>
        </TouchableOpacity>

        {showFilter && (
          <View style={{borderWidth:1, marginTop:6}}>
            {filterOptions.map((f,i)=>(
              <TouchableOpacity key={i} onPress={()=>applyFilter(f)} style={{padding:10}}>
                <Text style={{color:colors.primary,fontWeight:"600"}}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* LIST */}
      {loading ? <ActivityIndicator style={{marginTop:40}}/> : (
        <FlatList data={filtered} renderItem={renderBooking} keyExtractor={i=>i.id}
          contentContainerStyle={{padding:15}}/>
      )}

      {/* 🎫 TICKET */}
      <Modal visible={ticketVisible} transparent animationType="fade">
        <View style={{flex:1,backgroundColor:"rgba(0,0,0,0.6)",justifyContent:"center",padding:20}}>
          <View style={{backgroundColor:"#fff",padding:20,borderRadius:12,borderWidth:2,borderStyle:"dashed"}}>
            <Text style={{textAlign:"center",fontWeight:"800",fontSize:18}}>🎫 Booking Ticket</Text>
            <Text style={{textAlign:"center",marginBottom:6}}>{ticket?.salonName}</Text>
            <Text>Date: {ticket?.date}</Text>
            <Text>Slot: {ticket?.slotTime}</Text>
            <Text>Status: {ticket?.paymentStatus}</Text>
            <Text>Paid Amount: ₹{ticket?.amount}</Text>

            <View style={{alignItems:"center",marginTop:15}}>
              <QRCode value={JSON.stringify(ticket)} size={130}/>
            </View>
          </View>

          <TouchableOpacity onPress={()=>setTicketVisible(false)}
            style={{marginTop:15,backgroundColor:"#ccc",padding:10,borderRadius:10}}>
            <Text style={{textAlign:"center",fontWeight:"700"}}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 🔔 BELL */}
      <Modal visible={showAdvancePopup} transparent animationType="fade">
        <View style={{flex:1,backgroundColor:"rgba(0,0,0,0.6)",justifyContent:"center",padding:15}}>
          <View style={{backgroundColor:"#fff",borderRadius:12,padding:15}}>
            <Text style={{fontWeight:"800",fontSize:18}}>Advance Bookings</Text>

            {advanceList.map(item=>{
              const expired = isExpired(item.date, item.toTime);
              const isPaid = item.paymentStatus==="paid" || item.paymentStatus==="captured";

              return(
                <View key={item.id} style={{borderWidth:1,borderRadius:8,marginTop:8,padding:10}}>
                  <Text>{item.salonName}</Text>
                  <Text>{item.fromTime} - {item.toTime}</Text>
                  <Text>Status: {item.status}</Text>

                  {expired && <Text style={{color:"red",fontWeight:"700"}}>Expired</Text>}

                  {!expired && item.status==="approved" && !isPaid && (
                    <TouchableOpacity style={{backgroundColor:colors.primary,padding:8,borderRadius:6,marginTop:6}}
                      onPress={()=>{setShowAdvancePopup(false);router.push({pathname:"/customer/AdvancePaymentScreen",params:{id:item.id}});}}>
                      <Text>Pay Now</Text>
                    </TouchableOpacity>
                  )}

                  {isPaid && !expired && (
                    <TouchableOpacity style={{backgroundColor:"#333",padding:8,borderRadius:6,marginTop:6}}
                      onPress={()=>{setShowAdvancePopup(false);setTicket(item);setTicketVisible(true);}}>
                      <Text style={{color:"#fff"}}>View Ticket</Text>
                    </TouchableOpacity>
                  )}

                </View>
              );
            })}

            <TouchableOpacity onPress={()=>setShowAdvancePopup(false)} style={{marginTop:12}}>
              <Text style={{textAlign:"center",color:"red",fontWeight:"700"}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomerBottomNav/>
    </View>
  );
}
