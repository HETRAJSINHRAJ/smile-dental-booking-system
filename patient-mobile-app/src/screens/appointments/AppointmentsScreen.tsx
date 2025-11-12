import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  ScrollView,
  Image,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContextWithToast';
import { getAllDocuments } from '../../lib/firestore';
import { Appointment } from '../../types/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';


interface AppointmentSection {
  title: string;
  data: Appointment[];
  originalData: Appointment[];
  color: string;
  collapsed: boolean;
}

const AppointmentsScreen: React.FC = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState<AppointmentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalVisits, setTotalVisits] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'reservation' | 'bill'>('reservation');


  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);



  const loadAppointments = async () => {
    try {
      const data = await getAllDocuments<Appointment>('appointments', [
        { field: 'userId', operator: '==', value: user?.uid },
      ]);
      
      console.log('=== APPOINTMENTS DEBUG ===');
      console.log('Total appointments:', data.length);
      data.forEach((apt, idx) => {
        console.log(`Appointment ${idx + 1}:`, {
          id: apt.id.slice(-6),
          service: apt.serviceName,
          status: apt.status,
          date: new Date(apt.appointmentDate.seconds * 1000).toLocaleDateString(),
        });
      });
      
      const sorted = data.sort((a, b) => a.appointmentDate.seconds - b.appointmentDate.seconds);
      
      const upcoming = sorted.filter(apt => {
        const status = apt.status?.toLowerCase().trim();
        return status === 'confirmed' || status === 'pending';
      });
      
      const finished = sorted.filter(apt => {
        const status = apt.status?.toLowerCase().trim();
        return status === 'completed' || status === 'cancelled';
      });
      
      const noShow = sorted.filter(apt => {
        const status = apt.status?.toLowerCase().trim();
        return status === 'no_show';
      });
      
      console.log('Upcoming appointments:', upcoming.length);
      console.log('Finished appointments:', finished.length);
      console.log('No Show appointments:', noShow.length);
      console.log('========================');
      
      setTotalVisits(data.length);
      
      const newSections: AppointmentSection[] = [];
      if (upcoming.length > 0) {
        newSections.push({
          title: 'Upcoming',
          data: upcoming,
          originalData: upcoming,
          color: '#4A90E2',
          collapsed: false,
        });
      }
      if (finished.length > 0) {
        newSections.push({
          title: 'Finished',
          data: finished,
          originalData: finished,
          color: '#2ECC71',
          collapsed: false,
        });
      }
      if (noShow.length > 0) {
        newSections.push({
          title: 'No Show',
          data: noShow,
          originalData: noShow,
          color: '#FF6B6B',
          collapsed: false,
        });
      }
      
      setSections(newSections);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const toggleSection = (index: number) => {
    setSections(prev => prev.map((section, i) => {
      if (i === index) {
        return {
          ...section,
          collapsed: !section.collapsed,
          data: !section.collapsed ? [] : section.originalData,
        };
      }
      return section;
    }));
  };

  const getVisitNumber = (appointment: Appointment, allAppointments: Appointment[]) => {
    const userAppointments = allAppointments
      .filter(apt => apt.userId === appointment.userId)
      .sort((a, b) => a.appointmentDate.seconds - b.appointmentDate.seconds);
    
    const index = userAppointments.findIndex(apt => apt.id === appointment.id);
    return index + 1;
  };

  const renderAppointment = ({ item, section, index }: { item: Appointment; section: AppointmentSection; index: number }) => {
    const appointmentDate = new Date(item.appointmentDate.seconds * 1000);
    const day = appointmentDate.getDate();
    const month = appointmentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    
    const allAppointments = sections.flatMap(s => s.originalData);
    const visitNumber = getVisitNumber(item, allAppointments);
    
    const confirmationNumber = item.confirmationNumber || `RSVT${item.id.slice(-5).toUpperCase()}`;
    
    const hasMultipleServices = item.notes?.toLowerCase().includes('multiple') || false;
    
    const needsPayment = item.status === 'completed' && 
                        (item.servicePaymentStatus === 'pending' || item.paymentStatus === 'pending');
    
    const totalPaymentDue = item.servicePaymentStatus === 'pending' ? item.servicePaymentAmount : 0;
    
    const isPaid = item.status === 'completed' && item.servicePaymentStatus === 'paid';
    
    const isLastInSection = index === section.data.length - 1;
    
    const isUpcoming = section.title === 'Upcoming';
    
    const getPaymentIcon = () => {
      if (item.paymentStatus === 'fully_paid') return 'card';
      if (item.paymentStatus === 'reservation_paid') return 'card-outline';
      return 'wallet-outline';
    };
    
    return (
      <View style={styles.appointmentRow}>
        <View style={styles.timelineContainer}>
          <View style={[styles.dateCircle, { backgroundColor: section.color }]}>
            <Text style={styles.dateMonth}>{month}</Text>
            <Text style={styles.dateDay}>{day}</Text>
          </View>
          {!isLastInSection && <View style={styles.timelineLine} />}
        </View>
        
        <TouchableOpacity 
          style={styles.appointmentCard}
          onPress={() => {
            setSelectedAppointment(item);
            setActiveTab('reservation');
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.timeText}>
              {item.startTime} - {item.endTime}
            </Text>
            <Text style={styles.appointmentId}>#{confirmationNumber}</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.serviceName}>{item.serviceName}</Text>
              {hasMultipleServices && (
                <View style={styles.multipleBadge}>
                  <Text style={styles.multipleBadgeText}>MULTIPLE</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.visitDetails}>
              Visit #{visitNumber} - {item.serviceName}
            </Text>
            
            <View style={styles.providerRow}>
              <Icon name="medkit-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.providerName}>{item.providerName}</Text>
            </View>
            
            {needsPayment && totalPaymentDue > 0 && (
              <View style={styles.paymentSection}>
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentLabelRow}>
                    <Icon name={getPaymentIcon()} size={14} color={colors.text.secondary} />
                    <Text style={styles.paymentLabel}>Total payment</Text>
                  </View>
                  <Text style={styles.paymentAmount}>₹{totalPaymentDue.toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.payButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    // Handle payment action here
                    console.log('Pay button pressed');
                  }}
                >
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {isPaid && (
              <View style={styles.statusTag}>
                <Text style={[styles.statusTagText, { color: '#2ECC71' }]}>
                  + PAID
                </Text>
              </View>
            )}
            
            {item.status === 'cancelled' && (
              <View style={styles.statusTag}>
                <Text style={[styles.statusTagText, { color: colors.error.main }]}>
                  + CANCELLED
                </Text>
              </View>
            )}
            
            {item.status === 'no_show' && (
              <>
                <View style={styles.statusTag}>
                  <Text style={[styles.statusTagText, { color: '#FF6B6B' }]}>
                    + NO SHOW
                  </Text>
                </View>
                <View style={styles.noShowInfo}>
                  <Icon name="information-circle-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.noShowInfoText}>
                    You missed this appointment. Please contact us to reschedule or if you have any questions.
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDetailModal = () => {
    if (!selectedAppointment) return null;

    const appointmentDate = new Date(selectedAppointment.appointmentDate.seconds * 1000);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const confirmationNumber = selectedAppointment.confirmationNumber || `RSVT${selectedAppointment.id.slice(-5).toUpperCase()}`;
    
    const allAppointments = sections.flatMap(s => s.originalData);
    const visitNumber = getVisitNumber(selectedAppointment, allAppointments);

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backButton}>
              <Icon name="chevron-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {formattedDate} ({selectedAppointment.startTime} - {selectedAppointment.endTime})
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalSection}>
              <View style={styles.modalTabs}>
                <TouchableOpacity 
                  style={activeTab === 'reservation' ? styles.activeTab : styles.inactiveTab}
                  onPress={() => setActiveTab('reservation')}
                >
                  <Text style={activeTab === 'reservation' ? styles.activeTabText : styles.inactiveTabText}>
                    Reservation detail
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={activeTab === 'bill' ? styles.activeTab : styles.inactiveTab}
                  onPress={() => setActiveTab('bill')}
                >
                  <Text style={activeTab === 'bill' ? styles.activeTabText : styles.inactiveTabText}>
                    Bill detail
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'reservation' && (
                <>
                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationNumber}>#{confirmationNumber}</Text>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusBadgeText}>
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.providerCard}>
                    {selectedAppointment.providerImageUrl ? (
                      <Image 
                        source={{ uri: selectedAppointment.providerImageUrl }}
                        style={styles.providerImage}
                      />
                    ) : (
                      <View style={styles.providerIconContainer}>
                        <Icon name="person" size={28} color={colors.primary[500]} />
                      </View>
                    )}
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerNameLarge}>{selectedAppointment.providerName}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.treatmentSection}>
                    <Text style={styles.sectionTitle}>Appointment Information</Text>
                    <View style={styles.treatmentCard}>
                      <Text style={styles.treatmentName}>{selectedAppointment.serviceName}</Text>
                      <Text style={styles.treatmentPrice}>₹{selectedAppointment.paymentAmount.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Visit Number</Text>
                      <Text style={styles.detailValue}>#{visitNumber}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Provider</Text>
                      <Text style={styles.detailValue}>{selectedAppointment.providerName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Patient Name</Text>
                      <Text style={styles.detailValue}>{selectedAppointment.userName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Patient Email</Text>
                      <Text style={styles.detailValue}>{selectedAppointment.userEmail}</Text>
                    </View>

                    {selectedAppointment.userPhone && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Patient Phone</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.userPhone}</Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Appointment Date</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedAppointment.appointmentDate.seconds * 1000).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Time Slot</Text>
                      <Text style={styles.detailValue}>
                        {selectedAppointment.startTime} - {selectedAppointment.endTime}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={styles.detailValue}>
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1).replace('_', ' ')}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created On</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedAppointment.createdAt.seconds * 1000).toLocaleDateString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  {selectedAppointment.notes && (
                    <View style={styles.notesSection}>
                      <Icon name="document-text-outline" size={20} color={colors.text.secondary} />
                      <Text style={styles.notesText}>{selectedAppointment.notes}</Text>
                    </View>
                  )}

                </>
              )}

              {activeTab === 'bill' && (
                <>
                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationNumber}>#{confirmationNumber}</Text>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusBadgeText}>
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billSection}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    
                    <View style={styles.billCard}>
                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Service</Text>
                        <Text style={styles.billValue}>{selectedAppointment.serviceName}</Text>
                      </View>

                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Appointment Fee</Text>
                        <Text style={styles.billValue}>₹{selectedAppointment.paymentAmount.toFixed(2)}</Text>
                      </View>

                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Payment Type</Text>
                        <Text style={styles.billValue}>
                          {selectedAppointment.paymentType === 'appointment_reservation' ? 'Reservation' : 
                           selectedAppointment.paymentType === 'full_payment' ? 'Full Payment' : 'Service Payment'}
                        </Text>
                      </View>

                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Payment Status</Text>
                        <View style={[styles.paymentStatusBadge, {
                          backgroundColor: selectedAppointment.paymentStatus === 'fully_paid' ? '#D1F4E0' :
                                         selectedAppointment.paymentStatus === 'reservation_paid' ? '#FFF4E6' : '#FFE6E6'
                        }]}>
                          <Text style={[styles.paymentStatusText, {
                            color: selectedAppointment.paymentStatus === 'fully_paid' ? '#2ECC71' :
                                   selectedAppointment.paymentStatus === 'reservation_paid' ? '#FF9800' : '#FF6B6B'
                          }]}>
                            {selectedAppointment.paymentStatus === 'fully_paid' ? 'Fully Paid' :
                             selectedAppointment.paymentStatus === 'reservation_paid' ? 'Reservation Paid' :
                             selectedAppointment.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                          </Text>
                        </View>
                      </View>

                      {selectedAppointment.paymentMethod && (
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>Payment Method</Text>
                          <Text style={styles.billValue}>
                            {selectedAppointment.paymentMethod.toUpperCase()}
                          </Text>
                        </View>
                      )}

                      {selectedAppointment.paymentTransactionId && (
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>Transaction ID</Text>
                          <Text style={styles.billValueSmall}>
                            {selectedAppointment.paymentTransactionId}
                          </Text>
                        </View>
                      )}

                      {selectedAppointment.paymentDate && (
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>Payment Date</Text>
                          <Text style={styles.billValue}>
                            {new Date(selectedAppointment.paymentDate.seconds * 1000).toLocaleDateString('en-IN')}
                          </Text>
                        </View>
                      )}

                      <View style={styles.divider} />

                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Service Payment Amount</Text>
                        <Text style={styles.billValue}>₹{selectedAppointment.servicePaymentAmount.toFixed(2)}</Text>
                      </View>

                      <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Service Payment Status</Text>
                        <View style={[styles.paymentStatusBadge, {
                          backgroundColor: selectedAppointment.servicePaymentStatus === 'paid' ? '#D1F4E0' :
                                         selectedAppointment.servicePaymentStatus === 'waived' ? '#E3F2FD' : '#FFE6E6'
                        }]}>
                          <Text style={[styles.paymentStatusText, {
                            color: selectedAppointment.servicePaymentStatus === 'paid' ? '#2ECC71' :
                                   selectedAppointment.servicePaymentStatus === 'waived' ? '#2196F3' : '#FF6B6B'
                          }]}>
                            {selectedAppointment.servicePaymentStatus === 'paid' ? 'Paid' :
                             selectedAppointment.servicePaymentStatus === 'waived' ? 'Waived' : 'Pending'}
                          </Text>
                        </View>
                      </View>

                      {selectedAppointment.servicePaymentMethod && (
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>Service Payment Method</Text>
                          <Text style={styles.billValue}>
                            {selectedAppointment.servicePaymentMethod.toUpperCase()}
                          </Text>
                        </View>
                      )}

                      {selectedAppointment.servicePaymentDate && (
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>Service Payment Date</Text>
                          <Text style={styles.billValue}>
                            {new Date(selectedAppointment.servicePaymentDate.seconds * 1000).toLocaleDateString('en-IN')}
                          </Text>
                        </View>
                      )}

                      {selectedAppointment.servicePaymentTransactionId && (
                        <View style={styles.billRow}>
                          <Text style={styles.billLabel}>Service Transaction ID</Text>
                          <Text style={styles.billValueSmall}>
                            {selectedAppointment.servicePaymentTransactionId}
                          </Text>
                        </View>
                      )}

                      <View style={styles.divider} />

                      <View style={styles.billRow}>
                        <Text style={styles.billTotalLabel}>Total Amount</Text>
                        <Text style={styles.billTotalValue}>
                          ₹{(selectedAppointment.paymentAmount + selectedAppointment.servicePaymentAmount).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {selectedAppointment.servicePaymentNotes && (
                      <View style={styles.notesSection}>
                        <Icon name="document-text-outline" size={20} color={colors.text.secondary} />
                        <Text style={styles.notesText}>{selectedAppointment.servicePaymentNotes}</Text>
                      </View>
                    )}

                    {/* Receipt Button */}
                    {selectedAppointment.receiptUrl && (
                      <TouchableOpacity
                        style={styles.receiptButton}
                        onPress={() => {
                          if (selectedAppointment.receiptUrl) {
                            Linking.openURL(selectedAppointment.receiptUrl);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.receiptButtonIcon}>
                          <Icon name="document-text-outline" size={22} color={colors.primary[500]} />
                        </View>
                        <View style={styles.receiptButtonContent}>
                          <Text style={styles.receiptButtonText}>View Receipt</Text>
                          <Text style={styles.receiptButtonSubtext}>Download PDF</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderSectionHeader = ({ section }: { section: AppointmentSection }) => {
    const sectionIndex = sections.findIndex(s => s.title === section.title);
    
    return (
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection(sectionIndex)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionIndicator}>
          <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
          <Text style={styles.sectionTitle}>
            {section.title} ({section.originalData.length})
          </Text>
        </View>
        <Icon 
          name={section.collapsed ? "chevron-forward" : "chevron-down"} 
          size={20} 
          color={colors.text.secondary} 
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <TouchableOpacity>
            <Icon name="ellipsis-vertical" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
              progressBackgroundColor={colors.background.paper}
            />
          }
        >
          <View style={styles.emptyIcon}>
            <Icon name="calendar-outline" size={64} color={colors.neutral[300]} />
          </View>
          <Text style={styles.emptyTitle}>No Appointments</Text>
          <Text style={styles.emptyText}>
            You haven't booked any appointments yet.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity>
          <Icon name="ellipsis-vertical" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      <SectionList
        sections={sections}
        renderItem={renderAppointment}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
            progressBackgroundColor={colors.background.paper}
          />
        }
      />
      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 500,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  sectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  appointmentRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.white,
    marginTop: -2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[200],
    marginTop: spacing.xs,
  },
  appointmentCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  appointmentId: {
    fontSize: 13,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  cardContent: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  multipleBadge: {
    backgroundColor: '#E8D4FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  multipleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  visitDetails: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  paymentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  paymentInfo: {
    gap: 4,
  },
  paymentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  payButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  payButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  statusTag: {
    marginTop: spacing.sm,
  },
  statusTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noShowInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#FFF5F5',
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  noShowInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    padding: spacing.xs,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    padding: spacing.lg,
  },
  modalTabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.neutral[100],
  },
  activeTab: {
    flex: 1,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  activeTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary[500],
    textAlign: 'center',
  },
  inactiveTab: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  inactiveTabText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmationNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success.main,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  providerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  providerInfo: {
    flex: 1,
  },
  providerNameLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerDistance: {
    fontSize: 13,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  providerRating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 4,
  },
  providerReviews: {
    fontSize: 13,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  mapButton: {
    padding: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.lg,
  },
  treatmentSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  treatmentCard: {
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  treatmentPrice: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  singleBadge: {
    backgroundColor: '#D1F4E0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  singleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2ECC71',
    letterSpacing: 0.5,
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  billSection: {
    marginTop: spacing.md,
  },
  billCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  billLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'right',
  },
  billValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[500],
  },
  paymentStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.paper,
    borderWidth: 0.5,
    borderColor: colors.border.light,
    marginTop: spacing.lg,
    ...shadows.small,
  },
  receiptButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  receiptButtonContent: {
    flex: 1,
  },
  receiptButtonText: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  receiptButtonSubtext: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
});

export default AppointmentsScreen;
