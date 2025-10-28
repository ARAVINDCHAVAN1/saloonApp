import { Drawer } from "expo-router/drawer";
import { colors } from "../../styles/theme";
import ShopOwnerHeader from "../ShopOwnerHeader";

export default function ShopOwnerLayout() {
  return (
    <Drawer
      screenOptions={{
        header: ({ route, navigation, options }) => {
          return (
            <ShopOwnerHeader
              title={options.title || route.name}
              navigation={navigation}
            />
          );
        },
        drawerActiveTintColor: colors.primary,
        drawerLabelStyle: { fontSize: 16 },
      }}
    />
  );
}
