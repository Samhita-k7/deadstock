import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import * as Location from 'expo-location';
import { useRouter, useNavigation } from 'expo-router';
import { fetch } from 'expo/fetch';
import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ProductResult = {
  product: string;
  category: string;
  condition: string;
  confidence: number;
};

type Listing = {
  product: string;
  category: string;
  condition: string;
  confidence: number;
  quantity: string;
  originalPrice: string;
  sellingPrice: string;
  stockAge: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  image?: string | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'seller' | 'buyer' | null>(null);
  
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
  const [listing, setListing] = useState<Listing | null>(null);
  const [editingProduct, setEditingProduct] = useState(false);

  const [quantity, setQuantity] = useState('1');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockAge, setStockAge] = useState('');

  const [listingCreated, setListingCreated] = useState(false);

    const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: role === 'seller'
        ? { display: 'none' }
        : undefined,
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [role]);

  /*
   * START VOICE RECORDING
   */
  const startRecording = async () => {
    console.log('START RECORDING BUTTON PRESSED');
    try {
      const permission =
        await requestRecordingPermissionsAsync();
        console.log('MIC PERMISSION:', permission);

      if (!permission.granted) {
        Alert.alert(
          'Microphone Permission',
          'Please allow microphone access in your Phone settings.'
        );
        return;
      }

      await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      interruptionMode: 'doNotMix',
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

    const uri = audioRecorder.uri;

    console.log('Voice recording stopped');
    console.log('Recording URI:', uri);

    if (!uri) {
      Alert.alert(
        'Voice Error',
        'No recording was found.'
      );
      return;
    }

    setAnalyzing(true);

    console.log('Sending voice recording to backend...');

    const formData = new FormData();

    const audioFile = new File(uri);
    formData.append('audio', audioFile);

    const response = await fetch(
      `${API_URL}/voice-analyze`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    console.log('Voice AI result:', data);

    if (!response.ok) {
      throw new Error(
        data.error || 'Voice analysis failed'
      );
    }

    setQuantity(data.quantity || '');
    setOriginalPrice(data.originalPrice || '');
    setSellingPrice(data.sellingPrice || '');
    setStockAge(data.stockAge || '');

    Alert.alert(
      'Voice Details Extracted',
      'Your stock details have been filled automatically.'
    );
  } catch (error) {
    console.log(
      'Voice analysis error:',
      error
    );

    Alert.alert(
      'Voice Error',
      'Could not understand the voice recording.'
    );
  } finally {
    setAnalyzing(false);
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

      <TouchableOpacity
        style={styles.cameraBackButton}
        onPress={() => {
          setShowCamera(false);
        }}
      >
        <Text style={styles.cameraBackButtonText}>
          ← BACK
        </Text>
      </TouchableOpacity>

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
                  `${API_URL}/analyze`,
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

          <View style={styles.successActions}>
          <TouchableOpacity
            style={styles.successPrimaryButton}
            onPress={() => router.push('/marketplace')}
          >
            <Text style={styles.successPrimaryButtonText}>
              VIEW LISTING
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.successSecondaryButton}
            onPress={() => {
              setListingCreated(false);
              setDetected(false);
              setProduct(null);
              setPhotoUri(null);
              setQuantity('1');
              setOriginalPrice('');
              setSellingPrice('');
              setStockAge('');
              setShowCamera(true);
            }}
          >
            <Text style={styles.successSecondaryButtonText}>
              CREATE ANOTHER LISTING
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /*
   * PRODUCT DETAILS
   */
    /*
   * PRODUCT DETAILS
   */
  if (detected && product) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0B0B0F' }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
        <View style={styles.productHeader}>
        <Text style={styles.productLabel}>
        PRODUCT
        </Text>

    <TouchableOpacity
      style={styles.editIconButton}
      onPress={() => setEditingProduct(!editingProduct)}
    >
      <Text style={styles.editIcon}>
        ✎
      </Text>

      <Text style={styles.editText}>
        {editingProduct ? 'Done' : 'Edit'}
      </Text>
    </TouchableOpacity>
  </View>

  {editingProduct ? (
    <>
      <TextInput
        style={styles.productEditInput}
        value={product.product}
        onChangeText={(text) =>
          setProduct({
            ...product,
            product: text,
          })
        }
        placeholder="Product name"
        placeholderTextColor="#666670"
      />

      <TextInput
        style={styles.productEditInput}
        value={product.category}
        onChangeText={(text) =>
          setProduct({
            ...product,
            category: text,
          })
        }
        placeholder="Category"
        placeholderTextColor="#666670"
      />

      <TextInput
        style={styles.productEditInput}
        value={product.condition}
        onChangeText={(text) =>
          setProduct({
            ...product,
            condition: text,
          })
        }
        placeholder="Condition"
        placeholderTextColor="#666670"
      />
    </>
  ) : (
    <>
      <Text style={styles.productName}>
        {product.product}
      </Text>

      <Text style={styles.productCategory}>
        {product.category}
      </Text>

      <Text style={styles.conditionText}>
        Condition: {product.condition}
      </Text>
    </>
  )}

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
              onPress={async () => {
                if (!product) {
                  return;
                }

                const { status } =
                  await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                  Alert.alert(
                    'Location Required',
                    'Please allow location access so buyers can find nearby stock.'
                  );
                  return;
                }

                const location =
                  await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                  });

                let imageUrl: string | null = null;

                if (photoUri) {
                  const imageFormData = new FormData();

                  const imageFile = new File(photoUri);

                  imageFormData.append('photo', imageFile);

                  const imageResponse = await fetch(
                    `${API_URL}/upload-image`,
                    {
                      method: 'POST',
                      body: imageFormData,
                    }
                  );

                  const imageData = await imageResponse.json();

                  if (!imageResponse.ok) {
                    throw new Error(
                      imageData.error || 'Image upload failed'
                    );
                  }

                  imageUrl = `${API_URL}/uploads/${imageData.filename}`;
                }

                const newListing: Listing = {
                  product: product.product,
                  category: product.category,
                  condition: product.condition,
                  confidence: product.confidence,
                  quantity,
                  originalPrice,
                  sellingPrice,
                  stockAge,

                  location: 'Seller location',
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  image: imageUrl,
                };

                try {
                  const response = await fetch(
                    `${API_URL}/listings`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(newListing),
                    }
                  );
                  console.log('Listing response status:', response.status);
                  console.log('Listing response URL:', response.url);

                  const data = await response.json();

                  console.log(
                    'Listing sent to backend:',
                    data
                  );

                  setListing(newListing);
                  setListingCreated(true);

                } catch (error) {
                  console.log(
                    'Listing upload error:',
                    error
                  );
                }
              }}
            >
              <Text style={styles.primaryButtonText}>
                CREATE LISTING
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  /*
   * HOME
   */
  if (role === null) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.setuLogo}>
          SETU
        </Text>

        <Text style={styles.setuTagline}>
          Bridging Surplus Inventory with Demand
        </Text>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => setRole('seller')}
        >
          <Text style={styles.roleButtonText}>
            I AM A SELLER
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButtonSecondary}
          onPress={() => router.push('/marketplace')}
        >
          <Text style={styles.roleButtonSecondaryText}>
            I AM A BUYER
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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

<TouchableOpacity
  style={styles.sellerBackButton}
  onPress={() => setRole(null)}
>
  <Text style={styles.sellerBackButtonText}>
    ← GO BACK
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

  cameraBackButton: {
  position: 'absolute',
  top: 55,
  left: 20,
  backgroundColor: 'rgba(0,0,0,0.65)',
  borderWidth: 1,
  borderColor: '#9B6DFF',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 12,
  zIndex: 10,
},

  cameraBackButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '800',
  letterSpacing: 0.5,
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

    scrollContent: {
    flexGrow: 1,
    paddingVertical: 25,
  },

  editButton: {
    width: '100%',
    backgroundColor: '#24202F',
    borderWidth: 1,
    borderColor: '#9B6DFF',
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

    successActions: {
    width: '100%',
    marginTop: 20,
  },

  successPrimaryButton: {
    width: '100%',
    backgroundColor: '#9B6DFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  successPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },

  successSecondaryButton: {
    width: '100%',
    backgroundColor: '#24202F',
    borderWidth: 1,
    borderColor: '#9B6DFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  successSecondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

    productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  editIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },

  editIcon: {
    color: '#9B6DFF',
    fontSize: 18,
    marginRight: 4,
  },

  editText: {
    color: '#9B6DFF',
    fontSize: 13,
    fontWeight: '700',
  },

  productEditInput: {
    backgroundColor: '#0F0F14',
    borderWidth: 1,
    borderColor: '#9B6DFF',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 8,
  },
  setuLogo: {
  color: '#FFFFFF',
  fontSize: 48,
  fontWeight: '900',
  letterSpacing: 4,
  marginBottom: 12,
},

setuTagline: {
  color: '#A0A0A8',
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 55,
},

roleButton: {
  width: '100%',
  backgroundColor: '#9B6DFF',
  paddingVertical: 18,
  borderRadius: 16,
  alignItems: 'center',
  marginBottom: 14,
},

roleButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '800',
  letterSpacing: 1,
},

roleButtonSecondary: {
  width: '100%',
  backgroundColor: '#17171D',
  borderWidth: 1,
  borderColor: '#9B6DFF',
  paddingVertical: 18,
  borderRadius: 16,
  alignItems: 'center',
},

roleButtonSecondaryText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '800',
  letterSpacing: 1,
},

sellerBackButton: {
  backgroundColor: '#17171D',
  borderWidth: 1,
  borderColor: '#9B6DFF',
  paddingVertical: 11,
  paddingHorizontal: 28,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 14,
},

sellerBackButtonText: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '800',
  letterSpacing: 0.5,
},

});