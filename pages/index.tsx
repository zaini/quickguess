import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import DrawGame from "../components/DrawGame";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Quick Guess!</title>
        <meta name="description" content="Guess the word with friends!" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <h1 style={{ textAlign: "center" }}>
        <Image src="/favicon.png" height={24} width={24} /> Quick Guess!
      </h1>
      <DrawGame />
    </>
  );
};

export default Home;
