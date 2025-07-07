import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Camera, Plus, Search, QrCode, Calendar, Settings, FileText, Wrench, CircleHelp as HelpCircle, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function EquipmentScreen() {
  const [serialNumber, setSerialNumber] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [assets, setAssets] = useState([
    {
      id: '1',
      name: 'CATERPILLAR 320 EXCAVATOR',
      serialNumber: 'CAT12345',
      status: 'operational',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
    },
    {
      id: '2',
      name: 'CATERPILLAR 950 WHEEL LOADER',
      serialNumber: 'CAT67890',
      status: 'maintenance',
      lastMaintenance: '2024-02-10',
      nextMaintenance: '2024-03-10',
    },
  ]);

  const handleScanCode = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Camera Not Available',
        'Camera scanning is not available on web. Please use the manual input option.',
      );
      return;
    }

    if (!permission) {
      Alert.alert('Permission Required', 'Camera permission is required to scan codes.');
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan codes.');
        return;
      }
    }

    setShowCamera(true);
  };

  const handleAddAsset = () => {
    if (serialNumber.trim() === '') {
      Alert.alert('Error', 'Please enter a serial number');
      return;
    }

    const newAsset = {
      id: Date.now().toString(),
      name: 'NEW EQUIPMENT',
      serialNumber: serialNumber.trim(),
      status: 'operational',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    setAssets([...assets, newAsset]);
    setSerialNumber('');
    Alert.alert('Success', 'Asset added successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return '#10B981';
      case 'maintenance':
        return '#F59E0B';
      case 'offline':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle size={20} color="#10B981" />;
      case 'maintenance':
        return <AlertCircle size={20} color="#F59E0B" />;
      case 'offline':
        return <AlertCircle size={20} color="#EF4444" />;
      default:
        return <AlertCircle size={20} color="#6B7280" />;
    }
  };

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={({ data }) => {
            setSerialNumber(data);
            setShowCamera(false);
            Alert.alert('Scanned Successfully', `Serial Number: ${data}`);
          }}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.cameraCloseButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraCloseButtonText}>Close</Text>
            </TouchableOpacity>
            <View style={styles.scanFrame}>
              <Text style={styles.scanText}>Point camera at serial number</Text>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Equipment Manager</Text>
          <TouchableOpacity style={styles.headerButton}>
            <HelpCircle size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Add Asset Section */}
        <View style={styles.addAssetSection}>
          <Text style={styles.sectionTitle}>Add Your Equipment</Text>
          <Text style={styles.sectionSubtitle}>
            Add equipment to get personalized parts recommendations and maintenance schedules
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.serialInput}
              placeholder="Enter Serial Number (e.g., CAT12345)"
              placeholderTextColor="#666666"
              value={serialNumber}
              onChangeText={setSerialNumber}
              accessible={true}
              accessibilityLabel="Serial number input"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAsset}
              accessible={true}
              accessibilityLabel="Add equipment"
            >
              <Plus size={20} color="#000000" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputNote}>
            Serial numbers are typically 8 characters starting with 3 letters followed by 5 numbers
          </Text>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanCode}
            accessible={true}
            accessibilityLabel="Scan serial number with camera"
          >
            <QrCode size={24} color="#333333" />
            <Text style={styles.scanButtonText}>Scan Serial Number</Text>
          </TouchableOpacity>
        </View>

        {/* Asset List */}
        <View style={styles.assetListSection}>
          <Text style={styles.sectionTitle}>Your Equipment</Text>
          {assets.map((asset) => (
            <View key={asset.id} style={styles.assetCard}>
              <View style={styles.assetCardHeader}>
                <View style={styles.assetCardInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetSerial}>SN: {asset.serialNumber}</Text>
                </View>
                <View style={styles.assetStatus}>
                  {getStatusIcon(asset.status)}
                  <Text style={[styles.assetStatusText, { color: getStatusColor(asset.status) }]}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.assetCardBody}>
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.maintenanceLabel}>Last Maintenance</Text>
                  <Text style={styles.maintenanceDate}>{asset.lastMaintenance}</Text>
                </View>
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.maintenanceLabel}>Next Maintenance</Text>
                  <Text style={styles.maintenanceDate}>{asset.nextMaintenance}</Text>
                </View>
              </View>

              <View style={styles.assetCardActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Wrench size={16} color="#333333" />
                  <Text style={styles.actionButtonText}>Find Parts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <FileText size={16} color="#333333" />
                  <Text style={styles.actionButtonText}>Manuals</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Calendar size={16} color="#333333" />
                  <Text style={styles.actionButtonText}>Schedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Search size={32} color="#FFD100" />
              <Text style={styles.quickActionTitle}>Find Parts</Text>
              <Text style={styles.quickActionSubtitle}>Search by equipment or part number</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Settings size={32} color="#FFD100" />
              <Text style={styles.quickActionTitle}>Maintenance</Text>
              <Text style={styles.quickActionSubtitle}>Schedule and track maintenance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <FileText size={32} color="#FFD100" />
              <Text style={styles.quickActionTitle}>Manuals</Text>
              <Text style={styles.quickActionSubtitle}>Access operation manuals</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Camera size={32} color="#FFD100" />
              <Text style={styles.quickActionTitle}>Scan Part</Text>
              <Text style={styles.quickActionSubtitle}>Identify parts with camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  headerButton: {
    padding: 8,
  },
  addAssetSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  serialInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD100',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  inputNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 12,
  },
  scanButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  assetListSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  assetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  assetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assetCardInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  assetSerial: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  assetStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assetStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  assetCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  maintenanceDate: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  assetCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quickActionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cameraCloseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFD100',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});