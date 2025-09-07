import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  color: string;
  size: number;
}

const GenerativeScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [particles, setParticles] = useState<Particle[]>([]);
  const [effectType, setEffectType] = useState<'particles' | 'waves' | 'mandala'>('particles');
  const [isAnimating, setIsAnimating] = useState(false);

  // Create initial particles
  useEffect(() => {
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      initialParticles.push({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height * 0.6),
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: Math.random() * 10 + 5,
      });
    }
    setParticles(initialParticles);
  }, []);

  // Pan responder for touch interactions
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Move particles towards touch
      particles.forEach((particle, index) => {
        const delay = index * 50;
        Animated.timing(particle.x, {
          toValue: locationX + (Math.random() - 0.5) * 100,
          duration: 800,
          delay,
          useNativeDriver: false,
        }).start();
        Animated.timing(particle.y, {
          toValue: locationY + (Math.random() - 0.5) * 100,
          duration: 800,
          delay,
          useNativeDriver: false,
        }).start();
      });
    },
  });

  const startRandomAnimation = () => {
    setIsAnimating(true);
    particles.forEach((particle, index) => {
      const randomX = Math.random() * width;
      const randomY = Math.random() * height * 0.6;
      const delay = index * 100;
      
      Animated.sequence([
        Animated.timing(particle.x, {
          toValue: randomX,
          duration: 1000,
          delay,
          useNativeDriver: false,
        }),
        Animated.timing(particle.y, {
          toValue: randomY,
          duration: 1000,
          delay: delay / 2,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (index === particles.length - 1) {
          setIsAnimating(false);
        }
      });
    });
  };

  const resetParticles = () => {
    particles.forEach((particle) => {
      particle.x.setValue(Math.random() * width);
      particle.y.setValue(Math.random() * height * 0.6);
    });
  };

  const renderParticles = () => {
    return particles.map((particle) => (
      <Animated.View
        key={particle.id}
        style={[
          styles.particle,
          {
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
          },
        ]}
      />
    ));
  };

  const styles = createStyles(isDarkMode);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Live Effects</Text>
        <Text style={styles.subtitle}>Touch to interact with particles</Text>
      </View>

      {/* Effect Types */}
      <View style={styles.effectTypes}>
        {[
          { type: 'particles', icon: 'scatter-plot', label: 'Particles' },
          { type: 'waves', icon: 'waves', label: 'Waves' },
          { type: 'mandala', icon: 'center-focus-strong', label: 'Mandala' },
        ].map((effect) => (
          <TouchableOpacity
            key={effect.type}
            style={[
              styles.effectButton,
              effectType === effect.type && styles.effectButtonActive,
            ]}
            onPress={() => setEffectType(effect.type as any)}
          >
            <Icon 
              name={effect.icon} 
              size={24} 
              color={effectType === effect.type ? 'white' : '#FF6B9D'} 
            />
            <Text
              style={[
                styles.effectButtonText,
                effectType === effect.type && styles.effectButtonTextActive,
              ]}
            >
              {effect.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Interactive Canvas */}
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {effectType === 'particles' && renderParticles()}
        {effectType === 'waves' && (
          <View style={styles.wavesContainer}>
            <Text style={styles.comingSoon}>Wave Effects Coming Soon!</Text>
          </View>
        )}
        {effectType === 'mandala' && (
          <View style={styles.mandalaContainer}>
            <Text style={styles.comingSoon}>Mandala Patterns Coming Soon!</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isAnimating && styles.controlButtonDisabled]}
          onPress={startRandomAnimation}
          disabled={isAnimating}
        >
          <Icon name="shuffle" size={20} color="white" />
          <Text style={styles.controlButtonText}>Animate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={resetParticles}>
          <Icon name="refresh" size={20} color="white" />
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Icon name="save" size={20} color="white" />
          <Text style={styles.controlButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          💡 Touch and drag to move particles around the screen
        </Text>
        <Text style={styles.instructionText}>
          🎵 Connect to Spotify for music-reactive effects
        </Text>
      </View>
    </View>
  );
};

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: isDarkMode ? '#888888' : '#666666',
    marginTop: 4,
  },
  effectTypes: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  effectButton: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  effectButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  effectButtonText: {
    fontSize: 12,
    color: isDarkMode ? '#ffffff' : '#000000',
    marginTop: 4,
    fontWeight: '500',
  },
  effectButtonTextActive: {
    color: 'white',
  },
  canvas: {
    flex: 1,
    backgroundColor: isDarkMode ? '#111111' : '#f8f8f8',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wavesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mandalaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 16,
    color: isDarkMode ? '#888888' : '#666666',
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  controlButtonDisabled: {
    backgroundColor: isDarkMode ? '#333333' : '#cccccc',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: isDarkMode ? '#888888' : '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default GenerativeScreen;
