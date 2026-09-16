import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { vibrate } from '../utils';

const ITEM_HEIGHT = 45;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MIN_SEC = Array.from({ length: 60 }, (_, i) => i);

const WheelPicker = ({ data, selectedValue, onValueChange, label }: any) => {
  return (
    <View style={styles.pickerWrapper}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          initialScrollIndex={selectedValue}
          getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
            if (data[index] !== undefined && data[index] !== selectedValue) {
              onValueChange(data[index]);
            }
          }}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
          renderItem={({ item }) => (
            <View style={styles.pickerItem}>
              <Text style={[
                styles.pickerItemText,
                selectedValue === item && styles.pickerItemSelectedText
              ]}>
                {item < 10 ? `0${item}` : item}
              </Text>
            </View>
          )}
        />
        <View style={styles.selectionOverlay} pointerEvents="none" />
      </View>
    </View>
  );
};

export default function App() {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);

  const [wH, setWH] = useState(0);
  const [wM, setWM] = useState(25);
  const [wS, setWS] = useState(0);

  const [bH, setBH] = useState(0);
  const [bM, setBM] = useState(5);
  const [bS, setBS] = useState(0);

  const [settingMode, setSettingMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      vibrate();
      
      if (isWorkMode) {
        setIsWorkMode(false);
        setTimeLeft(bH * 3600 + bM * 60 + bS || 300);
      } else {
        setIsWorkMode(true);
        setTimeLeft(wH * 3600 + wM * 60 + wS || 1500);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkMode, wH, wM, wS, bH, bM, bS]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const pad = (num: number) => (num < 10 ? `0${num}` : num);
    
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  const applyNewTimes = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setTimeLeft(wH * 3600 + wM * 60 + wS || 1500);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setTimeLeft(wH * 3600 + wM * 60 + wS || 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerSection}>
        <Text style={[styles.title, { color: isWorkMode ? '#38BDF8' : '#10B981' }]}>
          {isWorkMode ? 'Робочий час 💻' : 'Перерва ☕'}
        </Text>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setIsActive(!isActive)}>
            <Text style={styles.buttonText}>{isActive ? "Пауза" : "Старт"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
            <Text style={styles.secondaryButtonText}>Скинути</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity onPress={() => setSettingMode('work')}>
            <Text style={[styles.toggleText, settingMode === 'work' && styles.toggleTextActive]}>
              Робота
            </Text>
          </TouchableOpacity>
          <Text style={styles.toggleText}>|</Text>
          <TouchableOpacity onPress={() => setSettingMode('break')}>
            <Text style={[styles.toggleText, settingMode === 'break' && styles.toggleTextActive]}>
              Відпочинок
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickersRow}>
          <WheelPicker 
            key={`hours-${settingMode}`}
            label="Год" 
            data={HOURS} 
            selectedValue={settingMode === 'work' ? wH : bH} 
            onValueChange={settingMode === 'work' ? setWH : setBH} 
          />
          <WheelPicker 
            key={`mins-${settingMode}`}
            label="Хв" 
            data={MIN_SEC} 
            selectedValue={settingMode === 'work' ? wM : bM} 
            onValueChange={settingMode === 'work' ? setWM : setBM} 
          />
          <WheelPicker 
            key={`secs-${settingMode}`}
            label="Сек" 
            data={MIN_SEC} 
            selectedValue={settingMode === 'work' ? wS : bS} 
            onValueChange={settingMode === 'work' ? setWS : setBS} 
          />
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={applyNewTimes}>
          <Text style={styles.applyButtonText}>Застосувати час</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  timerText: {
    fontSize: 84,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
  },
  primaryButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#475569',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  secondaryButtonText: {
    color: '#CBD5E1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsSection: {
    width: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
  },
  settingsToggleRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  toggleText: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    height: 160,
    marginBottom: 20,
  },
  pickerWrapper: {
    alignItems: 'center',
    width: 80,
  },
  pickerLabel: {
    color: '#94A3B8',
    marginBottom: 10,
    fontWeight: '600',
  },
  pickerContainer: {
    height: ITEM_HEIGHT * 3,
    width: '100%',
    position: 'relative',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 24,
    color: '#475569',
    fontWeight: '500',
  },
  pickerItemSelectedText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  applyButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginTop: 10,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});