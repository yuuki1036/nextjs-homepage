import ContactForm from "components/ContactForm";
import Container from "components/Container";
import { UseLocale } from "lib/hook/useLocale";
import { NextPage } from "next";

const Contact: NextPage = () => {
  const { locale, t } = UseLocale();
  return (
    <Container pageName="Contact" description={t.CONTACT.SUMMARY}>
      <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16 w-full">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
          Contact
        </h1>
        <p className="mb-16 text-gray-600 dark:text-gray-400">
          {t.CONTACT.SUMMARY}
        </p>
        <ContactForm />
      </div>
    </Container>
  );
};

export default Contact;
