import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { styles } from './EmergencyContactsScreen.styles';

interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

export const EmergencyContactsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false,
  });

  const handleOpenModal = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship || '',
        isPrimary: contact.isPrimary || false,
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        phone: '',
        relationship: '',
        isPrimary: false,
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      isPrimary: false,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);

    // Eğer primary seçildiyse, diğer primary'leri kaldır
    if (formData.isPrimary) {
      const updatedContacts = contacts.map(c => ({
        ...c,
        isPrimary: c.id === editingContact?.id ? true : false,
      }));
      setContacts(updatedContacts);
    }

    if (editingContact?.id) {
      // Güncelle
      const updatedContacts = contacts.map(c =>
        c.id === editingContact.id
          ? { ...c, ...formData }
          : c
      );
      setContacts(updatedContacts);
      Alert.alert('Success', 'Contact updated successfully');
    } else {
      // Yeni ekle
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        ...formData,
      };
      setContacts([...contacts, newContact]);
      Alert.alert('Success', 'Contact added successfully');
    }

    setLoading(false);
    handleCloseModal();
  };

  const handleDelete = (contact: EmergencyContact) => {
    if (!contact.id) return;

    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contacts.filter(c => c.id !== contact.id);
            setContacts(updatedContacts);
            Alert.alert('Success', 'Contact deleted successfully');
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.surface} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon name="call-outline" size={40} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>Manage your emergency contacts</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={colors.primary[600]} />
          <Text style={styles.infoText}>
            Add emergency contacts that can be reached in case of an emergency. You can set one as primary.
          </Text>
        </View>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={64} color={colors.primary[300]} />
            <Text style={styles.emptyStateText}>No emergency contacts</Text>
            <Text style={styles.emptyStateSubtext}>Add your first emergency contact</Text>
          </View>
        ) : (
          <View style={styles.contactsList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactHeader}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  {contact.relationship && (
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  )}
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(contact.phone)}
                  >
                    <Icon name="call" size={20} color={colors.surface} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleOpenModal(contact)}
                  >
                    <Icon name="create-outline" size={20} color={colors.primary[600]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(contact)}
                  >
                    <Icon name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <Icon name="add" size={24} color={colors.surface} />
          <Text style={styles.addButtonText}>Add Emergency Contact</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    placeholderTextColor="#9ca3af"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="call-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="people-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Spouse, Parent, Friend"
                    placeholderTextColor="#9ca3af"
                    value={formData.relationship}
                    onChangeText={(text) => setFormData({ ...formData, relationship: text })}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxWrapper}
                onPress={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}
              >
                <View style={[styles.checkbox, formData.isPrimary && styles.checkboxChecked]}>
                  {formData.isPrimary && (
                    <Icon name="checkmark" size={16} color={colors.surface} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Set as primary contact</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveModalButton, loading && styles.saveModalButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveModalButtonText}>
                  {loading ? 'Saving...' : editingContact ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
