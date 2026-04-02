import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const INITIAL_TRACTORS = [
  { id: '1', name: 'Mahindra 575 DI', owner: 'Ramesh', place: 'Kurnool', rate: 'Rs 900/hour', job: 'Ploughing and hauling', status: 'Available Today', listedByFarmer: false },
  { id: '2', name: 'Sonalika 745', owner: 'Sadiq Farm', place: 'Anantapur', rate: 'Rs 1400/acre', job: 'Rotavator work', status: 'Available Tomorrow', listedByFarmer: false },
];

const TEXT = {
  en: {
    back: 'Back',
    title: 'Tractor Booking',
    subtitle: 'Book nearby tractors or earn by renting your idle tractor.',
    heroTitle: 'Need tractor support today?',
    heroDesc: 'Choose your village, check open tickets, and book a tractor in one tap.',
    bookingDetails: 'Booking Details',
    village: 'Village / Area',
    villagePh: 'e.g. Kurnool',
    workNeeded: 'Work Needed',
    workPh: 'e.g. 4 hours for ploughing',
    tickets: 'Tractor Booking Tickets',
    newTicket: 'New Rental Ticket',
    openTicket: 'Open Ticket',
    yourTicket: 'Your Ticket',
    bookBtn: 'Book This Tractor',
    bookedFor: 'Booked for',
    work: 'Work',
    rate: 'Rate',
    cancel: 'Cancel Booking',
    noOpen: 'No open tractor tickets',
    noOpenSub: 'Ask a farmer to list a tractor for rent and it will appear here.',
    rentOut: 'Rent Out Your Idle Tractor',
    createTicket: 'Create a rental ticket',
    rentMeta: 'Other farmers will see this in the booking list above.',
    company: 'Tractor Company Name',
    companyPh: 'e.g. Mahindra, Sonalika',
    voiceTitle: 'Voice Entry For Company Name',
    voiceHint: 'Speak or type the tractor company name, then save it to the ticket.',
    voicePh: 'e.g. Mahindra Arjun 605',
    saveCompany: 'Save Company Name',
    pickup: 'Pickup Village / Area',
    pickupPh: 'e.g. Anantapur',
    rentRate: 'Rent Rate',
    rentRatePh: 'e.g. 1200/hour',
    rentDesc: 'Once listed, your tractor becomes a booking ticket for other farmers. After they book it, it moves into the booked list.',
    listBtn: 'List My Tractor For Rent',
    bookedTitle: 'Booked Tractors',
    noBooked: 'No bookings yet',
    noBookedSub: 'Booked tractors will appear here after a farmer confirms one.',
    emptyName: 'Empty Name',
    emptyNameSub: 'Please say or type the tractor company name first.',
    companyAdded: 'Company Name Added',
    bookingConfirmed: 'Booking Confirmed',
    listingCreated: 'Listing Created',
    cancelDone: 'Booking Cancelled',
    yourArea: 'your area',
    generalWork: 'General farm work',
    myTractor: 'My Tractor',
    yourVillage: 'Your village',
    availableWork: 'Available for ploughing, hauling, and village trips',
    readyToBook: 'Ready To Book',
    availableAgain: 'Available Again',
  },
  hi: {
    back: 'वापस',
    title: 'ट्रैक्टर बुकिंग',
    subtitle: 'आसपास का ट्रैक्टर बुक करें या अपना खाली ट्रैक्टर किराये पर दें।',
    heroTitle: 'आज ट्रैक्टर चाहिए?',
    heroDesc: 'गाँव चुनें, खुले टिकट देखें और एक टैप में ट्रैक्टर बुक करें।',
    bookingDetails: 'बुकिंग विवरण',
    village: 'गाँव / क्षेत्र',
    villagePh: 'जैसे Kurnool',
    workNeeded: 'ज़रूरी काम',
    workPh: 'जैसे 4 घंटे जुताई',
    tickets: 'ट्रैक्टर बुकिंग टिकट',
    newTicket: 'नया किराया टिकट',
    openTicket: 'खुला टिकट',
    yourTicket: 'आपका टिकट',
    bookBtn: 'यह ट्रैक्टर बुक करें',
    bookedFor: 'बुक किया गया',
    work: 'काम',
    rate: 'रेट',
    cancel: 'बुकिंग रद्द करें',
    noOpen: 'कोई खुला ट्रैक्टर टिकट नहीं',
    noOpenSub: 'जब कोई किसान ट्रैक्टर सूचीबद्ध करेगा तो वह यहाँ दिखेगा।',
    rentOut: 'अपना खाली ट्रैक्टर किराये पर दें',
    createTicket: 'किराया टिकट बनाएं',
    rentMeta: 'दूसरे किसान इसे ऊपर की सूची में देखेंगे।',
    company: 'ट्रैक्टर कंपनी नाम',
    companyPh: 'जैसे Mahindra, Sonalika',
    voiceTitle: 'कंपनी नाम के लिए वॉइस एंट्री',
    voiceHint: 'कंपनी नाम बोलें या लिखें, फिर टिकट में सेव करें।',
    voicePh: 'जैसे Mahindra Arjun 605',
    saveCompany: 'कंपनी नाम सेव करें',
    pickup: 'पिकअप गाँव / क्षेत्र',
    pickupPh: 'जैसे Anantapur',
    rentRate: 'किराया दर',
    rentRatePh: 'जैसे 1200/hour',
    rentDesc: 'सूचीबद्ध करने के बाद आपका ट्रैक्टर दूसरे किसानों के लिए टिकट बन जाता है। बुक होने पर यह बुक्ड सूची में चला जाता है।',
    listBtn: 'मेरा ट्रैक्टर किराये पर दें',
    bookedTitle: 'बुक किए गए ट्रैक्टर',
    noBooked: 'अभी कोई बुकिंग नहीं',
    noBookedSub: 'बुकिंग होने के बाद ट्रैक्टर यहाँ दिखाई देंगे।',
    emptyName: 'नाम खाली है',
    emptyNameSub: 'पहले ट्रैक्टर कंपनी नाम बोलें या लिखें।',
    companyAdded: 'कंपनी नाम जोड़ा गया',
    bookingConfirmed: 'बुकिंग पक्की हुई',
    listingCreated: 'लिस्टिंग बन गई',
    cancelDone: 'बुकिंग रद्द हुई',
    yourArea: 'आपका क्षेत्र',
    generalWork: 'सामान्य खेत काम',
    myTractor: 'मेरा ट्रैक्टर',
    yourVillage: 'आपका गाँव',
    availableWork: 'जुताई, ढुलाई और गाँव के काम के लिए उपलब्ध',
    readyToBook: 'बुकिंग के लिए तैयार',
    availableAgain: 'फिर से उपलब्ध',
  },
  te: {
    back: 'వెనక్కి',
    title: 'ట్రాక్టర్ బుకింగ్',
    subtitle: 'సమీప ట్రాక్టర్ బుక్ చేయండి లేదా మీ ఖాళీ ట్రాక్టర్‌ను అద్దెకు ఇవ్వండి.',
    heroTitle: 'ఈరోజు ట్రాక్టర్ కావాలా?',
    heroDesc: 'గ్రామాన్ని ఎంచుకుని, ఓపెన్ టికెట్లు చూసి, ఒక్క ట్యాప్‌లో బుక్ చేయండి.',
    bookingDetails: 'బుకింగ్ వివరాలు',
    village: 'గ్రామం / ప్రాంతం',
    villagePh: 'ఉదా: Kurnool',
    workNeeded: 'అవసరమైన పని',
    workPh: 'ఉదా: దున్నేందుకు 4 గంటలు',
    tickets: 'ట్రాక్టర్ బుకింగ్ టికెట్లు',
    newTicket: 'కొత్త అద్దె టికెట్',
    openTicket: 'ఓపెన్ టికెట్',
    yourTicket: 'మీ టికెట్',
    bookBtn: 'ఈ ట్రాక్టర్ బుక్ చేయండి',
    bookedFor: 'బుక్ చేసిన స్థలం',
    work: 'పని',
    rate: 'రేటు',
    cancel: 'బుకింగ్ రద్దు చేయండి',
    noOpen: 'ఓపెన్ ట్రాక్టర్ టికెట్లు లేవు',
    noOpenSub: 'ఎవరైనా రైతు ట్రాక్టర్ లిస్టు చేస్తే ఇది ఇక్కడ కనిపిస్తుంది.',
    rentOut: 'మీ ఖాళీ ట్రాక్టర్‌ను అద్దెకు ఇవ్వండి',
    createTicket: 'అద్దె టికెట్ సృష్టించండి',
    rentMeta: 'ఇతర రైతులు దీన్ని పై జాబితాలో చూస్తారు.',
    company: 'ట్రాక్టర్ కంపెనీ పేరు',
    companyPh: 'ఉదా: Mahindra, Sonalika',
    voiceTitle: 'కంపెనీ పేరుకు వాయిస్ ఎంట్రీ',
    voiceHint: 'కంపెనీ పేరు చెప్పండి లేదా టైప్ చేయండి, తర్వాత టికెట్‌కు సేవ్ చేయండి.',
    voicePh: 'ఉదా: Mahindra Arjun 605',
    saveCompany: 'కంపెనీ పేరు సేవ్ చేయండి',
    pickup: 'పికప్ గ్రామం / ప్రాంతం',
    pickupPh: 'ఉదా: Anantapur',
    rentRate: 'అద్దె రేటు',
    rentRatePh: 'ఉదా: 1200/hour',
    rentDesc: 'లిస్ట్ చేసిన తర్వాత మీ ట్రాక్టర్ ఇతర రైతులకు బుకింగ్ టికెట్‌గా కనిపిస్తుంది. బుక్ అయిన తర్వాత ఇది booked జాబితాలోకి వెళ్తుంది.',
    listBtn: 'నా ట్రాక్టర్‌ను అద్దెకు ఇవ్వండి',
    bookedTitle: 'బుక్ చేసిన ట్రాక్టర్లు',
    noBooked: 'ఇంకా బుకింగ్లు లేవు',
    noBookedSub: 'బుక్ అయిన ట్రాక్టర్లు ఇక్కడ కనిపిస్తాయి.',
    emptyName: 'పేరు ఖాళీగా ఉంది',
    emptyNameSub: 'ముందు ట్రాక్టర్ కంపెనీ పేరును చెప్పండి లేదా టైప్ చేయండి.',
    companyAdded: 'కంపెనీ పేరు జోడించబడింది',
    bookingConfirmed: 'బుకింగ్ పూర్తైంది',
    listingCreated: 'లిస్టింగ్ సృష్టించబడింది',
    cancelDone: 'బుకింగ్ రద్దయింది',
    yourArea: 'మీ ప్రాంతం',
    generalWork: 'సాధారణ వ్యవసాయ పని',
    myTractor: 'నా ట్రాక్టర్',
    yourVillage: 'మీ గ్రామం',
    availableWork: 'దున్నడం, సరుకు మోసడం, గ్రామ పనులకు అందుబాటులో ఉంది',
    readyToBook: 'బుకింగ్‌కు సిద్ధం',
    availableAgain: 'మళ్లీ అందుబాటులో ఉంది',
  },
};

const BookingTicket = ({ tractor, onBook, text }) => (
  <View style={styles.machineCard}>
    <View style={styles.ticketBadge}>
      <Text style={styles.ticketBadgeText}>{tractor.listedByFarmer ? text.newTicket : text.openTicket}</Text>
    </View>
    <View style={styles.machineTop}>
      <Text style={styles.machineEmoji}>🚜</Text>
      <View style={styles.machineInfo}>
        <Text style={styles.machineName}>{tractor.name}</Text>
        <Text style={styles.machineMeta}>👨‍🌾 {tractor.owner} • 📍 {tractor.place}</Text>
        <Text style={styles.machineMeta}>🧰 {tractor.job}</Text>
      </View>
    </View>
    <View style={styles.machineBottom}>
      <Text style={styles.machineRate}>{tractor.rate}</Text>
      <Text style={styles.machineStatus}>{tractor.status}</Text>
    </View>
    {tractor.listedByFarmer ? (
      <View style={styles.selfTicketBtn}>
        <Text style={styles.selfTicketBtnText}>{text.yourTicket}</Text>
      </View>
    ) : (
      <TouchableOpacity style={styles.primaryBtn} onPress={() => onBook(tractor)} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>📅 {text.bookBtn}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const BookedTicket = ({ item, onCancel, text }) => (
  <View style={styles.bookedCard}>
    <View style={styles.bookedTop}>
      <Text style={styles.bookedEmoji}>✅</Text>
      <View style={styles.bookedInfo}>
        <Text style={styles.bookedTitle}>{item.name}</Text>
        <Text style={styles.bookedMeta}>📍 {item.place}</Text>
        <Text style={styles.bookedMeta}>🧑‍🌾 {text.bookedFor}: {item.bookedFor}</Text>
        <Text style={styles.bookedMeta}>🛠 {text.work}: {item.bookedWork}</Text>
      </View>
    </View>
    <Text style={styles.bookedRate}>{text.rate}: {item.rate}</Text>
    <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(item)} activeOpacity={0.85}>
      <Text style={styles.cancelBtnText}>{text.cancel}</Text>
    </TouchableOpacity>
  </View>
);

export default function TractorScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').split('-')[0];
  const text = TEXT[lang] || TEXT.en;
  const [location, setLocation] = useState('');
  const [workNeeded, setWorkNeeded] = useState('');
  const [rentLocation, setRentLocation] = useState('');
  const [rentRate, setRentRate] = useState('');
  const [tractorCompany, setTractorCompany] = useState('');
  const [voiceDraft, setVoiceDraft] = useState('');
  const [showVoiceBox, setShowVoiceBox] = useState(false);
  const [availableTractors, setAvailableTractors] = useState(INITIAL_TRACTORS);
  const [bookedTractors, setBookedTractors] = useState([]);

  const handleBook = (tractor) => {
    const bookedFor = location.trim() || text.yourArea;
    const bookedWork = workNeeded.trim() || text.generalWork;
    setBookedTractors((current) => [{ ...tractor, bookedFor, bookedWork }, ...current]);
    setAvailableTractors((current) => current.filter((item) => item.id !== tractor.id));
    Alert.alert(text.bookingConfirmed, tractor.name);
  };

  const handleRentOut = () => {
    const newTractor = {
      id: String(Date.now()),
      name: tractorCompany.trim() || text.myTractor,
      owner: 'You',
      place: rentLocation.trim() || text.yourVillage,
      rate: rentRate.trim() || '1000/hour',
      job: text.availableWork,
      status: text.readyToBook,
      listedByFarmer: true,
    };
    setAvailableTractors((current) => [newTractor, ...current]);
    setRentLocation('');
    setRentRate('');
    setTractorCompany('');
    setVoiceDraft('');
    setShowVoiceBox(false);
    Alert.alert(text.listingCreated, text.rentMeta);
  };

  const handleCancelBooking = (tractor) => {
    setBookedTractors((current) => current.filter((item) => item.id !== tractor.id));
    setAvailableTractors((current) => [{ ...tractor, status: tractor.listedByFarmer ? text.readyToBook : text.availableAgain }, ...current]);
    Alert.alert(text.cancelDone, tractor.name);
  };

  const handleVoiceApply = () => {
    if (!voiceDraft.trim()) {
      Alert.alert(text.emptyName, text.emptyNameSub);
      return;
    }
    setTractorCompany(voiceDraft.trim());
    setShowVoiceBox(false);
    Alert.alert(text.companyAdded, voiceDraft.trim());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>‹ {text.back}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🚜 {text.title}</Text>
      <Text style={styles.subtitle}>{text.subtitle}</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>🚜</Text>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{text.heroTitle}</Text>
          <Text style={styles.heroDesc}>{text.heroDesc}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{text.bookingDetails}</Text>
        <Text style={styles.label}>{text.village}</Text>
        <TextInput style={styles.input} placeholder={text.villagePh} placeholderTextColor="#7e8c76" value={location} onChangeText={setLocation} />
        <Text style={styles.label}>{text.workNeeded}</Text>
        <TextInput style={styles.input} placeholder={text.workPh} placeholderTextColor="#7e8c76" value={workNeeded} onChangeText={setWorkNeeded} />
      </View>

      <Text style={styles.sectionTitle}>{text.tickets}</Text>
      {availableTractors.length > 0 ? availableTractors.map((tractor) => (
        <BookingTicket key={tractor.id} tractor={tractor} onBook={handleBook} text={text} />
      )) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🚜</Text>
          <Text style={styles.emptyTitle}>{text.noOpen}</Text>
          <Text style={styles.emptyText}>{text.noOpenSub}</Text>
        </View>
      )}

      <View style={styles.rentCard}>
        <Text style={styles.sectionTitle}>{text.rentOut}</Text>
        <Text style={styles.rentMachine}>{text.createTicket}</Text>
        <Text style={styles.rentMeta}>{text.rentMeta}</Text>

        <Text style={styles.label}>{text.company}</Text>
        <View style={styles.voiceRow}>
          <TextInput style={[styles.input, styles.voiceInput]} placeholder={text.companyPh} placeholderTextColor="#7e8c76" value={tractorCompany} onChangeText={setTractorCompany} />
          <TouchableOpacity style={styles.micBtn} onPress={() => setShowVoiceBox((current) => !current)} activeOpacity={0.85}>
            <Text style={styles.micBtnText}>🎤</Text>
          </TouchableOpacity>
        </View>

        {showVoiceBox && (
          <View style={styles.voiceCard}>
            <Text style={styles.voiceTitle}>{text.voiceTitle}</Text>
            <Text style={styles.voiceHint}>{text.voiceHint}</Text>
            <TextInput style={[styles.input, styles.voiceDraftInput]} placeholder={text.voicePh} placeholderTextColor="#7e8c76" value={voiceDraft} onChangeText={setVoiceDraft} multiline />
            <TouchableOpacity style={styles.voiceSaveBtn} onPress={handleVoiceApply} activeOpacity={0.85}>
              <Text style={styles.voiceSaveText}>{text.saveCompany}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>{text.pickup}</Text>
        <TextInput style={styles.input} placeholder={text.pickupPh} placeholderTextColor="#7e8c76" value={rentLocation} onChangeText={setRentLocation} />
        <Text style={styles.label}>{text.rentRate}</Text>
        <TextInput style={styles.input} placeholder={text.rentRatePh} placeholderTextColor="#7e8c76" value={rentRate} onChangeText={setRentRate} />
        <Text style={styles.rentDesc}>{text.rentDesc}</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleRentOut} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>🤝 {text.listBtn}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{text.bookedTitle}</Text>
      {bookedTractors.length > 0 ? bookedTractors.map((tractor) => (
        <BookedTicket key={tractor.id} item={tractor} onCancel={handleCancelBooking} text={text} />
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
  heroEmoji: { fontSize: 52, marginRight: 14 },
  heroText: { flex: 1 },
  heroTitle: { color: '#263626', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  heroDesc: { color: '#72806e', fontSize: 14, lineHeight: 20 },
  formCard: { backgroundColor: '#f7fbf3', borderRadius: 28, padding: 18, marginBottom: 18 },
  sectionTitle: { color: '#223322', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  label: { color: '#667462', fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: '#edf5e7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#203120',
    fontSize: 15,
  },
  voiceRow: { flexDirection: 'row', alignItems: 'center' },
  voiceInput: { flex: 1 },
  micBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#ffecd2',
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnText: { fontSize: 24 },
  voiceCard: {
    backgroundColor: '#edf5e7',
    borderRadius: 20,
    padding: 14,
    marginTop: 12,
    marginBottom: 6,
  },
  voiceTitle: { color: '#294029', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  voiceHint: { color: '#6b7c68', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  voiceDraftInput: { minHeight: 84, textAlignVertical: 'top' },
  voiceSaveBtn: {
    backgroundColor: '#ff9d27',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  voiceSaveText: { color: '#fffdf6', fontSize: 15, fontWeight: '800' },
  machineCard: { backgroundColor: '#f7fbf3', borderRadius: 28, padding: 18, marginBottom: 14 },
  ticketBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffe8c7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  ticketBadgeText: { color: '#b96c0f', fontSize: 12, fontWeight: '800' },
  machineTop: { flexDirection: 'row', alignItems: 'center' },
  machineEmoji: { fontSize: 50, marginRight: 14 },
  machineInfo: { flex: 1 },
  machineName: { color: '#223322', fontSize: 18, fontWeight: '800' },
  machineMeta: { color: '#6f7e6c', fontSize: 13, marginTop: 4 },
  machineBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 14 },
  machineRate: { color: '#ff8b1d', fontSize: 18, fontWeight: '800' },
  machineStatus: { color: '#4a8652', fontSize: 14, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#ff9d27', borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fffdf6', fontSize: 16, fontWeight: '800' },
  selfTicketBtn: {
    backgroundColor: '#e6efe0',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  selfTicketBtnText: { color: '#5e755d', fontSize: 15, fontWeight: '800' },
  rentCard: { backgroundColor: '#f7fbf3', borderRadius: 28, padding: 18, marginTop: 6, marginBottom: 18 },
  rentMachine: { color: '#223322', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  rentMeta: { color: '#58765b', fontSize: 14, marginBottom: 4 },
  rentDesc: { color: '#6f7f6f', fontSize: 14, lineHeight: 20, marginVertical: 12 },
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
