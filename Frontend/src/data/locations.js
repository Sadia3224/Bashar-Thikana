// Districts and localities used by the search panel, filters and the owner listing form.
export const LOCATIONS = {
  Chattogram: ["GEC Circle", "Khulshi", "Nasirabad", "Agrabad", "Muradpur", "Halishahar", "Bahaddarhat", "Panchlaish", "Oxygen", "Chawkbazar"],
  Dhaka: ["Dhanmondi", "Mirpur", "Uttara", "Mohammadpur", "Badda", "Bashundhara", "Gulshan", "Banani", "Rampura", "Farmgate"],
  "Cox's Bazar": ["Kolatoli", "Sugandha", "Laboni Point", "Jhautala", "Bazarghata", "Laldighir Par", "Tekpara", "Hotel-Motel Zone"],
  Sylhet: ["Zindabazar", "Amberkhana", "Uposhohor", "Shibganj", "Tilagarh", "Mirabazar", "Akhalia", "Subidbazar"],
  Cumilla: ["Kandirpar", "Tomsom Bridge", "Jhawtola", "Race Course", "Shasongacha", "Bagichagaon", "Kotbari", "Chawkbazar"],
  Rajshahi: ["Shaheb Bazar", "Uposhohor", "Talaimari", "Kazla", "Binodpur", "Laxmipur", "Shiroil", "Padma Residential"],
  Khulna: ["Sonadanga", "Khalishpur", "Daulatpur", "Boyra", "Gollamari", "Nirala", "Shibbari", "KDA Avenue"],
  Barishal: ["Nathullabad", "Band Road", "Sadar Road", "Rupatali", "Kawnia", "Amanatganj", "Chowmatha", "Bogura Road"],
  Rangpur: ["Jahaj Company More", "Dhap", "Shapla Chattar", "Lalbagh", "Modern More", "Pairaband", "Station Road", "Medical More"],
  Mymensingh: ["Ganginarpar", "Charpara", "Notun Bazar", "Kewatkhali", "Shambhuganj", "Maskanda", "Akua", "Town Hall"],
};

export const DISTRICTS = Object.keys(LOCATIONS);

export const areasFor = (district) => LOCATIONS[district] || [];

export const isAreaInDistrict = (district, area) => areasFor(district).includes(area);
