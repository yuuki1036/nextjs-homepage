import ContactForm from "components/ContactForm";
import Container from "components/Container";
import { NextPage } from "next";

const Contact: NextPage = () => {
  return (
    <Container
      pageName="Contact"
      description="開発依頼・ご相談などお気軽にお問い合わせください。"
    >
      <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-16 w-full">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
          Contact
        </h1>
        <p className="mb-16 text-gray-600 dark:text-gray-400">
          開発依頼やご相談・WEBに関する質問など、お気軽にお問い合わせください。
        </p>
        <ContactForm />
      </div>
    </Container>
  );
};

export default Contact;
