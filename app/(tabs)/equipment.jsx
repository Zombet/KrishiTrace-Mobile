import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const INITIAL_EQUIPMENT = [
  { id: '1', icon: '🛠️', name: 'Power Sprayer', owner: 'Lakshmi Agro', place: 'Nandyal', rate: '350/day', status: 'Ready Now', listedByFarmer: false },
  { id: '2', icon: '🌾', name: 'Mini Harvester', owner: 'Green Fields', place: 'Kadapa', rate: '1800/day', status: 'Available Tomorrow', listedByFarmer: false },
  { id: '3', icon: '🚿', name: 'Drip Pipe Kit', owner: 'Village Tools', place: 'Kurnool', rate: '220/day', status: 'Ready Now', listedByFarmer: false },
];

const TEXT = {
  en: {
    back: 'Back',
    title: 'Equipment Booking',
    subtitle: 'Book tools nearby or rent out your idle farm machinery.',
    heroTitle: 'Shared equipment, lower cost',
    heroDesc: 'Farmers can borrow what they need and owners can earn from machines that are sitting idle.',
    bookingDetails: 'Booking Details',
    village: 'Village / Area',
    villagePh: 'e.g. Kurnool',
    neededFor: 'Needed For',
    neededForPh: 'e.g. Spraying for one day',
    tickets: 'Equipment Booking Tickets',
    newTicket: 'New Rental Ticket',
    openTicket: 'Open Ticket',
    yourTicket: 'Your Ticket',
    bookBtn: 'Book Equipment',
    bookedFor: 'Booked for',
    use: 'Use',
    rate: 'Rate',
    cancel: 'Cancel Booking',
    noOpen: 'No open equipment tickets',
    noOpenSub: 'Listed equipment will appear here for farmers to book.',
    rentOut: 'Rent Out My Machinery',
    machineName: 'Machine / Tool Name',
    machinePh: 'e.g. Seeder, Sprayer, Tiller',
    rentPrice: 'Rent Price',
    rentPricePh: 'e.g. 500/day',
    note: 'Once listed, your machine becomes an equipment booking ticket for nearby farmers.',
    listBtn: 'List Equipment For Rent',
    bookedTitle: 'Booked Equipment',
    noBooked: 'No equipment bookings yet',
    noBookedSub: 'Booked equipment will appear here after a farmer confirms one.',
    bookingConfirmed: 'Booking Confirmed',
    listingCreated: 'Machine Listed',
    cancelDone: 'Booking Cancelled',
    yourVillage: 'your village',
    generalUse: 'General farm use',
    myEquipment: 'My Equipment',
    ready: 'Ready To Book',
    availableAgain: 'Available Again',
  },
  hi: {
    back: 'वापस',
    title: 'उपकरण बुकिंग',
    subtitle: 'आसपास के औजार बुक करें या अपनी खाली मशीन किराये पर दें।',
    heroTitle: 'साझा उपकरण, कम खर्च',
    heroDesc: 'किसान ज़रूरत के औजार ले सकते हैं और मालिक खाली मशीन से कमाई कर सकते हैं।',
    bookingDetails: 'बुकिंग विवरण',
    village: 'गाँव / क्षेत्र',
    villagePh: 'जैसे Kurnool',
    neededFor: 'किस काम के लिए',
    neededForPh: 'जैसे एक दिन स्प्रे के लिए',
    tickets: 'उपकरण बुकिंग टिकट',
    newTicket: 'नया किराया टिकट',
    openTicket: 'खुला टिकट',
    yourTicket: 'आपका टिकट',
    bookBtn: 'उपकरण बुक करें',
    bookedFor: 'बुक किया गया',
    use: 'उपयोग',
    rate: 'रेट',
    cancel: 'बुकिंग रद्द करें',
    noOpen: 'कोई खुला उपकरण टिकट नहीं',
    noOpenSub: 'सूचीबद्ध उपकरण यहाँ दिखाई देंगे।',
    rentOut: 'अपनी मशीन किराये पर दें',
    machineName: 'मशीन / औजार नाम',
    machinePh: 'जैसे Seeder, Sprayer, Tiller',
    rentPrice: 'किराया दर',
    rentPricePh: 'जैसे 500/day',
    note: 'सूचीबद्ध करने के बाद आपकी मशीन दूसरे किसानों के लिए टिकट बन जाती है।',
    listBtn: 'उपकरण किराये पर सूचीबद्ध करें',
    bookedTitle: 'बुक किए गए उपकरण',
    noBooked: 'अभी कोई उपकरण बुकिंग नहीं',
    noBookedSub: 'बुकिंग होने के बाद उपकरण यहाँ दिखेंगे।',
    bookingConfirmed: 'बुकिंग पक्की हुई',
    listingCreated: 'मशीन सूचीबद्ध हुई',
    cancelDone: 'बुकिंग रद्द हुई',
    yourVillage: 'आपका गाँव',
    generalUse: 'सामान्य खेत उपयोग',
    myEquipment: 'मेरी मशीन',
    ready: 'बुकिंग के लिए तैयार',
    availableAgain: 'फिर से उपलब्ध',
  },
  te: {
    back: 'వెనక్కి',
    title: 'పరికరాల బుకింగ్',
    subtitle: 'సమీప పరికరాలు బుక్ చేయండి లేదా మీ ఖాళీ యంత్రాన్ని అద్దెకు ఇవ్వండి.',
    heroTitle: 'పంచుకునే పరికరాలు, తక్కువ ఖర్చు',
    heroDesc: 'రైతులు అవసరమైన సాధనాలు వాడుకోవచ్చు, యజమానులు ఖాళీ యంత్రాల నుంచి ఆదాయం పొందవచ్చు.',
    bookingDetails: 'బుకింగ్ వివరాలు',
    village: 'గ్రామం / ప్రాంతం',
    villagePh: 'ఉదా: Kurnool',
    neededFor: 'ఏ పని కోసం',
    neededForPh: 'ఉదా: ఒక రోజు స్ప్రే కోసం',
    tickets: 'పరికరాల బుకింగ్ టికెట్లు',
    newTicket: 'కొత్త అద్దె టికెట్',
    openTicket: 'ఓపెన్ టికెట్',
    yourTicket: 'మీ టికెట్',
    bookBtn: 'పరికరం బుక్ చేయండి',
    bookedFor: 'బుక్ చేసిన స్థలం',
    use: 'వినియోగం',
    rate: 'రేటు',
    cancel: 'బుకింగ్ రద్దు చేయండి',
    noOpen: 'ఓపెన్ పరికరాల టికెట్లు లేవు',
    noOpenSub: 'లిస్టు చేసిన పరికరాలు ఇక్కడ కనిపిస్తాయి.',
    rentOut: 'నా యంత్రాన్ని అద్దెకు ఇవ్వండి',
    machineName: 'మిషన్ / సాధనం పేరు',
    machinePh: 'ఉదా: Seeder, Sprayer, Tiller',
    rentPrice: 'అద్దె ధర',
    rentPricePh: 'ఉదా: 500/day',
    note: 'లిస్టు చేసిన తర్వాత మీ యంత్రం సమీప రైతులకు బుకింగ్ టికెట్ అవుతుంది.',
    listBtn: 'పరికరం అద్దెకు లిస్టు చేయండి',
    bookedTitle: 'బుక్ చేసిన పరికరాలు',
    noBooked: 'ఇంకా పరికరాల బుకింగ్లు లేవు',
    noBookedSub: 'బుక్ అయిన పరికరాలు ఇక్కడ కనిపిస్తాయి.',
    bookingConfirmed: 'బుకింగ్ పూర్తైంది',
    listingCreated: 'మిషన్ లిస్టు అయింది',
    cancelDone: 'బుకింగ్ రద్దయింది',
    yourVillage: 'మీ గ్రామం',
    generalUse: 'సాధారణ వ్యవసాయ వినియోగం',
    myEquipment: 'నా యంత్రం',
    ready: 'బుకింగ్‌కు సిద్ధం',
    availableAgain: 'మళ్లీ అందుబాటులో ఉంది',
  },
};

const EquipmentTicket = ({ item, onBook, text }) => (
  <View style={styles.itemCard}>
    <View style={styles.ticketBadge}>
      <Text style={styles.ticketBadgeText}>{item.listedByFarmer ? text.newTicket : text.openTicket}</Text>
    </View>
    <View style={styles.itemTop}>
      <Text style={styles.itemEmoji}>{item.icon}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>👨‍🌾 {item.owner} • 📍 {item.place}</Text>
      </View>
    </View>
    <View style={styles.itemBottom}>
      <Text style={styles.itemRate}>{item.rate}</Text>
      <Text style={styles.itemStatus}>{item.status}</Text>
    </View>
    {item.listedByFarmer ? (
      <View style={styles.selfTicketBtn}>
        <Text style={styles.selfTicketBtnText}>{text.yourTicket}</Text>
      </View>
    ) : (
      <TouchableOpacity style={styles.primaryBtn} onPress={() => onBook(item)} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>📦 {text.bookBtn}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const BookedEquipment = ({ item, onCancel, text }) => (
  <View style={styles.bookedCard}>
    <View style={styles.bookedTop}>
      <Text style={styles.bookedEmoji}>✅</Text>
      <View style={styles.bookedInfo}>
        <Text style={styles.bookedTitle}>{item.name}</Text>
        <Text style={styles.bookedMeta}>📍 {item.place}</Text>
        <Text style={styles.bookedMeta}>🧑‍🌾 {text.bookedFor}: {item.bookedFor}</Text>
        <Text style={styles.bookedMeta}>🧰 {text.use}: {item.bookedUse}</Text>
      </View>
    </View>
    <Text style={styles.bookedRate}>{text.rate}: {item.rate}</Text>
    <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(item)} activeOpacity={0.85}>
      <Text style={styles.cancelBtnText}>{text.cancel}</Text>
    </TouchableOpacity>
  </View>
);

export default function EquipmentScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').split('-')[0];
  const text = TEXT[lang] || TEXT.en;
  const [bookingPlace, setBookingPlace] = useState('');
  const [bookingUse, setBookingUse] = useState('');
  const [toolName, setToolName] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [rentPlace, setRentPlace] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState(INITIAL_EQUIPMENT);
  const [bookedEquipment, setBookedEquipment] = useState([]);

  const handleBook = (item) => {
    const bookedFor = bookingPlace.trim() || text.yourVillage;
    const bookedUse = bookingUse.trim() || text.generalUse;
    setBookedEquipment((current) => [{ ...item, bookedFor, bookedUse }, ...current]);
    setAvailableEquipment((current) => current.filter((equipment) => equipment.id !== item.id));
    Alert.alert(text.bookingConfirmed, item.name);
  };

  const handleList = () => {
    const newTicket = {
      id: String(Date.now()),
      icon: '🧰',
      name: toolName.trim() || text.myEquipment,
      owner: 'You',
      place: rentPlace.trim() || text.yourVillage,
      rate: rentPrice.trim() || '500/day',
      status: text.ready,
      listedByFarmer: true,
    };
    setAvailableEquipment((current) => [newTicket, ...current]);
    setToolName('');
    setRentPrice('');
    setRentPlace('');
    Alert.alert(text.listingCreated, newTicket.name);
  };

  const handleCancelBooking = (item) => {
    setBookedEquipment((current) => current.filter((equipment) => equipment.id !== item.id));
    setAvailableEquipment((current) => [{ ...item, status: item.listedByFarmer ? text.ready : text.availableAgain }, ...current]);
    Alert.alert(text.cancelDone, item.name);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>‹ {text.back}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🛠️ {text.title}</Text>
      <Text style={styles.subtitle}>{text.subtitle}</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>🤝</Text>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{text.heroTitle}</Text>
          <Text style={styles.heroDesc}>{text.heroDesc}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{text.bookingDetails}</Text>
        <Text style={styles.label}>{text.village}</Text>
        <TextInput style={styles.input} placeholder={text.villagePh} placeholderTextColor="#7e8c76" value={bookingPlace} onChangeText={setBookingPlace} />
        <Text style={styles.label}>{text.neededFor}</Text>
        <TextInput style={styles.input} placeholder={text.neededForPh} placeholderTextColor="#7e8c76" value={bookingUse} onChangeText={setBookingUse} />
      </View>

      <Text style={styles.sectionTitle}>{text.tickets}</Text>
      {availableEquipment.length > 0 ? availableEquipment.map((item) => (
        <EquipmentTicket key={item.id} item={item} onBook={handleBook} text={text} />
      )) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🧰</Text>
          <Text style={styles.emptyTitle}>{text.noOpen}</Text>
          <Text style={styles.emptyText}>{text.noOpenSub}</Text>
        </View>
      )}

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{text.rentOut}</Text>
        <Text style={styles.label}>{text.machineName}</Text>
        <TextInput style={styles.input} placeholder={text.machinePh} placeholderTextColor="#7e8c76" value={toolName} onChangeText={setToolName} />
        <Text style={styles.label}>{text.village}</Text>
        <TextInput style={styles.input} placeholder={text.villagePh} placeholderTextColor="#7e8c76" value={rentPlace} onChangeText={setRentPlace} />
        <Text style={styles.label}>{text.rentPrice}</Text>
        <TextInput style={styles.input} placeholder={text.rentPricePh} placeholderTextColor="#7e8c76" value={rentPrice} onChangeText={setRentPrice} />
        <Text style={styles.note}>💡 {text.note}</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleList} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>💰 {text.listBtn}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{text.bookedTitle}</Text>
      {bookedEquipment.length > 0 ? bookedEquipment.map((item) => (
        <BookedEquipment key={item.id} item={item} onCancel={handleCancelBooking} text={text} />
      )) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🗂️</Text>
          <Text style={styles.emptyTitle}>{text.noBooked}</Text>
          <Text style={styles.emptyText}>{text.noBookedSub}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f4df' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 36 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#4e8650', fontSize: 16, fontWeight: '700' },
  title: { color: '#203120', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#687766', fontSize: 14, marginTop: 6, marginBottom: 18, lineHeight: 21 },
  heroCard: {
    backgroundColor: '#f7fbf3',
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroEmoji: { fontSize: 48, marginRight: 14 },
  heroText: { flex: 1 },
  heroTitle: { color: '#263626', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  heroDesc: { color: '#72806e', fontSize: 14, lineHeight: 20 },
  sectionTitle: { color: '#223322', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  formCard: { backgroundColor: '#f7fbf3', borderRadius: 28, padding: 18, marginBottom: 18 },
  label: { color: '#667462', fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: '#edf5e7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#203120',
    fontSize: 15,
  },
  itemCard: { backgroundColor: '#f7fbf3', borderRadius: 28, padding: 18, marginBottom: 14 },
  ticketBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff1c9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  ticketBadgeText: { color: '#b08900', fontSize: 12, fontWeight: '800' },
  itemTop: { flexDirection: 'row', alignItems: 'center' },
  itemEmoji: { fontSize: 48, marginRight: 14 },
  itemInfo: { flex: 1 },
  itemName: { color: '#223322', fontSize: 18, fontWeight: '800' },
  itemMeta: { color: '#6f7e6c', fontSize: 13, marginTop: 4 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 14 },
  itemRate: { color: '#d59f00', fontSize: 18, fontWeight: '800' },
  itemStatus: { color: '#4a8652', fontSize: 14, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#f5ca38', borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#352f08', fontSize: 16, fontWeight: '800' },
  selfTicketBtn: {
    backgroundColor: '#e6efe0',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  selfTicketBtnText: { color: '#5e755d', fontSize: 15, fontWeight: '800' },
  note: { color: '#687766', fontSize: 13, lineHeight: 19, marginTop: 12, marginBottom: 14 },
  secondaryBtn: { backgroundColor: '#dfeece', borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#457a49', fontSize: 16, fontWeight: '800' },
  bookedCard: { backgroundColor: '#f7fbf3', borderRadius: 28, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#cfe4c0' },
  bookedTop: { flexDirection: 'row', alignItems: 'flex-start' },
  bookedEmoji: { fontSize: 34, marginRight: 12 },
  bookedInfo: { flex: 1 },
  bookedTitle: { color: '#223322', fontSize: 18, fontWeight: '800' },
  bookedMeta: { color: '#627360', fontSize: 13, marginTop: 5 },
  bookedRate: { color: '#4a8652', fontSize: 14, fontWeight: '700', marginTop: 12 },
  cancelBtn: {
    marginTop: 14,
    backgroundColor: '#fde2e2',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#b33d3d', fontSize: 15, fontWeight: '800' },
  emptyCard: { backgroundColor: '#f7fbf3', borderRadius: 24, padding: 18, alignItems: 'center', marginBottom: 18 },
  emptyEmoji: { fontSize: 34, marginBottom: 8 },
  emptyTitle: { color: '#223322', fontSize: 17, fontWeight: '800', marginBottom: 6 },
  emptyText: { color: '#6e7d6a', fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
