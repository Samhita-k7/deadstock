import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Listing = {
  id: string;
  product: string;
  category: string;
  quantity: number;
  sellingPrice: number;
  condition: string;
  location: string;
  latitude: number;
  longitude: number;
  distance: string;
  image: string;
};

const mockListings: Listing[] = [
  {
    id: '1',
    product: 'LED Bulbs',
    category: 'Electronics',
    quantity: 100,
    sellingPrice: 35,
    condition: 'New',
    location: 'Hyderabad',
    latitude: 17.4400,
    longitude: 78.3900,
    distance: '--',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
  },
  {
    id: '2',
    product: 'Notebooks',
    category: 'Stationery',
    quantity: 50,
    sellingPrice: 40,
    condition: 'New',
    location: 'Secunderabad',
    latitude: 17.4399,
    longitude: 78.4983,
    distance: '--',
    image:
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800',
  },
  {
    id: '3',
    product: 'Plastic Storage Boxes',
    category: 'Household',
    quantity: 30,
    sellingPrice: 120,
    condition: 'Good',
    location: 'Begumpet',
    latitude: 17.4435,
    longitude: 78.4730,
    distance: '--',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
  },
  {
    id: '4',
    product: 'Cotton T-Shirts',
    category: 'Clothing',
    quantity: 75,
    sellingPrice: 180,
    condition: 'New',
    location: 'Banjara Hills',
    latitude: 17.4156,
    longitude: 78.4347,
    distance: '--',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  },
  {
    id: '5',
    product: 'Steel Water Bottles',
    category: 'Kitchen',
    quantity: 40,
    sellingPrice: 150,
    condition: 'New',
    location: 'Kukatpally',
    latitude: 17.4849,
    longitude: 78.4138,
    distance: '--',
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
  },
];

function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371;

  const latDifference =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(latDifference / 2) *
      Math.sin(latDifference / 2) +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function ListingCard({
  listing,
  onViewDetails,
}: {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
}) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: listing.image }}
        style={styles.productImage}
      />

      <View style={styles.cardContent}>
        <View style={styles.categoryRow}>
          <Text style={styles.category}>
            {listing.category}
          </Text>

          <Text style={styles.condition}>
            {listing.condition}
          </Text>
        </View>

        <Text style={styles.productName}>
          {listing.product}
        </Text>

        <Text style={styles.quantity}>
          {listing.quantity} units available
        </Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>
              SELLING PRICE
            </Text>

            <Text style={styles.price}>
              ₹{listing.sellingPrice}
              <Text style={styles.perUnit}>
                {' '}
                / unit
              </Text>
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.distance}>
              📍 {listing.distance}
            </Text>

            <Text style={styles.location}>
              {listing.location}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onViewDetails(listing)}
        >
          <Text style={styles.viewButtonText}>
            VIEW DETAILS
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ListingDetails({
  listing,
  onBack,
}: {
  listing: Listing;
  onBack: () => void;
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>
            ← BACK TO MARKETPLACE
          </Text>
        </TouchableOpacity>

        <Image
          source={{ uri: listing.image }}
          style={styles.detailsImage}
        />

        <Text style={styles.detailsCategory}>
          {listing.category}
        </Text>

        <Text style={styles.detailsTitle}>
          {listing.product}
        </Text>

        <Text style={styles.detailsLocation}>
          📍 {listing.location} • {listing.distance} away
        </Text>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsSectionTitle}>
            PRODUCT DETAILS
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Condition
            </Text>

            <Text style={styles.detailValue}>
              {listing.condition}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Available quantity
            </Text>

            <Text style={styles.detailValue}>
              {listing.quantity} units
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Price per unit
            </Text>

            <Text style={styles.detailPrice}>
              ₹{listing.sellingPrice}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Total value
            </Text>

            <Text style={styles.detailValue}>
              ₹{listing.quantity * listing.sellingPrice}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => {
            console.log(
              'Contact seller:',
              listing.product
            );
          }}
        >
          <Text style={styles.contactButtonText}>
            CONTACT SELLER
          </Text>
        </TouchableOpacity>

        <Text style={styles.demoText}>
          This is a prototype. Seller contact functionality
          will be connected later.
        </Text>
      </ScrollView>
    </View>
  );
}

export default function MarketplaceScreen() {
  const [selectedListing, setSelectedListing] =
    useState<Listing | null>(null);

  const [locationStatus, setLocationStatus] =
    useState('Getting your location...');

  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  const [listings, setListings] =
    useState<Listing[]>(mockListings);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationStatus('Location permission denied');
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      setUserLocation(location);

      const updatedListings = mockListings.map(
        (listing) => {
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            listing.latitude,
            listing.longitude
          );

          return {
            ...listing,
            distance: `${distance.toFixed(1)} km`,
          };
        }
      );

      setListings(updatedListings);

      setLocationStatus('Location detected');
    } catch (error) {
      console.log('Location error:', error);
      setLocationStatus('Unable to get location');
    }
  };

  if (selectedListing) {
    return (
      <ListingDetails
        listing={selectedListing}
        onBack={() => setSelectedListing(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          DEAD STOCK
        </Text>

        <Text style={styles.titleAccent}>
          MARKETPLACE
        </Text>

        <Text style={styles.subtitle}>
          Find excess stock near you
        </Text>

        <View style={styles.locationBanner}>
          <Text style={styles.locationIcon}>
            📍
          </Text>

          <View style={styles.locationTextContainer}>
            <Text style={styles.locationBannerTitle}>
              {locationStatus}
            </Text>

            {userLocation ? (
              <Text style={styles.locationBannerText}>
                Nearby distances calculated from your location
              </Text>
            ) : (
              <Text style={styles.locationBannerText}>
                Allow location access to find nearby stock
              </Text>
            )}
          </View>
        </View>

        {userLocation && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {listings.map((listing) => (
                <Marker
                  key={listing.id}
                  coordinate={{
                    latitude: listing.latitude,
                    longitude: listing.longitude,
                  }}
                  title={listing.product}
                  description={`${listing.category} • ${listing.distance}`}
                  onPress={() =>
                    setSelectedListing(listing)
                  }
                />
              ))}
            </MapView>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          AVAILABLE STOCK
        </Text>

        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onViewDetails={setSelectedListing}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 2,
  },

  titleAccent: {
    color: '#9B6DFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 2,
  },

  subtitle: {
    color: '#A0A0A8',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 25,
  },

  locationBanner: {
    backgroundColor: '#17171D',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#292932',
  },

  locationIcon: {
    fontSize: 25,
    marginRight: 12,
  },

  locationTextContainer: {
    flex: 1,
  },

  locationBannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  locationBannerText: {
    color: '#888892',
    fontSize: 12,
    marginTop: 3,
  },

  mapContainer: {
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#292932',
  },

  map: {
    width: '100%',
    height: '100%',
  },

  sectionTitle: {
    color: '#888892',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#17171D',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#292932',
  },

  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#24242C',
  },

  cardContent: {
    padding: 16,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  category: {
    color: '#9B6DFF',
    fontSize: 12,
    fontWeight: '700',
  },

  condition: {
    color: '#A0A0A8',
    fontSize: 12,
  },

  productName: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 7,
  },

  quantity: {
    color: '#888892',
    fontSize: 13,
    marginTop: 5,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 18,
  },

  priceLabel: {
    color: '#666670',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  price: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 3,
  },

  perUnit: {
    color: '#888892',
    fontSize: 12,
    fontWeight: '400',
  },

  locationContainer: {
    alignItems: 'flex-end',
  },

  distance: {
    color: '#9B6DFF',
    fontSize: 13,
    fontWeight: '700',
  },

  location: {
    color: '#888892',
    fontSize: 11,
    marginTop: 3,
  },

  viewButton: {
    backgroundColor: '#9B6DFF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  backButton: {
    marginBottom: 25,
  },

  backButtonText: {
    color: '#9B6DFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  detailsImage: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    backgroundColor: '#24242C',
    marginBottom: 20,
  },

  detailsCategory: {
    color: '#9B6DFF',
    fontSize: 13,
    fontWeight: '700',
  },

  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8,
  },

  detailsLocation: {
    color: '#A0A0A8',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 25,
  },

  detailsCard: {
    backgroundColor: '#17171D',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#292932',
  },

  detailsSectionTitle: {
    color: '#888892',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 15,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#292932',
  },

  detailLabel: {
    color: '#A0A0A8',
    fontSize: 14,
    flex: 1,
  },

  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  detailPrice: {
    color: '#9B6DFF',
    fontSize: 18,
    fontWeight: '800',
  },

  contactButton: {
    backgroundColor: '#9B6DFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
  },

  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  demoText: {
    color: '#666670',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
});