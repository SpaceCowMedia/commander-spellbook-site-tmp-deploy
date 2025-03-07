import Head from "next/head";
import Link from "next/link";
import Footer from "../components/layout/Footer/Footer";
import SearchBar from "../components/SearchBar/SearchBar";
import styles from "./index.module.scss";
import SpellbookLogo from "../components/layout/SpellbookLogo/SpellbookLogo";
import RandomButton from "../components/RandomButton/RandomButton";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import AnalyticsCookieBanner from "../components/layout/AnalyticsCookieBanner/AnalyticsCookieBanner";
import UserDropdown from "../components/layout/UserDropdown/UserDropdown";

type Props = {
  featuredComboButtonText: string;
};

const DEFAULT_PROPS = {
  props: {
    featuredComboButtonText: "Featured Combos (Mocked Data)",
  },
};

export default function Home({ featuredComboButtonText }: Props) {
  const router = useRouter();
  const query = router.query.q ? `${router.query.q}` : ``;

  useEffect(() => {
    const { status, id } = router.query;

    if (Number(query) > 0 || Number(id) > 0) {
      router.push(`/combo/${id || query}/`);
      return;
    }

    if (query === "spoiled" || status === "spoiled") {
      router.push("/search/?q=is:previewed");
      return;
    }

    if (query === "banned" || status === "banned") {
      router.push("/search/?q=is:banned");
      return;
    }

    if (!query) return;

    router.push(`/search/?q=${query}`);
  }, []);

  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: The Search Engine for EDH Combos"
        description="The Premier Magic: the Gathering Combo Search Engine for the Commander / Elder Dragon Highlander (EDH) Format."
      />
      <AnalyticsCookieBanner />
      <main>
        <div className="absolute top-5 right-5 z-20"><UserDropdown/></div>
        <div className="gradient relative z-10">
          <div
            className={`container ${styles.container} relative md:h-screen z-10`}
          >
            <div className="w-full">
              <SpellbookLogo />

              <h2 className="font-title my-1 sm:my-3 text-2xl sm:text-3xl md:text-4xl">
                The Search Engine for EDH Combos
              </h2>

              <SearchBar onHomepage className="bg-white mt-4 md:w-2/3 h-20" />

              <div className="button-links md:flex-row md:w-2/3 m-auto flex flex-col">
                <Link
                  href="/advanced-search/"
                  className={`dark ${styles.button} button md:m-1`}
                >
                  Advanced Search
                </Link>
                <Link
                  href="/syntax-guide/"
                  className={`dark ${styles.button} button md:m-1`}
                >
                  Syntax Guide
                </Link>
                <RandomButton
                  query={query}
                  className={`random-button ${styles.button} dark button md:m-1`}
                >
                  Random Combo
                </RandomButton>
              </div>

              <div className="button-links md:flex-row md:w-2/3 m-auto flex flex-col">
                <Link
                  href="/find-my-combos/"
                  className={`dark ${styles.button} button md:m-1`}
                >
                  Find My Combos
                </Link>
                <Link
                  id="featured-combos-button"
                  href="/featured/"
                  className={`previwed-combos-button dark ${styles.button} button md:m-1`}
                >
                  {featuredComboButtonText}
                </Link>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const { EDITOR_BACKEND_URL } = process.env;

  if (!EDITOR_BACKEND_URL) {
    return DEFAULT_PROPS;
  }

  const res = await fetch(`${EDITOR_BACKEND_URL}properties/?format=json`);
  const dataFromEditorBackend = await res.json();
  const buttonTextData = dataFromEditorBackend.results.find(
    (data: { key: string; value: string }) => {
      return data.key === "featured_combos_title";
    }
  );

  if (!buttonTextData) {
    return DEFAULT_PROPS;
  }

  return {
    props: {
      featuredComboButtonText: buttonTextData.value,
    },
  };
}
