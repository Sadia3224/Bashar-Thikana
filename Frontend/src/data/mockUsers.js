// Sample people who appear as listing owners and in the admin user list.
// They have no password, so nobody can sign in as them; new accounts are created through Register.
export const MOCK_USERS = [
  { id: "o1", name: "Rahim Uddin", email: "rahim.uddin@example.com", phone: "01711-245863", role: "owner", verified: true, active: true, createdAt: "2026-03-14T09:20:00Z", about: "Owner of two family buildings in Nasirabad and Khulshi. Usually replies within a day." },
  { id: "o2", name: "Nasrin Akter", email: "nasrin.akter@example.com", phone: "01819-552301", role: "owner", verified: true, active: true, createdAt: "2026-04-02T11:00:00Z", about: "Manages a ladies' hostel and a few flats in Dhanmondi and Mohammadpur." },
  { id: "o3", name: "Kamal Hossain", email: "kamal.hossain@example.com", phone: "01912-778410", role: "owner", verified: false, active: true, createdAt: "2026-06-18T15:45:00Z", about: "Lets out rooms near Zindabazar and Amberkhana for students and job holders." },
  { id: "o4", name: "Farzana Chowdhury", email: "farzana.chowdhury@example.com", phone: "01611-903377", role: "owner", verified: true, active: true, createdAt: "2026-02-09T08:30:00Z", about: "Family-run apartments in Chattogram and Cox's Bazar." },
  { id: "o5", name: "Abdul Karim", email: "abdul.karim@example.com", phone: "01556-118204", role: "owner", verified: false, active: true, createdAt: "2026-07-22T10:10:00Z", about: "Student mess and sublets near university areas in Rajshahi and Khulna." },
  { id: "o6", name: "Shirin Sultana", email: "shirin.sultana@example.com", phone: "01733-640918", role: "owner", verified: true, active: true, createdAt: "2026-05-05T13:25:00Z", about: "Apartments in Uttara, Bashundhara and Mymensingh town." },
  { id: "c1", name: "Tanvir Ahmed", email: "tanvir.ahmed@example.com", phone: "01818-334512", role: "client", verified: false, active: true, createdAt: "2026-08-11T07:40:00Z", about: "" },
  { id: "c2", name: "Sadia Islam", email: "sadia.islam@example.com", phone: "01922-417765", role: "client", verified: false, active: true, createdAt: "2026-09-01T12:05:00Z", about: "" },
  { id: "c3", name: "Arif Hasan", email: "arif.hasan@example.com", phone: "01612-883049", role: "client", verified: false, active: true, createdAt: "2026-09-19T16:30:00Z", about: "" },
  { id: "c4", name: "Mehjabin Rahman", email: "mehjabin.rahman@example.com", phone: "01799-205546", role: "client", verified: false, active: false, createdAt: "2026-07-03T09:15:00Z", about: "" },
].map((user) => ({ ...user, passwordHash: null }));
