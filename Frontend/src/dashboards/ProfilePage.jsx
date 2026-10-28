import PageHeader from "../components/PageHeader";
import ProfileForm from "../components/ProfileForm";

export default function ProfilePage({ children }) {
  return (
    <>
      <PageHeader title="Profile" description="Update your contact details and password. Changes are saved to your account." />
      <ProfileForm />
      {children}
    </>
  );
}
