import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ProductResult = {
  product: string;
  category: string;
  condition: string;
  confidence: number;
};

export default function HomeScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] =
    useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [detected, setDetected] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [recording, setRecording] = useState(false);

  const [product, setProduct] =
    useState<ProductResult | null>(null);

  const [quantity, setQuantity] = useState('1');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockAge, setStockAge] = useState('');

  const [listingCreated, setListingCreated] = useState(false);

  /*
   * START VOICE RECORDING
   */
  const startRecording = async () => {
    try {
      const permission =
        await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Microphone Permission',
          'Please allow microphone access in your iPhone settings.'
        );
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync();

      audioRecorder.record();

      setRecording(true);

      console.log('Voice recording started');
    } catch (error) {
      console.log(
        'Recording start error:',
        error
      );
    }
  };

  /*
   * STOP VOICE RECORDING
   */
  const stopRecording = async () => {
    try {
      await audioRecorder.stop();

      setRecording(false);

      console.log(
        'Voice recording stopped'
      );

      console.log(
        'Recording URI:',
        audioRecorder.uri
      );

      Alert.alert(
        'Voice Recorded',
        'Your voice recording was captured successfully.'
      );
    } catch (error) {
      console.log(
        'Recording stop error:',
        error
      );

      setRecording(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>
          DEAD STOCK
        </Text>

        <Text style={styles.logoAccent}>
          EXCHANGE
        </Text>

        <Text style={styles.subtitle}>
          We need access to your camera to scan your
          stock.
        </Text>

        <Button
          title="Allow Camera"
          onPress={requestPermission}
        />
      </View>
    );
  }

  /*
   * CAMERA
   */
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />

        <View style={styles.cameraOverlay}>
          <View style={styles.scanBox} />

          <Text style={styles.cameraText}>
            Place your product inside the box
          </Text>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={async () => {
              if (!cameraRef.current) {
                return;
              }

              try {
                const photo =
                  await cameraRef.current.takePictureAsync();

                if (!photo?.uri) {
                  return;
                }

                console.log(
                  'Photo captured:',
                  photo.uri
                );

                setPhotoUri(photo.uri);
                setShowCamera(false);
                setAnalyzing(true);
                setUploading(true);

                const file = new File(photo.uri);

                const formData = new FormData();

                formData.append(
                  'photo',
                  file
                );

                console.log(
                  'Sending photo to backend...'
                );

                const response = await fetch(
                  'http://172.20.10.2:3000/analyze',
                  {
                    method: 'POST',
                    body: formData,
                  }
                );

                console.log(
                  'Backend status:',
                  response.status
                );

                if (!response.ok) {
                  throw new Error(
                    `Server error: ${response.status}`
                  );
                }

                const result: ProductResult =
                  await response.json();

                console.log(
                  'Backend response:',
                  result
                );

                setProduct(result);
                setDetected(true);

              } catch (error) {
                console.log(
                  'Backend connection error:',
                  error
                );

                setProduct({
                  product:
                    'Unknown Product',
                  category:
                    'Unknown',
                  condition:
                    'Unknown',
                  confidence:
                    0,
                });

                setDetected(true);

              } finally {
                setUploading(false);
                setAnalyzing(false);
              }
            }}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <Text style={styles.captureHint}>
            TAP TO CAPTURE
          </Text>
        </View>
      </View>
    );
  }

  /*
   * AI ANALYSIS
   */
  if (analyzing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#9B6DFF"
        />

        <Text style={styles.analysisTitle}>
          {uploading
            ? 'Uploading your stock...'
            : 'Analyzing your stock...'}
        </Text>

        <Text style={styles.analysisText}>
          AI is identifying your product
        </Text>
      </View>
    );
  }

  /*
   * LISTING CREATED
   */
  if (listingCreated && product) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>
          ✓
        </Text>

        <Text style={styles.successTitle}>
          LISTING CREATED
        </Text>

        <Text style={styles.successSubtitle}>
          Your dead stock is now available for buyers.
        </Text>

        <View style={styles.listingCard}>
          <Text style={styles.productLabel}>
            PRODUCT
          </Text>

          <Text style={styles.productName}>
            {product.product}
          </Text>

          <Text style={styles.productCategory}>
            {product.category}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Quantity
            </Text>

            <Text style={styles.infoValue}>
              {quantity} units
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Original price
            </Text>

            <Text style={styles.infoValue}>
              ₹{originalPrice || '—'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Selling price
            </Text>

            <Text style={styles.infoValue}>
              ₹{sellingPrice || '—'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Stock age
            </Text>

            <Text style={styles.infoValue}>
              {stockAge || '—'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setListingCreated(false);
            setDetected(false);
            setProduct(null);
            setPhotoUri(null);
            setQuantity('1');
            setOriginalPrice('');
            setSellingPrice('');
            setStockAge('');
          }}
        >
          <Text style={styles.primaryButtonText}>
            SCAN MORE STOCK
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /*
   * PRODUCT DETAILS
   */
  if (detected && product) {
    return (
      <View style={styles.container}>
        <Text style={styles.detectedTitle}>
          PRODUCT DETECTED
        </Text>

        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={styles.detectedImage}
          />
        )}

        <View style={styles.productCard}>
          <Text style={styles.productLabel}>
            PRODUCT
          </Text>

          <Text style={styles.productName}>
            {product.product}
          </Text>

          <Text style={styles.productCategory}>
            {product.category}
          </Text>

          <Text style={styles.conditionText}>
            Condition: {product.condition}
          </Text>

          <View style={styles.confidenceBox}>
            <Text style={styles.confidenceText}>
              AI Confidence
            </Text>

            <Text style={styles.confidenceValue}>
              {product.confidence}%
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            STOCK DETAILS
          </Text>

          <Text style={styles.inputLabel}>
            QUANTITY
          </Text>

          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="e.g. 120"
            placeholderTextColor="#666670"
          />

          <Text style={styles.inputLabel}>
            ORIGINAL PRICE PER UNIT
          </Text>

          <TextInput
            style={styles.input}
            value={originalPrice}
            onChangeText={setOriginalPrice}
            keyboardType="numeric"
            placeholder="e.g. 5"
            placeholderTextColor="#666670"
          />

          <Text style={styles.inputLabel}>
            YOUR SELLING PRICE PER UNIT
          </Text>

          <TextInput
            style={styles.input}
            value={sellingPrice}
            onChangeText={setSellingPrice}
            keyboardType="numeric"
            placeholder="e.g. 3"
            placeholderTextColor="#666670"
          />

          <Text style={styles.inputLabel}>
            HOW LONG HAS IT BEEN IN STOCK?
          </Text>

          <TextInput
            style={styles.input}
            value={stockAge}
            onChangeText={setStockAge}
            placeholder="e.g. 6 months"
            placeholderTextColor="#666670"
          />

          <TouchableOpacity
            style={[
              styles.voiceButton,
              recording && styles.voiceButtonRecording,
            ]}
            onPress={
              recording
                ? stopRecording
                : startRecording
            }
          >
            <Text style={styles.voiceButtonText}>
              {recording
                ? '⏹ STOP RECORDING'
                : '🎤 SPEAK STOCK DETAILS'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setListingCreated(true);
            }}
          >
            <Text style={styles.primaryButtonText}>
              CREATE LISTING
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /*
   * HOME
   */
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          DEAD STOCK
        </Text>

        <Text style={styles.logoAccent}>
          EXCHANGE
        </Text>

        <Text style={styles.subtitle}>
          Turn excess inventory into sales.
        </Text>

        <Text style={styles.description}>
          Scan your unsold products and find
          potential buyers.
        </Text>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => {
            setShowCamera(true);
          }}
        >
          <Text style={styles.scanButtonText}>
            📷 SCAN STOCK
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
  },

  logoAccent: {
    color: '#9B6DFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 25,
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },

  description: {
    color: '#A0A0A8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 40,
  },

  scanButton: {
    backgroundColor: '#9B6DFF',
    paddingVertical: 18,
    paddingHorizontal: 45,
    borderRadius: 16,
  },

  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  loading: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },

  camera: {
    flex: 1,
  },

  cameraOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanBox: {
    width: 280,
    height: 220,
    borderWidth: 3,
    borderColor: '#9B6DFF',
    borderRadius: 20,
  },

  cameraText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },

  captureButton: {
    position: 'absolute',
    bottom: 75,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#9B6DFF',
  },

  captureHint: {
    position: 'absolute',
    bottom: 35,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  analysisTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 25,
    textAlign: 'center',
  },

  analysisText: {
    color: '#A0A0A8',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },

  detectedTitle: {
    color: '#9B6DFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 15,
  },

  detectedImage: {
    width: 150,
    height: 170,
    borderRadius: 18,
    marginBottom: 12,
  },

  productCard: {
    width: '100%',
    backgroundColor: '#17171D',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  productLabel: {
    color: '#888892',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  productName: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 5,
  },

  productCategory: {
    color: '#9B6DFF',
    fontSize: 15,
    marginTop: 5,
  },

  conditionText: {
    color: '#A0A0A8',
    fontSize: 14,
    marginTop: 8,
  },

  confidenceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#292932',
  },

  confidenceText: {
    color: '#A0A0A0',
    fontSize: 14,
  },

  confidenceValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  formCard: {
    width: '100%',
    backgroundColor: '#17171D',
    borderRadius: 18,
    padding: 16,
  },

  formTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },

  inputLabel: {
    color: '#A0A0A8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 5,
  },

  input: {
    backgroundColor: '#0F0F14',
    borderWidth: 1,
    borderColor: '#292932',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 15,
  },

  voiceButton: {
    backgroundColor: '#24202F',
    borderWidth: 1,
    borderColor: '#9B6DFF',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 15,
    alignItems: 'center',
  },

  voiceButtonRecording: {
    backgroundColor: '#3A1D28',
    borderColor: '#FF6B81',
  },

  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  primaryButton: {
    backgroundColor: '#9B6DFF',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },

  successIcon: {
    color: '#9B6DFF',
    fontSize: 60,
    fontWeight: '800',
  },

  successTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 5,
  },

  successSubtitle: {
    color: '#A0A0A8',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },

  listingCard: {
    width: '100%',
    backgroundColor: '#17171D',
    borderRadius: 18,
    padding: 20,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#292932',
    paddingVertical: 12,
  },

  infoLabel: {
    color: '#888892',
    fontSize: 14,
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});