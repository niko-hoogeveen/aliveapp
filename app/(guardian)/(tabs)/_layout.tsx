/**
 * Guardian Tabs layout for the I'm Okay app.
 * Swipeable tab navigator for guardian screens (Dashboard, Alerts, Add, Settings).
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants';

// Import tab screens directly
import GuardianDashboardScreen from './index';
import GuardianAlertsScreen from './alerts';
import AddDependentScreen from './add-dependent';
import GuardianSettingsScreen from './settings';

type TabRoute = {
  key: string;
  title: string;
  icon: string;
};

const routes: TabRoute[] = [
  { key: 'dashboard', title: 'Dashboard', icon: '📊' },
  { key: 'alerts', title: 'Alerts', icon: '🔔' },
  { key: 'add', title: 'Add', icon: '➕' },
  { key: 'settings', title: 'Settings', icon: '⚙️' },
];

// Scene renderer with lazy loading
const renderScene = SceneMap({
  dashboard: GuardianDashboardScreen,
  alerts: GuardianAlertsScreen,
  add: AddDependentScreen,
  settings: GuardianSettingsScreen,
});

interface TabBarProps {
  routes: TabRoute[];
  index: number;
  position: Animated.AnimatedInterpolation<number>;
  onIndexChange: (index: number) => void;
}

function CustomTabBar({ routes, index, position, onIndexChange }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const tabWidth = layout.width / routes.length;

  // Animated indicator position
  const indicatorPosition = position.interpolate({
    inputRange: routes.map((_, i) => i),
    outputRange: routes.map((_, i) => i * tabWidth),
  });

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 24 }]}>
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth,
            transform: [{ translateX: indicatorPosition }],
          },
        ]}
      />
      {routes.map((route, i) => {
        const isActive = index === i;
        const color = isActive ? Colors.light.primary : Colors.light.textSecondary;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => onIndexChange(i)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={route.title}
          >
            <Text style={[styles.tabIcon, { color }]}>{route.icon}</Text>
            <Text style={[styles.tabLabel, { color }]}>{route.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function GuardianTabsLayout() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const handleIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <CustomTabBar
            routes={routes}
            index={index}
            position={props.position}
            onIndexChange={handleIndexChange}
          />
        )}
        tabBarPosition="bottom"
        swipeEnabled={true}
        lazy={true}
        lazyPreloadDistance={1}
        style={styles.tabView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
